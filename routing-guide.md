# Routing & Lazy Loading Guide

This document outlines the standard architecture for routing and lazy loading in this Next.js 16 App Router template.

**AI Agents & Developers**: Always follow this architecture when creating new pages or features.

---

## 1. Core Routing Architecture

We use a feature-based scalable routing architecture optimized for the Next.js App Router.

1.  **Centralized Route Registry (`constants/routes.ts`)**: A single file housing all application URLs. Hardcoding strings like `href="/dashboard"` OR hashtag fragments like `href="#section"` is STRICTLY PROHIBITED.
2.  **Feature-based Route Groups (`app/(feature)/`)**: Next.js route groups are used to isolate layouts and keep the `app/` directory organized by business domain.
3.  **Thin Orchestrator Pages (`app/(feature)/path/page.tsx`)**: The actual Next.js page files do not contain business logic or complex UI.
4.  **Lazy Loaded Feature Views (`features/*/views/*.view.tsx`)**: The UI for a page is built inside a feature's `views/` folder and dynamically imported by the Next.js page explicitly for performance. 
  - **AI AGENT RULE (File Naming)**: Views MUST be named with the `.view.tsx` suffix (e.g., `DashboardOverview.view.tsx`).
  - **AI AGENT RULE (View Mandatory)**: Every App Router `page.tsx` MUST be a "Thin Orchestrator" that only dynamically imports and renders a component from a feature's `views/` directory. Hard imports of feature views in the `app/` directory are forbidden. Failure to include a `views/` folder inside a feature used by a page is a CRITICAL violation.

---

## 2. Global Route Registry

All routes must be declared in `constants/routes.ts`.

### Usage Example:
```tsx
import Link from 'next/link';
import { ROUTES } from '@/constants/routes';

export function Navigation() {
  return (
    <nav>
      <Link href={ROUTES.HOME}>Home</Link>
      <Link href={ROUTES.AUTH.LOGIN}>Login</Link>
      <Link href={ROUTES.DASHBOARD.HOME}>Dashboard</Link>
    </nav>
  );
}
```

---

## 3. Creating a New Route (Feature-Based Lazy Loading)

When adding a new route (e.g., a Login page), follow this exact flow:

### Step 1: Add to Route Registry
Add the new path to `constants/routes.ts` if it doesn't already exist.

### Step 2: Create the Feature View
The actual page content belongs in the `features` directory as a "view".

**Location**: `features/auth/views/LoginView.tsx`
```tsx
'use client'
import { LoginForm } from '../components/LoginForm';

export default function LoginView() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1>Welcome Back</h1>
      <LoginForm />
    </div>
  );
}
```

### Step 3: Create the Thin Orchestrator Page (Lazy Loaded)
Create the Next.js App Router file using a Route Group layer. Use `next/dynamic` to lazy load the view. This minimizes the initial Javascript bundle size.

**Location**: `app/(auth)/login/page.tsx`
```tsx
import dynamic from 'next/dynamic';
import { ROUTES } from '@/constants/routes';

// 1. Lazy load the feature view
// This ensures the JS for LoginView is only loaded when this page is visited
const LoginView = dynamic(() => import('@/features/auth/views/LoginView'), {
  loading: () => <p>Loading login module...</p>, // Optional skeleton/spinner
});

// 2. Export standard Next.js metadata
export const metadata = {
  title: 'Login',
  description: 'Sign in to your account',
};

// 3. Thin orchestrator simply renders the view
export default function LoginPage() {
  return <LoginView />;
}
```

---

## 4. Shared Layout Shells

Use Next.js Route Groups to apply specific layouts to groups of features without affecting the URL structure.

For example, all dashboard pages might share a sidebar:

**Location**: `app/(dashboard)/layout.tsx`
```tsx
import { Sidebar } from '@/components/layout/Sidebar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
```

Files under `app/(dashboard)/` will automatically inherit this layout, while files under `app/(auth)/` will not.

---

## 5. Routing Error Handling

To ensure a robust user experience, the application must handle unexpected navigation states gracefully using Next.js special files.

### 5.1 Page Not Found (404)
When a user visits a non-existent route, Next.js looks for `not-found.tsx`.
- **Global 404**: Place `app/not-found.tsx` at the root.
- **Implementation**: Instead of building the UI in `app/not-found.tsx`, create a lazy-loaded view in `features/core/views/NotFoundView.tsx` and import it using `next/dynamic`.

### 5.2 Unauthorized / Forbidden (401 / 403)
When a user attempts to access a protected route without permissions.
- **Usage**: Call the Next.js `unauthorized()` or `forbidden()` functions inside your Server Component or layout.
- **Handling**: Create `app/unauthorized.tsx` or `app/forbidden.tsx`.
- **Implementation**: Lazy load the UI (e.g., `features/auth/views/UnauthorizedView.tsx`) to keep the bundle small.

### 5.3 Lazy Loading Failures & Unexpected Runtime Errors
If `next/dynamic` fails to load a chunk (e.g., due to a network drop or a bad deployment), or if a Server Component throws an unexpected error during rendering, Next.js catches it in `error.tsx`.

- **Global Error Handling**: Place `app/error.tsx`. Note that `error.tsx` must be a Client Component (`'use client'`).
- **Implementation**:
```tsx
// app/error.tsx
'use client' // Error components must be Client Components

import { useEffect } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Optionally log the error to an error reporting service
    console.error(error)
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h2>Something went wrong!</h2>
      <button onClick={() => reset()}>Try again</button>
    </div>
  )
}
```

---

## 6. Summary Checklist for AI Agents

When asked to "create a new page" or "add a new route":
1.  **Define**: Map the path in `constants/routes.ts`.
2.  **Build View**: Create the UI in `features/<feature>/views/<Name>View.tsx`.
3.  **Lazy Route**: Create the Next.js route file (e.g., `app/(group)/path/page.tsx`) and use `next/dynamic` to import the view.
4.  **Error States**: Ensure appropriate use of `notFound()`, `unauthorized()`, or `forbidden()` for edge cases.
