/*
 * File Name:     useTodoQueries.ts
 * Description:   TanStack Query v5 hooks for reading Todo data.
 *                Use these when your data lives on a server / API.
 *                For local-only localStorage state, useTodos.ts still works.
 * Author:        Antigravity
 * Created Date:  2026-03-04
 */

'use client';

import { useQuery, useSuspenseQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query/query-keys';
import { todoService } from '../services/todo.service';
import type { TodoPriority } from '../types/todo.types';

/**
 * Fetch and cache the full list of todos.
 * Returns standard useQuery shape: { data, isLoading, isError, error }.
 */
export function useTodosQuery() {
    return useQuery({
        queryKey: queryKeys.todos.lists(),
        queryFn: todoService.getAll,
    });
}

/**
 * Suspense-enabled version of useTodosQuery.
 * Wrap the component tree with a <Suspense> boundary when using this.
 */
export function useTodosSuspenseQuery() {
    return useSuspenseQuery({
        queryKey: queryKeys.todos.lists(),
        queryFn: todoService.getAll,
    });
}

/**
 * Fetch and cache todos filtered by an Eisenhower priority quadrant.
 * Uses client-side derived data from the list cache (no extra network request).
 */
export function useTodosByPriority(priority: TodoPriority) {
    return useQuery({
        queryKey: queryKeys.todos.byPriority(priority),
        queryFn: async () => {
            const all = await todoService.getAll();
            return all
                .filter((t) => t.priority === priority)
                .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
        },
    });
}

/**
 * Fetch and cache a single todo by ID.
 */
export function useTodoDetailQuery(id: string) {
    return useQuery({
        queryKey: queryKeys.todos.detail(id),
        queryFn: () => todoService.getById(id),
        enabled: Boolean(id),
    });
}
