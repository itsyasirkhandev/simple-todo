/*
 * File Name:     useJournalQueries.ts
 * Description:   TanStack Query v5 hooks for reading Journal data.
 * Author:        Antigravity
 * Created Date:  2026-03-04
 */

'use client';

import { useQuery, useSuspenseQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query/query-keys';
import { journalService } from '../services/journal.service';

/**
 * Fetch and cache all journal entries.
 */
export function useJournalEntriesQuery() {
    return useQuery({
        queryKey: queryKeys.journal.lists(),
        queryFn: journalService.getAll,
    });
}

/**
 * Suspense-enabled version of useJournalEntriesQuery.
 */
export function useJournalEntriesSuspenseQuery() {
    return useSuspenseQuery({
        queryKey: queryKeys.journal.lists(),
        queryFn: journalService.getAll,
    });
}

/**
 * Fetch a single journal entry by ID.
 */
export function useJournalEntryQuery(id: string) {
    return useQuery({
        queryKey: queryKeys.journal.detail(id),
        queryFn: () => journalService.getById(id),
        enabled: Boolean(id),
    });
}
