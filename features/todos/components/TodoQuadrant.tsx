/*
 * File Name:     TodoQuadrant.tsx
 * Description:   A redesigned single quadrant of the Eisenhower Matrix with editorial flair.
 * Author:        Antigravity
 * Created Date:  2026-02-28
 */

"use client"

import React from 'react'
import { Todo, DailyProgress } from '../types/todo.types'
import { TodoItem } from './TodoItem'
import { Droppable } from '@hello-pangea/dnd'
import { cn } from '@/lib/utils'
import { AlertCircle, Zap, Target, Cloud, MousePointer2 } from 'lucide-react'

/**
 * Props for the TodoQuadrant component.
 * @property {string} title - The header text for the quadrant.
 * @property {'urgent-important' | 'urgent-unimportant' | 'unurgent-important' | 'unurgent-unimportant'} type - The matrix priority level.
 * @property {Todo[]} todos - List of tasks in this quadrant.
 * @property {Function} onToggle - Logic for checking/unchecking.
 * @property {Function} onDelete - Logic for removing a task.
 * @property {Function} onEdit - Logic for updating task data.
 * @property {Function} [onTrackDaily] - Logic for opening progress history.
 * @property {Function} [onSaveDailyProgress] - Logic for updating sub-tasks inline.
 * @property {boolean} [isDragDisabled] - Whether to prevent DND interactions.
 */
interface TodoQuadrantProps {
    title: string
    type: 'urgent-important' | 'urgent-unimportant' | 'unurgent-important' | 'unurgent-unimportant'
    todos: Todo[]
    onToggle: (id: string) => void
    onDelete: (id: string) => void
    onEdit: (id: string, data: Partial<Todo>) => void
    onTrackDaily?: (todo: Todo) => void
    onSaveDailyProgress?: (todoId: string, dateKey: string, progress: DailyProgress) => void
    isDragDisabled?: boolean
}

const icons = {
    'urgent-important': <AlertCircle className="h-6 w-6 text-destructive" />,
    'urgent-unimportant': <Zap className="h-6 w-6 text-accent" />,
    'unurgent-important': <Target className="h-6 w-6 text-primary" />,
    'unurgent-unimportant': <Cloud className="h-6 w-6 text-muted-foreground/40" />,
}

/**
 * A container for a group of tasks belonging to a specific Eisenhower quadrant.
 * Redesigned for a high-end, editorial dashboard experience.
 * 
 * @param {TodoQuadrantProps} props - Component properties.
 * @returns {JSX.Element} The rendered quadrant component.
 */
export function TodoQuadrant({ title, type, todos, onToggle, onDelete, onEdit, onTrackDaily, onSaveDailyProgress, isDragDisabled }: TodoQuadrantProps) {
    return (
        <div className={cn(
            "group/quadrant flex flex-col h-full min-h-96 transition-all duration-300 rounded-2xl border border-border/50 bg-card relative shadow-sm hover:shadow-md",
            "hover:border-primary/30",
            type === 'urgent-important' && "before:absolute before:inset-x-0 before:top-0 before:h-1 before:rounded-t-2xl before:bg-destructive before:opacity-60",
            type === 'urgent-unimportant' && "before:absolute before:inset-x-0 before:top-0 before:h-1 before:rounded-t-2xl before:bg-accent before:opacity-60",
            type === 'unurgent-important' && "before:absolute before:inset-x-0 before:top-0 before:h-1 before:rounded-t-2xl before:bg-primary before:opacity-60",
            type === 'unurgent-unimportant' && "before:absolute before:inset-x-0 before:top-0 before:h-1 before:rounded-t-2xl before:bg-muted-foreground/30 before:opacity-60"
        )}>
            <div className="p-5 sm:p-6 md:p-8 pb-3 md:pb-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-2 md:mb-4">
                    <div className="flex items-center gap-3">
                        {icons[type]}
                        <h2 className="text-lg font-sans font-semibold tracking-tight text-foreground transition-all">
                            {title}
                        </h2>
                    </div>
                    {todos.length > 0 && (
                        <span className="text-xs font-medium font-sans text-muted-foreground/70 bg-muted/50 px-2.5 py-1 rounded-full">
                            {todos.length} Active
                        </span>
                    )}
                </div>
            </div>

            <Droppable droppableId={type} isDropDisabled={isDragDisabled}>
                {(provided, snapshot) => (
                    <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={cn(
                            "flex-1 overflow-y-auto px-4 sm:px-6 md:px-8 pb-6 md:pb-8 space-y-1 transition-colors duration-300 scrollbar-thin scrollbar-thumb-primary/10",
                            snapshot.isDraggingOver && "bg-primary/[0.03]"
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
                                    onSaveDailyProgress={onSaveDailyProgress}
                                    isDragDisabled={isDragDisabled}
                                />
                            ))
                        ) : (
                            <div className="flex flex-col items-center justify-center py-20 opacity-20 transition-all duration-500 group-hover/quadrant:opacity-40">
                                <MousePointer2 className="h-10 w-10 text-muted-foreground mb-4 rotate-12" />
                                <p className="text-sm font-medium font-sans tracking-tight text-muted-foreground">
                                    Awaiting Precision
                                </p>
                            </div>
                        )}
                        {provided.placeholder}
                    </div>
                )}
            </Droppable>
        </div>
    )
}
