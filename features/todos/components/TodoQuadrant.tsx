/*
 * File Name:     TodoQuadrant.tsx
 * Description:   A single quadrant of the Eisenhower Matrix.
 * Author:        Antigravity
 * Created Date:  2026-02-28
 */

"use client"

import React from 'react'
import { Todo } from '../types/todo.types'
import { TodoItem } from './TodoItem'
import { Droppable } from '@hello-pangea/dnd'
import { cn } from '@/lib/utils'
import { AlertCircle, Zap, Target, Cloud } from 'lucide-react'

/**
 * Props for the TodoQuadrant component.
 * @property {string} title - The header text for the quadrant.
 * @property {TodoPriority} type - The matrix priority level.
 * @property {Todo[]} todos - List of tasks in this quadrant.
 * @property {Function} onToggle - Logic for checking/unchecking.
 * @property {Function} onDelete - Logic for removing a task.
 * @property {Function} onEdit - Logic for updating task data.
 */
interface TodoQuadrantProps {
    title: string
    type: 'urgent-important' | 'urgent-unimportant' | 'unurgent-important' | 'unurgent-unimportant'
    todos: Todo[]
    onToggle: (id: string) => void
    onDelete: (id: string) => void
    onEdit: (id: string, data: Partial<Todo>) => void
    onTrackDaily?: (todo: Todo) => void
    isDragDisabled?: boolean
}

const icons = {
    'urgent-important': <AlertCircle className="h-5 w-5 text-destructive" />,
    'urgent-unimportant': <Zap className="h-5 w-5 text-accent" />,
    'unurgent-important': <Target className="h-5 w-5 text-primary" />,
    'unurgent-unimportant': <Cloud className="h-5 w-5 text-muted-foreground" />,
}

/**
 * A container for a group of tasks belonging to a specific Eisenhower quadrant.
 * @param {TodoQuadrantProps} props - Component properties.
 * @returns {JSX.Element} The rendered quadrant component.
 */
export function TodoQuadrant({ title, type, todos, onToggle, onDelete, onEdit, onTrackDaily, isDragDisabled }: TodoQuadrantProps) {
    return (
        <div className={cn(
            "flex flex-col h-full min-h-96 rounded-none p-6 border-4 transition-all duration-300 overflow-hidden bg-background shadow-xl",
            type === 'urgent-important' && "border-destructive",
            type === 'urgent-unimportant' && "border-accent",
            type === 'unurgent-important' && "border-primary",
            type === 'unurgent-unimportant' && "border-muted"
        )}>
            <div className={cn(
                "mb-6 border-b-4 pb-4 transition-colors",
                type === 'urgent-important' && "border-destructive",
                type === 'urgent-unimportant' && "border-accent",
                type === 'unurgent-important' && "border-primary",
                type === 'unurgent-unimportant' && "border-muted"
            )}>
                <div className="flex items-center gap-4">
                    {icons[type]}
                    <h2 className="text-2xl font-semibold tracking-tighter uppercase font-serif text-foreground break-words leading-none">{title}</h2>
                </div>
            </div>

            <Droppable droppableId={type} isDropDisabled={isDragDisabled}>
                {(provided, snapshot) => (
                    <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={cn(
                            "flex-1 overflow-y-auto pr-2 space-y-1 scrollbar-thin scrollbar-thumb-primary/20",
                            snapshot.isDraggingOver && "bg-black/5 dark:bg-white/5 rounded-xl transition-colors"
                        )}
                    >
                        {todos.length > 0 ? (
                            todos.map((todo, index) => (
                                <TodoItem
                                    key={todo.id}
                                    todo={todo}
                                    index={index}
                                    onToggle={onToggle}
                                    onDelete={onDelete}
                                    onEdit={onEdit}
                                    onTrackDaily={onTrackDaily}
                                    isDragDisabled={isDragDisabled}
                                />
                            ))
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full opacity-30 text-center py-8">
                                <p className="text-sm font-mono uppercase tracking-widest">No tasks yet</p>
                            </div>
                        )}
                        {provided.placeholder}
                    </div>
                )}
            </Droppable>
        </div>
    )
}
