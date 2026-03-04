/*
 * File Name:     query-client.ts
 * Description:   Singleton QueryClient factory for Next.js App Router.
 *                Always creates a fresh client on the server (per-request isolation),
 *                and reuses the same client on the browser across renders.
 * Author:        Antigravity
 * Created Date:  2026-03-04
 */

import { QueryClient, isServer } from '@tanstack/react-query';

function makeQueryClient() {
    return new QueryClient({
        defaultOptions: {
            queries: {
                // Prevent immediate re-fetch on client hydration.
                // With SSR, data was just fetched on the server, so 60s is
                // a reasonable window before treating it as stale.
                staleTime: 60 * 1000,
                // Don't refetch when the user re-focuses the window —
                // keeps the UI feel snappy.
                refetchOnWindowFocus: false,
                // Retry failed requests once before surfacing the error.
                retry: 1,
            },
            mutations: {
                // No global mutation defaults needed; each mutation site
                // handles its own error/success toasts.
            },
        },
    });
}

let browserQueryClient: QueryClient | undefined = undefined;

/**
 * Returns the QueryClient appropriate for the current environment.
 * - Server: a fresh instance per request (no state leakage between users)
 * - Browser: a singleton that persists for the lifetime of the tab
 */
export function getQueryClient(): QueryClient {
    if (isServer) {
        return makeQueryClient();
    }
    if (!browserQueryClient) {
        browserQueryClient = makeQueryClient();
    }
    return browserQueryClient;
}
