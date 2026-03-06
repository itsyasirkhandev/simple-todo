/*
 * File Name:     useTodos.ts
 * Description:   Hook for managing Todo state with LocalStorage persistence.
 *                Includes recycle bin support for soft-delete, restore, and
 *                permanent delete operations.
 * Author:        Antigravity
 * Created Date:  2026-02-28
 */

"use client"

import { useState, useEffect, useCallback, useSyncExternalStore, useRef } from 'react';
import { toast } from 'sonner';
import { Todo, TodoPriority, DeletedTodo } from '../types/todo.types';
import { TodoFormValues } from '../schemas/todo.schema';

const STORAGE_KEY = 'eisenhower-todos';
const DELETED_STORAGE_KEY = 'eisenhower-deleted-todos';

const emptySubscribe = () => () => { };

/**
 * Custom hook to manage Todo state with LocalStorage persistence.
 * Handles adding, updating, deleting, and reordering todos across quadrants.
 * Supports soft-delete (recycle bin), restore, and permanent delete.
 * 
 * @returns {object} { todos, deletedTodos, isLoaded, addTodo, updateTodo, deleteTodo, toggleTodo, getTodosByPriority, reorderTodo, restoreTodo, permanentlyDeleteTodo, emptyRecycleBin }
 */
export const useTodos = () => {
    // This safely returns false on the server and true on the client without useEffect setter
    const isClient = useSyncExternalStore(
        emptySubscribe,
        () => true,
        () => false
    );

    const [todos, setTodos] = useState<Todo[]>(() => {
        if (typeof window !== 'undefined') {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                try {
                    return JSON.parse(stored);
                } catch (e) {
                    console.error('Failed to parse todos from localStorage', e);
                }
            }
        }
        return [];
    });

    const [deletedTodos, setDeletedTodos] = useState<DeletedTodo[]>(() => {
        if (typeof window !== 'undefined') {
            const stored = localStorage.getItem(DELETED_STORAGE_KEY);
            if (stored) {
                try {
                    return JSON.parse(stored);
                } catch (e) {
                    console.error('Failed to parse deleted todos from localStorage', e);
                }
            }
        }
        return [];
    });

    const isLoaded = isClient;

    const todosRef = useRef<Todo[]>(todos);
    useEffect(() => {
        todosRef.current = todos;
    }, [todos]);

    // Sync todos to localStorage
    useEffect(() => {
        if (isLoaded) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
        }
    }, [todos, isLoaded]);

    // Sync deleted todos to localStorage
    useEffect(() => {
        if (isLoaded) {
            localStorage.setItem(DELETED_STORAGE_KEY, JSON.stringify(deletedTodos));
        }
    }, [deletedTodos, isLoaded]);

    const addTodo = useCallback((data: TodoFormValues) => {
        setTodos((prev) => {
            const priorityTodos = prev.filter(t => t.priority === data.priority);
            const maxOrder = priorityTodos.length > 0 ? Math.max(...priorityTodos.map(t => t.order || 0)) : -1;

            const newTodo: Todo = {
                id: crypto.randomUUID(),
                title: data.title,
                description: data.description,
                priority: data.priority,
                isCompleted: false,
                order: maxOrder + 1,
                createdAt: Date.now(),
                updatedAt: Date.now(),
                isDaily: data.isDaily,
                subTasks: data.subTasks && data.subTasks.length > 0 ? data.subTasks : undefined,
            };
            return [newTodo, ...prev];
        });
        toast.success(`Task "${data.title}" created!`);
    }, []);

    const updateTodo = useCallback((id: string, data: Partial<Todo>) => {
        setTodos((prev) =>
            prev.map((t) => (t.id === id ? { ...t, ...data, updatedAt: Date.now() } : t))
        );
    }, []);

    // Soft delete — move to recycle bin
    const deleteTodo = useCallback((id: string) => {
        const todo = todosRef.current.find((t: Todo) => t.id === id);
        if (todo) {
            // Move to recycle bin
            setDeletedTodos((prev) => [
                { todo: { ...todo }, deletedAt: Date.now() },
                ...prev,
            ]);
            toast.success(`Task "${todo.title}" moved to recycle bin`);
        }
        setTodos((prev) => prev.filter((t) => t.id !== id));
    }, []);

    // Restore a todo from recycle bin
    const restoreTodo = useCallback((id: string) => {
        setDeletedTodos((prev) => {
            const entry = prev.find((d) => d.todo.id === id);
            if (entry) {
                setTodos((prevTodos) => [entry.todo, ...prevTodos]);
                toast.success(`Task "${entry.todo.title}" restored!`);
            }
            return prev.filter((d) => d.todo.id !== id);
        });
    }, []);

    // Permanently delete from recycle bin
    const permanentlyDeleteTodo = useCallback((id: string) => {
        setDeletedTodos((prev) => {
            const entry = prev.find((d) => d.todo.id === id);
            if (entry) {
                toast.success(`Task "${entry.todo.title}" permanently deleted`);
            }
            return prev.filter((d) => d.todo.id !== id);
        });
    }, []);

    // Empty the entire recycle bin
    const emptyRecycleBin = useCallback(() => {
        const count = deletedTodos.length;
        setDeletedTodos([]);
        toast.success(`${count} task${count !== 1 ? 's' : ''} permanently deleted`);
    }, [deletedTodos.length]);

    const toggleTodo = useCallback((id: string) => {
        setTodos((prev) =>
            prev.map((t) => (t.id === id ? { ...t, isCompleted: !t.isCompleted, updatedAt: Date.now() } : t))
        );
    }, []);

    const reorderTodo = useCallback((
        todoId: string,
        sourcePriority: TodoPriority,
        destinationPriority: TodoPriority,
        sourceIndex: number,
        destinationIndex: number
    ) => {
        setTodos((prev) => {
            const newTodos = [...prev];

            // Get all items in the exact order they currently appear in the source column
            const sourceList = newTodos
                .filter(t => t.priority === sourcePriority)
                .sort((a, b) => (a.order || 0) - (b.order || 0));

            const targetTodo = sourceList[sourceIndex];
            if (!targetTodo || targetTodo.id !== todoId) return prev; // Sanity check

            if (sourcePriority === destinationPriority) {
                // Moving within the same column
                const list = [...sourceList];
                list.splice(sourceIndex, 1);
                list.splice(destinationIndex, 0, targetTodo);

                // Update orders for this column
                list.forEach((t, i) => {
                    const idx = newTodos.findIndex(nt => nt.id === t.id);
                    if (idx !== -1) {
                        newTodos[idx] = { ...newTodos[idx], order: i, updatedAt: Date.now() };
                    }
                });
            } else {
                // Moving to a different column
                const destList = newTodos
                    .filter(t => t.priority === destinationPriority)
                    .sort((a, b) => (a.order || 0) - (b.order || 0));

                const sourceListCopy = [...sourceList];
                sourceListCopy.splice(sourceIndex, 1);

                const destListCopy = [...destList];
                destListCopy.splice(destinationIndex, 0, { ...targetTodo, priority: destinationPriority });

                // Update source collection
                sourceListCopy.forEach((t, i) => {
                    const idx = newTodos.findIndex(nt => nt.id === t.id);
                    if (idx !== -1) {
                        newTodos[idx] = { ...newTodos[idx], order: i, updatedAt: Date.now() };
                    }
                });

                // Update dest collection
                destListCopy.forEach((t, i) => {
                    const idx = newTodos.findIndex(nt => nt.id === t.id);
                    if (idx !== -1) {
                        newTodos[idx] = { ...newTodos[idx], priority: destinationPriority, order: i, updatedAt: Date.now() };
                    }
                });
            }

            return newTodos;
        });
    }, []);

    const getTodosByPriority = useCallback((priority: TodoPriority) => {
        return todos
            .filter((t) => t.priority === priority)
            .sort((a, b) => (a.order || 0) - (b.order || 0));
    }, [todos]);

    return {
        todos,
        deletedTodos,
        isLoaded,
        addTodo,
        updateTodo,
        deleteTodo,
        toggleTodo,
        getTodosByPriority,
        reorderTodo,
        restoreTodo,
        permanentlyDeleteTodo,
        emptyRecycleBin,
    };
};
