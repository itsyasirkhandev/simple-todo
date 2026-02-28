/*
 * File Name:     TodoQuadrant.tsx
 * Description:   A single quadrant of the Eisenhower Matrix.
 * Author:        Antigravity
 * Created Date:  2026-02-28
 */

"use client"

import React from 'react'
import { Todo, DailyProgress } from '../types/todo.types'
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
    onSaveDailyProgress?: (todoId: string, dateKey: string, progress: DailyProgress) => void
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
export function TodoQuadrant({ title, type, todos, onToggle, onDelete, onEdit, onTrackDaily, onSaveDailyProgress, isDragDisabled }: TodoQuadrantProps) {
    return (
        <div className={cn(
            "group/quadrant flex flex-col h-full min-h-80 p-6 border border-border/40 bg-card/50 transition-all duration-300 overflow-hidden rounded-none shadow-sm hover:shadow-md hover:border-border",
            type === 'urgent-important' && "border-l-4 border-l-destructive",
            type === 'urgent-unimportant' && "border-l-4 border-l-accent",
            type === 'unurgent-important' && "border-l-4 border-l-primary",
            type === 'unurgent-unimportant' && "border-l-4 border-l-muted-foreground/30"
        )}>
            <div className="mb-4 pb-4 border-b border-border/30">
                <div className="flex items-center gap-2">
                    {icons[type]}
                    <h2 className="text-sm font-semibold tracking-wider uppercase text-muted-foreground">{title}</h2>
                </div>
            </div>

            <Droppable droppableId={type} isDropDisabled={isDragDisabled}>
                {(provided, snapshot) => (
                    <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={cn(
                            "flex-1 overflow-y-auto pr-1 space-y-1 scrollbar-thin scrollbar-thumb-primary/10",
                            snapshot.isDraggingOver && "bg-primary/5 transition-colors"
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
                            <div className="flex flex-col items-center justify-center h-full text-center py-12">
                                <p className="text-sm text-muted-foreground/40 tracking-wide">No tasks yet</p>
                            </div>
                        )}
                        {provided.placeholder}
                    </div>
                )}
            </Droppable>
        </div>
    )
}
