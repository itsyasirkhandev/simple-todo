/*
 * File Name:     journal.service.ts
 * Description:   Pure async functions used as queryFn / mutationFn by TanStack Query.
 *                All network calls go through the shared apiFetch wrapper.
 * Author:        Antigravity
 * Created Date:  2026-03-04
 */

import { apiFetch } from '@/lib/api/base-service';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import type { JournalEntry } from '../types/journal.types';

export interface CreateJournalEntryData {
    title: string;
    date: string;
    content: string;
}

export interface UpdateJournalEntryData {
    title?: string;
    date?: string;
    content?: string;
}

export const journalService = {
    /**
     * Fetch all journal entries from the server.
     */
    getAll: (): Promise<JournalEntry[]> =>
        apiFetch<JournalEntry[]>(API_ENDPOINTS.JOURNAL.LIST),

    /**
     * Fetch a single journal entry by ID.
     */
    getById: (id: string): Promise<JournalEntry> =>
        apiFetch<JournalEntry>(API_ENDPOINTS.JOURNAL.DETAIL(id)),

    /**
     * Create a new journal entry.
     */
    create: (data: CreateJournalEntryData): Promise<JournalEntry> =>
        apiFetch<JournalEntry>(API_ENDPOINTS.JOURNAL.CREATE, {
            method: 'POST',
            body: JSON.stringify(data),
        }),

    /**
     * Partially update an existing journal entry.
     */
    update: (id: string, data: UpdateJournalEntryData): Promise<JournalEntry> =>
        apiFetch<JournalEntry>(API_ENDPOINTS.JOURNAL.DETAIL(id), {
            method: 'PATCH',
            body: JSON.stringify(data),
        }),

    /**
     * Delete a journal entry by ID.
     */
    delete: (id: string): Promise<void> =>
        apiFetch<void>(API_ENDPOINTS.JOURNAL.DETAIL(id), {
            method: 'DELETE',
        }),
};
