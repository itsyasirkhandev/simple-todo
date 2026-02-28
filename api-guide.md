# API & Data Fetching Guide

This document outlines the standard architecture for making external or internal API calls in this Next.js 16 App Router application.

**AI Agents & Developers**: Always follow this architecture when instructed to build features that consume APIs. Do NOT use `useEffect` for data fetching.

---

## 1. Core Architecture Pattern

Our API architecture is split into 4 layers to ensure scalability and maintainability:

1.  **Endpoints Registry (`lib/api/endpoints.ts`)**: A single file housing all API URLs.
2.  **Base Service wrapper (`lib/api/base-service.ts`)**: A wrapper around native `fetch` handling auth, base URLs, and standardizing errors.
3.  **Feature Service (`features/*/services/*.service.ts`)**: Domain-specific API calls built on top of the base service.
4.  **Components/Actions (`features/*/components/*.tsx`)**: Next.js Server Components for reading data and Server Actions for mutating data.

---

## 2. Global API Utilities

When generating code to fetch data, ensure these two files exist. If they do not, create them using the templates below.

### 2.1 `lib/api/endpoints.ts`

Maintain all API routes here as constants.

```typescript
/*
 * File Name:     endpoints.ts
 * Description:   Central registry for all API paths to prevent typos and ease refactoring.
 */

// Example: API Base URls
// Usually sourced from env vars, e.g., process.env.NEXT_PUBLIC_API_URL
export const BASE_URL = '' 

export const API_ENDPOINTS = {
  // Example Endpoints
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
  },
  USERS: {
    LIST: '/users',
    DETAIL: (id: string) => `/users/${id}`,
  }
} as const;
```

### 2.2 `lib/api/base-service.ts`

Always use a wrapper around `fetch` instead of using `fetch` or `axios` directly in feature services.

```typescript
/*
 * File Name:     base-service.ts
 * Description:   Core fetch wrapper for standardized API requests and error handling.
 */

interface FetchOptions extends RequestInit {
  // Add custom options here if needed, like 'requiresAuth'
}

/**
 * Standard API error class to allow consistent throw/catch flows
 */
export class ApiError extends Error {
  constructor(public status: number, public message: string, public data?: any) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * Core fetch wrapper
 */
export async function apiFetch<T>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<T> {
  const { headers, ...customOptions } = options;

  const config: RequestInit = {
    ...customOptions,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
  };

  try {
    const response = await fetch(endpoint, config);
    const data = await response.json().catch(() => null);

    if (!response.ok) {
        throw new ApiError(
            response.status, 
            data?.message || 'An error occurred during the request.',
            data
        );
    }

    return data as T;
  } catch (error) {
    if (error instanceof ApiError) {
        throw error; // Re-throw recognized API errors
    }
    // Handle network errors or parsing errors
    throw new ApiError(500, 'Network error or unable to parse response');
  }
}
```

---

## 3. Feature Services

When building a specific feature (e.g., `users`), strictly define a service class or set of functions within that feature's folder using `apiFetch` and `API_ENDPOINTS`.

**Location**: `features/<feature_name>/services/<feature_name>.service.ts`

```typescript
/*
 * File Name:     userService.ts
 * Description:   Service containing all API interactions for the User domain.
 */
import { apiFetch } from '@/lib/api/base-service';
import { API_ENDPOINTS, BASE_URL } from '@/lib/api/endpoints';

// Always type your responses
export interface User {
  id: string;
  name: string;
  email: string;
}

export const userService = {
  getUsers: async (): Promise<User[]> => {
    return apiFetch<User[]>(`${BASE_URL}${API_ENDPOINTS.USERS.LIST}`, {
        // Next.js specific caching options can go here
        next: { revalidate: 3600 } 
    });
  },
  
  getUserById: async (id: string): Promise<User> => {
     return apiFetch<User>(`${BASE_URL}${API_ENDPOINTS.USERS.DETAIL(id)}`);
  }
};
```

---

## 4. Consuming APIs in Next.js 16

### 4.1 NO `useEffect` Fetching

**Rule**: Never fetch data using `useEffect` on the client. It leads to waterfalls, poor UX, and bypasses the Next.js App Router caching mechanisms. **AI AGENT RULE:** If you write `useEffect` that calls an API service, you have failed. Use Server Components or Actions.

### 4.2 Reading Data: Server Components

Always default to making components `async` Server Components when reading data.

```tsx
import { userService } from '@/features/users/services/user.service';

// 1. Component must be async
export default async function UserList() {
  // 2. Await the service directly inside the component body
  // Next.js cache will manage duplicate requests naturally
  const users = await userService.getUsers();

  return (
    <ul>
      {users.map(user => <li key={user.id}>{user.name}</li>)}
    </ul>
  );
}
```

### 4.3 Mutating Data: Server Actions & Toasts

When submitting forms or mutating data, use Next.js Server Actions combined with `react-hook-form` and `sonner` for toasts. See section 5 below for the complete error handling flow.

---

## 5. Scalable API Error Handling

We follow a strict 4-step flow for handling API errors reliably across the application using `sonner` toast notifications.

### 5.1 Throw API Error from Service Layer

The base service automatically throws an `ApiError` if `!response.ok`. However, you can also throw domain-specific errors manually in your feature service if validation fails before reaching the API, or to explicitly map API error messages.

**Location**: `features/users/services/user.service.ts`
```typescript
import { apiFetch, ApiError } from '@/lib/api/base-service';

export const userService = {
  createUser: async (data: any) => {
    if (!data.email.includes('@')) {
      // Throw explicitly before network request
      throw new ApiError(400, "Invalid email format");
    }
    
    // apiFetch throws ApiError internally if response status is not 2xx
    return apiFetch(`${BASE_URL}${API_ENDPOINTS.USERS.LIST}`, {
        method: 'POST',
        body: JSON.stringify(data)
    });
  }
}
```

### 5.2 Catch API Error in Server Action

Next.js Server Actions act as the bridge between the client component and the server service. Since you cannot pass raw JavaScript `Error` objects from the server to the client, you **must catch** the `ApiError` here and return a plain object containing the error message.

**Location**: `features/users/actions/user.actions.ts`
```typescript
'use server'
import { userService } from '../services/user.service';
import { revalidatePath } from 'next/cache';

export async function createUserAction(data: { name: string, email: string }) {
    try {
        await userService.createUser(data);
        
        revalidatePath('/users');
        
        // Return success state
        return { success: true };
    } catch (error: any) {
        // CATCH: Return stringified error to the client
        return { 
            success: false, 
            error: error.message || "An unexpected error occurred" 
        };
    }
}
```

### 5.3 Handle API Error in Component
### 5.4 Display Error Message Toast

In the Client Component, evaluate the `success` field returned from the Server Action. Use `sonner`'s `toast.error` to display the caught error message visibly to the user.

**Location**: `features/users/components/UserForm.tsx`
```tsx
'use client'
import { toast } from 'sonner';
import { useTransition } from 'react';
import { createUserAction } from '../actions/user.actions';

export function UserForm() {
    const [isPending, startTransition] = useTransition();

    const onSubmit = (data: any) => {
        startTransition(async () => {
            // HANDLE: Await the action
            const result = await createUserAction(data);
            
            // EVALUATE
            if (result.success) {
                toast.success("User created successfully!");
            } else {
                // DISPLAY SCALABLE TOAST
                toast.error(result.error);
            }
        });
    }

    return (
        <form action={() => onSubmit({ name: "Test", email: "test@test.com" })}>
            {/* Form fields... */}
            <button disabled={isPending}>Submit</button>
        </form>
    );
}
```
