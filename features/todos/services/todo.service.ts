/*
 * File Name:     todo.service.ts
 * Description:   Pure async functions used as queryFn / mutationFn by TanStack Query.
 *                All network calls go through the shared apiFetch wrapper.
 * Author:        Antigravity
 * Created Date:  2026-03-04
 */

import { apiFetch } from '@/lib/api/base-service';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import type { Todo } from '../types/todo.types';
import type { TodoFormValues } from '../schemas/todo.schema';

export const todoService = {
    /**
     * Fetch the full list of todos from the server.
     */
    getAll: (): Promise<Todo[]> =>
        apiFetch<Todo[]>(API_ENDPOINTS.TODOS.LIST),

    /**
     * Fetch a single todo by ID.
     */
    getById: (id: string): Promise<Todo> =>
        apiFetch<Todo>(API_ENDPOINTS.TODOS.DETAIL(id)),

    /**
     * Create a new todo.
     */
    create: (data: TodoFormValues): Promise<Todo> =>
        apiFetch<Todo>(API_ENDPOINTS.TODOS.CREATE, {
            method: 'POST',
            body: JSON.stringify(data),
        }),

    /**
     * Partially update an existing todo.
     */
    update: (id: string, data: Partial<Todo>): Promise<Todo> =>
        apiFetch<Todo>(API_ENDPOINTS.TODOS.DETAIL(id), {
            method: 'PATCH',
            body: JSON.stringify(data),
        }),

    /**
     * Delete a todo by ID.
     */
    delete: (id: string): Promise<void> =>
        apiFetch<void>(API_ENDPOINTS.TODOS.DETAIL(id), {
            method: 'DELETE',
        }),
};
