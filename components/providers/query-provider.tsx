/*
 * File Name:     query-provider.tsx
 * Description:   Client-side QueryClientProvider wrapper.
 *                Rendered once in the root layout so all client components
 *                can access the query cache. Devtools are tree-shaken in
 *                production builds automatically.
 * Author:        Antigravity
 * Created Date:  2026-03-04
 */

'use client';

import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { getQueryClient } from '@/lib/query/query-client';

interface QueryProviderProps {
    children: React.ReactNode;
}

export function QueryProvider({ children }: QueryProviderProps) {
    // NOTE: We do NOT useState here intentionally.
    // getQueryClient() handles the singleton pattern internally.
    // Using useState would cause the client to be thrown away if React
    // suspends during the initial render.
    const queryClient = getQueryClient();

    return (
        <QueryClientProvider client={queryClient}>
            {children}
            {/* Devtools are automatically excluded from production builds */}
            <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
    );
}
