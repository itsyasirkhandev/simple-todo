/*
 * File Name:     page.tsx
 * Description:   Journal list route with SSR prefetching via HydrationBoundary.
 *                Journal entries are fetched on the server so the client
 *                receives hydrated data immediately — zero loading flash.
 * Author:        Antigravity
 * Created Date:  2026-02-28
 */

import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query/query-keys';
import { journalService } from '@/features/journal/services/journal.service';
import dynamic from 'next/dynamic';

const JournalListView = dynamic(
    () => import('@/features/journal').then((mod) => mod.JournalListView),
    { ssr: true }
);

/**
 * The journal list page route (/journal).
 * Prefetches journal entries on the server and passes the dehydrated cache
 * to the client via HydrationBoundary. The JournalListView will read
 * from the cache instantly with no loading state.
 */
export default async function JournalPage() {
    const queryClient = new QueryClient();

    await queryClient.prefetchQuery({
        queryKey: queryKeys.journal.lists(),
        queryFn: journalService.getAll,
    });

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <JournalListView />
        </HydrationBoundary>
    );
}
