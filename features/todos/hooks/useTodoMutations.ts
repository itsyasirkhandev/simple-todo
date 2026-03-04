/*
 * File Name:     useTodoMutations.ts
 * Description:   TanStack Query v5 mutation hooks for creating, updating,
 *                deleting, toggling, and reordering todos.
 *                All mutations perform optimistic updates for instant UI feedback
 *                and roll back automatically on server error.
 * Author:        Antigravity
 * Created Date:  2026-03-04
 */

'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { queryKeys } from '@/lib/query/query-keys';
import { todoService } from '../services/todo.service';
import type { Todo, TodoPriority } from '../types/todo.types';
import type { TodoFormValues } from '../schemas/todo.schema';

// ---------------------------------------------------------------------------
// CREATE
// ---------------------------------------------------------------------------

/**
 * Create a new todo with an optimistic UI update.
 * Adds the todo to the cache immediately; rolls back if the server rejects it.
 */
export function useCreateTodo() {
    const queryClient = useQueryClient();
    const listKey = queryKeys.todos.lists();

    return useMutation({
        mutationFn: todoService.create,

        onMutate: async (newTodo: TodoFormValues) => {
            // Cancel any in-flight re-fetches so they don't overwrite our optimistic data
            await queryClient.cancelQueries({ queryKey: listKey });

            // Snapshot the previous value for rollback
            const previous = queryClient.getQueryData<Todo[]>(listKey);

            // Optimistically insert the new todo at the top of the list
            queryClient.setQueryData<Todo[]>(listKey, (old = []) => {
                const priorityTodos = old.filter((t) => t.priority === newTodo.priority);
                const maxOrder =
                    priorityTodos.length > 0
                        ? Math.max(...priorityTodos.map((t) => t.order ?? 0))
                        : -1;

                const optimistic: Todo = {
                    id: `optimistic-${crypto.randomUUID()}`,
                    title: newTodo.title,
                    description: newTodo.description,
                    priority: newTodo.priority as TodoPriority,
                    isCompleted: false,
                    order: maxOrder + 1,
                    createdAt: Date.now(),
                    updatedAt: Date.now(),
                    isDaily: newTodo.isDaily ?? false,
                    subTasks: newTodo.subTasks,
                };
                return [optimistic, ...old];
            });

            return { previous };
        },

        onError: (_err, _vars, context) => {
            // Roll back to the snapshot
            if (context?.previous !== undefined) {
                queryClient.setQueryData(listKey, context.previous);
            }
            toast.error('Failed to create task. Please try again.');
        },

        onSuccess: (created) => {
            toast.success(`Task "${created.title}" created!`);
        },

        onSettled: () => {
            // Always sync with the server after a mutation
            queryClient.invalidateQueries({ queryKey: listKey });
        },
    });
}

// ---------------------------------------------------------------------------
// UPDATE
// ---------------------------------------------------------------------------

/**
 * Partially update a todo.
 * Applies the patch optimistically and rolls back on failure.
 */
export function useUpdateTodo() {
    const queryClient = useQueryClient();
    const listKey = queryKeys.todos.lists();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<Todo> }) =>
            todoService.update(id, data),

        onMutate: async ({ id, data }) => {
            await queryClient.cancelQueries({ queryKey: listKey });
            const previous = queryClient.getQueryData<Todo[]>(listKey);

            queryClient.setQueryData<Todo[]>(listKey, (old = []) =>
                old.map((t) =>
                    t.id === id ? { ...t, ...data, updatedAt: Date.now() } : t
                )
            );

            return { previous };
        },

        onError: (_err, _vars, context) => {
            if (context?.previous !== undefined) {
                queryClient.setQueryData(listKey, context.previous);
            }
            toast.error('Failed to update task.');
        },

        onSettled: (_data, _err, { id }) => {
            queryClient.invalidateQueries({ queryKey: listKey });
            queryClient.invalidateQueries({ queryKey: queryKeys.todos.detail(id) });
        },
    });
}

// ---------------------------------------------------------------------------
// TOGGLE COMPLETION
// ---------------------------------------------------------------------------

/**
 * Toggle the `isCompleted` field of a todo.
 * Convenience wrapper around useUpdateTodo with optimistic UI.
 */
