/*
 * File Name:     TodoQuadrant.tsx
 * Description:   Industrial-editorial redesign. Distinct per-quadrant identity:
 *                colored dot + mono label header, thicker gradient accent bar,
 *                serif italic empty state, clean mono count badge.
 */

"use client"

import React from 'react'
import { Todo, DailyProgress } from '../types/todo.types'
import { TodoItem } from './TodoItem'
import { Droppable, DroppableProvided, DroppableStateSnapshot } from '@hello-pangea/dnd'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import { JSX } from 'react/jsx-runtime'

interface TodoQuadrantProps {
    title: string
    type: 'urgent-important' | 'urgent-unimportant' | 'unurgent-important' | 'unurgent-unimportant'
    todos: Todo[]
    onToggle: (id: string) => void
    onDelete: (id: string) => void
    onEdit: (id: string, data: Partial<Todo>) => void

    onSaveDailyProgress?: (todoId: string, dateKey: string, progress: DailyProgress) => void
    isDragDisabled?: boolean
}

const quadrantConfig = {
    'urgent-important': {
        dot: 'bg-destructive',
        bar: 'from-destructive to-orange-500',
        label: 'DO',
    },
    'urgent-unimportant': {
        dot: 'bg-amber-400',
        bar: 'from-amber-400 to-yellow-300',
        label: 'DELEGATE',
    },
    'unurgent-important': {
        dot: 'bg-primary',
        bar: 'from-primary to-emerald-400',
        label: 'SCHEDULE',
    },
    'unurgent-unimportant': {
        dot: 'bg-muted-foreground/40',
        bar: 'from-muted-foreground/40 to-muted-foreground/20',
        label: 'ELIMINATE',
    },
} as const

export function TodoQuadrant({ title, type, todos, onToggle, onDelete, onEdit, onSaveDailyProgress, isDragDisabled }: TodoQuadrantProps): JSX.Element {
    const config = quadrantConfig[type]

    return (
        <div className={cn(
            "group/quadrant flex flex-col h-full min-h-80 transition-all duration-300 rounded-2xl border border-border/50 bg-card relative shadow-sm hover:shadow-md overflow-hidden",
            "hover:border-primary/30"
        )}>
            {/* Gradient accent bar — 3px, full opacity */}
            <div className={cn("absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r", config.bar)} />

            {/* Header */}
            <div className="px-5 sm:px-6 pt-6 pb-3">
                <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                        {/* Colored priority dot */}
                        <span className={cn("h-2 w-2 rounded-full flex-shrink-0", config.dot)} />
                        <div className="flex flex-col">
                            <span className="label-mono text-[10px] text-muted-foreground/60">{config.label}</span>
                            <h2 className="text-sm font-semibold font-sans tracking-tight text-foreground leading-tight">
                                {title}
                            </h2>
                        </div>
                    </div>

                    {/* Clean mono count badge */}
                    {todos.length > 0 && (
                        <span className="font-mono text-[11px] tracking-wider text-muted-foreground/70 bg-muted/50 px-2 py-0.5 rounded-md border border-border/30">
                            {todos.length}
                        </span>
                    )}
                </div>
            </div>

            {/* Drop zone */}
            <Droppable droppableId={type} isDropDisabled={isDragDisabled}>
                {(provided: DroppableProvided, snapshot: DroppableStateSnapshot) => (
                    <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={cn(
                            "flex-1 overflow-y-auto px-4 sm:px-5 pb-3 space-y-1 transition-colors duration-300",
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

                                    onSaveDailyProgress={onSaveDailyProgress}
                                    isDragDisabled={isDragDisabled}
                                />
                            ))
                        ) : (
                            // Italic serif empty state — editorial & human
                            <div className="flex flex-col items-center justify-center py-16 text-center opacity-25 group-hover/quadrant:opacity-40 transition-opacity duration-500 select-none">
                                <p className="font-serif italic text-sm text-muted-foreground leading-relaxed">
                                    Nothing here yet.
                                </p>
                            </div>
                        )}
                        {provided.placeholder}
                    </div>
                )}
            </Droppable>

            {/* Bottom add shortcut */}
            <div className="px-5 py-3 border-t border-border/20">
                <Link
                    href={`/?tab=create`}
                    className="flex items-center gap-1.5 text-muted-foreground/50 hover:text-primary transition-colors duration-200 group/add w-fit"
                    title={`Create task in ${title}`}
                >
                    <Plus className="h-3.5 w-3.5 group-hover/add:rotate-90 transition-transform duration-300" />
                    <span className="font-mono text-[10px] tracking-wider uppercase">Add task</span>
                </Link>
            </div>
        </div>
    )
}
