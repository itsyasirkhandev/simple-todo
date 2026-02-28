/*
 * File Name:     TodoItem.tsx
 * Description:   Component for a single Todo item with GSAP animations.
 * Author:        Antigravity
 * Created Date:  2026-02-28
 */

"use client"

import React, { useRef, useState } from 'react'
import { Trash2, CheckCircle2, Circle, Clock, Pencil, X, Check } from 'lucide-react'
import { Draggable } from '@hello-pangea/dnd'
import { Todo } from '../types/todo.types'
import { useTodoItemAnimations } from '../hooks/useTodoAnimations'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

/**
 * Props for the TodoItem component.
 * @property {Todo} todo - The task data to display.
 * @property {number} index - The position within the draggable list.
 * @property {Function} onToggle - Callback for completion toggle.
 * @property {Function} onDelete - Callback for task removal.
 * @property {Function} onEdit - Callback for updating task content.
 * @property {string} [className] - Optional CSS classes.
 */
interface TodoItemProps {
    todo: Todo
    index: number
    onToggle: (id: string) => void
    onDelete: (id: string) => void
    onEdit: (id: string, data: Partial<Todo>) => void
    className?: string
}

/**
 * Individual task card with drag-and-drop support and GSAP micro-animations.
 * @param {TodoItemProps} props - Component properties.
 * @returns {JSX.Element} The rendered task item.
 */
export function TodoItem({ todo, index, onToggle, onDelete, onEdit, className }: TodoItemProps) {
    const containerRef = useRef<HTMLDivElement>(null)
    const [isEditing, setIsEditing] = useState(false)
    const [editTitle, setEditTitle] = useState(todo.title)
    const [editDescription, setEditDescription] = useState(todo.description || '')

    // Isolated Animation Hook
    const { animateDelete } = useTodoItemAnimations(containerRef)

    /**
     * Saves the edited todo content.
     */
    const handleSave = () => {
        if (!editTitle.trim()) return
        onEdit(todo.id, { title: editTitle, description: editDescription })
        setIsEditing(false)
    }

    /**
     * Discards changes and exits edit mode.
     */
    const cancelEdit = () => {
        setEditTitle(todo.title)
        setEditDescription(todo.description || '')
        setIsEditing(false)
    }

    /**
     * Triggers exit animation before calling onDelete.
     */
    const handleDelete = () => {
        animateDelete(() => onDelete(todo.id))
    }

    return (
        <Draggable draggableId={todo.id} index={index}>
            {(provided, snapshot) => (
                <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    className={cn(
                        "group relative py-2",
                        className,
                        snapshot.isDragging && "z-50 opacity-90 scale-105 transition-transform"
                    )}
                >
                    <div ref={containerRef} className="anim-todo-item">
                        <div className={cn(
                            "relative overflow-hidden border-2 transition-shadow duration-300 hover:shadow-lg rounded-none",
                            todo.isCompleted ? "opacity-60" : "opacity-100",
                            snapshot.isDragging ? "shadow-2xl border-foreground z-50 bg-background" : "bg-background border-border hover:border-foreground"
                        )}>
                            <div className="flex items-start gap-4 p-4">
                                <button
                                    onClick={() => onToggle(todo.id)}
                                    className="mt-1 transition-transform active:scale-95"
                                >
                                    {todo.isCompleted ? (
                                        <CheckCircle2 className="h-6 w-6 text-primary fill-primary/10" />
                                    ) : (
                                        <Circle className="h-6 w-6 text-muted-foreground group-hover:text-primary" />
                                    )}
                                </button>

                                <div className="flex-1 space-y-1">
                                    {isEditing ? (
                                        <div className="space-y-4 pr-6">
                                            <Input
                                                value={editTitle}
                                                onChange={(e) => setEditTitle(e.target.value)}
                                                className="h-10 text-base font-semibold focus-visible:ring-1 focus-visible:ring-primary rounded-none border-2 border-border focus:border-foreground"
                                                autoFocus
                                            />
                                            <Textarea
                                                value={editDescription}
                                                onChange={(e) => setEditDescription(e.target.value)}
                                                className="min-h-20 text-sm resize-none focus-visible:ring-1 focus-visible:ring-primary rounded-none border-2 border-border focus:border-foreground"
                                            />
                                            <div className="flex gap-2">
                                                <Button size="sm" onClick={handleSave} className="h-8 px-4 text-sm font-semibold">
                                                    <Check className="h-4 w-4 mr-1" /> Save
                                                </Button>
                                                <Button size="sm" variant="ghost" onClick={cancelEdit} className="h-8 px-4 text-sm font-semibold">
                                                    <X className="h-4 w-4 mr-1" /> Cancel
                                                </Button>
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            <h3 className={cn(
                                                "text-base font-semibold leading-none tracking-tight transition-all font-serif",
                                                todo.isCompleted && "line-through text-muted-foreground"
                                            )}>
                                                {todo.title}
                                            </h3>
                                            {todo.description && (
                                                <p className="text-sm text-muted-foreground line-clamp-2">
                                                    {todo.description}
                                                </p>
                                            )}
                                        </>
                                    )}

                                    <div className="flex items-center gap-4 pt-2">
                                        <span className="flex items-center gap-1 text-sm font-normal uppercase tracking-wider text-muted-foreground">
                                            <Clock className="h-3 w-3" />
                                            {new Date(todo.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    {!isEditing && (
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => setIsEditing(true)}
                                            className="h-8 w-8 text-primary hover:bg-primary/10"
                                        >
                                            <Pencil className="h-4 w-4" />
                                        </Button>
                                    )}
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={handleDelete}
                                        className="h-8 w-8 text-destructive hover:bg-destructive/10"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            )}
        </Draggable>
    )
}
