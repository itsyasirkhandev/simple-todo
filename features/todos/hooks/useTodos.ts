/*
 * File Name:     useTodos.ts
 * Description:   Hook for managing Todo state with LocalStorage persistence.
 * Author:        Antigravity
 * Created Date:  2026-02-28
 */

"use client"

import { useState, useEffect, useCallback, useSyncExternalStore, useRef } from 'react';
import { toast } from 'sonner';
import { Todo, TodoPriority } from '../types/todo.types';
import { TodoFormValues } from '../schemas/todo.schema';

const STORAGE_KEY = 'eisenhower-todos';

const emptySubscribe = () => () => { };

/**
 * Custom hook to manage Todo state with LocalStorage persistence.
 * Handles adding, updating, deleting, and reordering todos across quadrants.
 * 
 * @returns {object} { todos, isLoaded, addTodo, updateTodo, deleteTodo, toggleTodo, getTodosByPriority, reorderTodo }
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

    const isLoaded = isClient;

    const todosRef = useRef<Todo[]>(todos);
    useEffect(() => {
        todosRef.current = todos;
    }, [todos]);

    // Sync to localStorage
    useEffect(() => {
        if (isLoaded) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
        }
    }, [todos, isLoaded]);

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

    const deleteTodo = useCallback((id: string) => {
        const todo = todosRef.current.find((t: Todo) => t.id === id);
        if (todo) {
            toast.success(`Task "${todo.title}" deleted!`);
        }
        setTodos((prev) => prev.filter((t) => t.id !== id));
    }, []);

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
        isLoaded,
        addTodo,
        updateTodo,
        deleteTodo,
        toggleTodo,
        getTodosByPriority,
        reorderTodo,
    };
};