export function useToggleTodo() {
    const queryClient = useQueryClient();
    const listKey = queryKeys.todos.lists();

    return useMutation({
        mutationFn: (id: string) => {
            const todos = queryClient.getQueryData<Todo[]>(listKey) ?? [];
            const todo = todos.find((t) => t.id === id);
            return todoService.update(id, { isCompleted: !todo?.isCompleted });
        },

        onMutate: async (id: string) => {
            await queryClient.cancelQueries({ queryKey: listKey });
            const previous = queryClient.getQueryData<Todo[]>(listKey);

            queryClient.setQueryData<Todo[]>(listKey, (old = []) =>
                old.map((t) =>
                    t.id === id
                        ? { ...t, isCompleted: !t.isCompleted, updatedAt: Date.now() }
                        : t
                )
            );

            return { previous };
        },

        onError: (_err, _vars, context) => {
            if (context?.previous !== undefined) {
                queryClient.setQueryData(listKey, context.previous);
            }
            toast.error('Failed to update task.');
        },

        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: listKey });
        },
    });
}

// ---------------------------------------------------------------------------
// DELETE
// ---------------------------------------------------------------------------

/**
 * Delete a todo with an optimistic removal.
 * Shows a success toast with the task title, rolls back on failure.
 */
export function useDeleteTodo() {
    const queryClient = useQueryClient();
    const listKey = queryKeys.todos.lists();

    return useMutation({
        mutationFn: todoService.delete,

        onMutate: async (id: string) => {
            await queryClient.cancelQueries({ queryKey: listKey });
            const previous = queryClient.getQueryData<Todo[]>(listKey);

            // Find the title before we remove it for the success toast
            const deleted = previous?.find((t) => t.id === id);

            queryClient.setQueryData<Todo[]>(listKey, (old = []) =>
                old.filter((t) => t.id !== id)
            );

            return { previous, deletedTitle: deleted?.title };
        },

        onError: (_err, _vars, context) => {
            if (context?.previous !== undefined) {
                queryClient.setQueryData(listKey, context.previous);
            }
            toast.error('Failed to delete task.');
        },

        onSuccess: (_data, _id, context) => {
            if (context?.deletedTitle) {
                toast.success(`Task "${context.deletedTitle}" deleted!`);
            }
        },

        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: listKey });
        },
    });
}

// ---------------------------------------------------------------------------
// REORDER
// ---------------------------------------------------------------------------

/**
 * Reorder a todo within or across Eisenhower quadrants.
 * Applies the reorder optimistically; the server call persists the new order array.
 */
export function useReorderTodo() {
    const queryClient = useQueryClient();
    const listKey = queryKeys.todos.lists();

    return useMutation({
        mutationFn: ({
            todoId,
            destinationPriority,
            destinationIndex,
        }: {
            todoId: string;
            sourcePriority: TodoPriority;
            destinationPriority: TodoPriority;
            sourceIndex: number;
            destinationIndex: number;
        }) =>
            // The server receives the new priority + order for the moved item.
            todoService.update(todoId, {
                priority: destinationPriority,
                order: destinationIndex,
            }),

        onMutate: async ({ todoId, sourcePriority, destinationPriority, sourceIndex, destinationIndex }) => {
            await queryClient.cancelQueries({ queryKey: listKey });
            const previous = queryClient.getQueryData<Todo[]>(listKey);

            queryClient.setQueryData<Todo[]>(listKey, (old = []) => {
                const newTodos = [...old];

                const sourceList = newTodos
                    .filter((t) => t.priority === sourcePriority)
                    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

                const targetTodo = sourceList[sourceIndex];
                if (!targetTodo || targetTodo.id !== todoId) return old;

                if (sourcePriority === destinationPriority) {
                    const list = [...sourceList];
                    list.splice(sourceIndex, 1);
                    list.splice(destinationIndex, 0, targetTodo);
                    list.forEach((t, i) => {
                        const idx = newTodos.findIndex((nt) => nt.id === t.id);
                        if (idx !== -1) newTodos[idx] = { ...newTodos[idx], order: i };
                    });
                } else {
                    const destList = newTodos
                        .filter((t) => t.priority === destinationPriority)
                        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

                    const srcCopy = [...sourceList];
                    srcCopy.splice(sourceIndex, 1);
                    const destCopy = [...destList];
                    destCopy.splice(destinationIndex, 0, { ...targetTodo, priority: destinationPriority });

                    srcCopy.forEach((t, i) => {
                        const idx = newTodos.findIndex((nt) => nt.id === t.id);
                        if (idx !== -1) newTodos[idx] = { ...newTodos[idx], order: i };
                    });

                    destCopy.forEach((t, i) => {
                        const idx = newTodos.findIndex((nt) => nt.id === t.id);
                        if (idx !== -1)
                            newTodos[idx] = { ...newTodos[idx], priority: destinationPriority, order: i };
                    });
                }

                return newTodos;
            });

            return { previous };
        },

        onError: (_err, _vars, context) => {
            if (context?.previous !== undefined) {
                queryClient.setQueryData(listKey, context.previous);
            }
        },

        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: listKey });
        },
    });
}
