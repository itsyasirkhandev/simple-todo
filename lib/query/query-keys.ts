/*
 * File Name:     query-keys.ts
 * Description:   Centralised, typed query key factories.
 *                Structured key tuples allow precise cache invalidation
 *                and are refactor-safe (no magic strings scattered around).
 * Author:        Antigravity
 * Created Date:  2026-03-04
 */

export const queryKeys = {
    todos: {
        /** Matches ALL todo-related cache entries */
        all: () => ['todos'] as const,
        /** Matches the flat list of todos */
        lists: () => ['todos', 'list'] as const,
        /** Matches todos filtered by a specific Eisenhower priority quadrant */
        byPriority: (priority: string) => ['todos', 'list', { priority }] as const,
        /** Matches a single todo detail */
        detail: (id: string) => ['todos', 'detail', id] as const,
    },
    journal: {
        /** Matches ALL journal-related cache entries */
        all: () => ['journal'] as const,
        /** Matches the flat list of journal entries */
        lists: () => ['journal', 'list'] as const,
        /** Matches a single journal entry detail */
        detail: (id: string) => ['journal', 'detail', id] as const,
    },
    auth: {
        /** Matches the current user session */
        session: () => ['auth', 'session'] as const,
    },
} as const;
