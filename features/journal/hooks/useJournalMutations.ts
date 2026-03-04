/*
 * File Name:     useJournalMutations.ts
 * Description:   TanStack Query v5 mutation hooks for creating, updating,
 *                and deleting journal entries, with optimistic updates.
 * Author:        Antigravity
 * Created Date:  2026-03-04
 */

'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { queryKeys } from '@/lib/query/query-keys';
import { journalService, type CreateJournalEntryData, type UpdateJournalEntryData } from '../services/journal.service';
import type { JournalEntry } from '../types/journal.types';

// ---------------------------------------------------------------------------
// CREATE
// ---------------------------------------------------------------------------

/**
 * Create a new journal entry with an optimistic UI update.
 */
export function useCreateJournalEntry() {
    const queryClient = useQueryClient();
    const listKey = queryKeys.journal.lists();

    return useMutation({
        mutationFn: journalService.create,

        onMutate: async (newEntry: CreateJournalEntryData) => {
            await queryClient.cancelQueries({ queryKey: listKey });
            const previous = queryClient.getQueryData<JournalEntry[]>(listKey);

            queryClient.setQueryData<JournalEntry[]>(listKey, (old = []) => [
                {
                    id: `optimistic-${crypto.randomUUID()}`,
                    title: newEntry.title,
                    date: newEntry.date,
                    content: newEntry.content,
                    createdAt: Date.now(),
                    updatedAt: Date.now(),
                },
                ...old,
            ]);

            return { previous };
        },

        onError: (_err, _vars, context) => {
            if (context?.previous !== undefined) {
                queryClient.setQueryData(listKey, context.previous);
            }
            toast.error('Failed to create journal entry.');
        },

        onSuccess: (created) => {
            toast.success(`Entry "${created.title}" saved!`);
        },

        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: listKey });
        },
    });
}

// ---------------------------------------------------------------------------
// UPDATE
// ---------------------------------------------------------------------------

/**
 * Update a journal entry partially with optimistic patching.
 */
export function useUpdateJournalEntry() {
    const queryClient = useQueryClient();
    const listKey = queryKeys.journal.lists();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdateJournalEntryData }) =>
            journalService.update(id, data),

        onMutate: async ({ id, data }) => {
            await queryClient.cancelQueries({ queryKey: listKey });
            const previous = queryClient.getQueryData<JournalEntry[]>(listKey);

            queryClient.setQueryData<JournalEntry[]>(listKey, (old = []) =>
                old.map((entry) =>
                    entry.id === id
                        ? { ...entry, ...data, updatedAt: Date.now() }
                        : entry
                )
            );

            // Also patch the detail cache if it exists
            queryClient.setQueryData<JournalEntry>(
                queryKeys.journal.detail(id),
                (old) => (old ? { ...old, ...data, updatedAt: Date.now() } : old)
            );

            return { previous };
        },

        onError: (_err, _vars, context) => {
            if (context?.previous !== undefined) {
                queryClient.setQueryData(listKey, context.previous);
            }
            toast.error('Failed to update journal entry.');
        },

        onSettled: (_data, _err, { id }) => {
            queryClient.invalidateQueries({ queryKey: listKey });
            queryClient.invalidateQueries({ queryKey: queryKeys.journal.detail(id) });
        },
    });
}

// ---------------------------------------------------------------------------
// DELETE
// ---------------------------------------------------------------------------

/**
 * Delete a journal entry with optimistic removal.
 */
export function useDeleteJournalEntry() {
    const queryClient = useQueryClient();
    const listKey = queryKeys.journal.lists();

    return useMutation({
        mutationFn: journalService.delete,

        onMutate: async (id: string) => {
            await queryClient.cancelQueries({ queryKey: listKey });
            const previous = queryClient.getQueryData<JournalEntry[]>(listKey);
            const deleted = previous?.find((e) => e.id === id);

            queryClient.setQueryData<JournalEntry[]>(listKey, (old = []) =>
                old.filter((e) => e.id !== id)
            );

            return { previous, deletedTitle: deleted?.title };
        },

        onError: (_err, _vars, context) => {
            if (context?.previous !== undefined) {
                queryClient.setQueryData(listKey, context.previous);
            }
            toast.error('Failed to delete journal entry.');
        },

        onSuccess: (_data, _id, context) => {
            if (context?.deletedTitle) {
                toast.success(`Entry "${context.deletedTitle}" deleted!`);
            }
        },

        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: listKey });
        },
    });
}
