/*
 * File Name:     base-service.ts
 * Description:   Core fetch wrapper for standardized API requests and error handling.
 * Author:        Antigravity
 * Created Date:  2026-02-27
 */

type FetchOptions = RequestInit;

/**
 * Standard API error class to allow consistent throw/catch flows
 */
export class ApiError extends Error {
    constructor(public status: number, public message: string, public data?: unknown) {
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
