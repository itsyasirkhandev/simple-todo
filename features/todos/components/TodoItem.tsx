/*
 * File Name:     TodoItem.tsx
 * Description:   Component for a single Todo item with GSAP animations.
 *                Daily tasks show a collapsible sub-task checklist instead of a normal checkbox.
 * Author:        Antigravity
 * Created Date:  2026-02-28
 */

"use client"

import React, { useRef, useState } from 'react'
import { Trash2, CheckCircle2, Circle, Clock, Pencil, X, Check, CalendarDays, ChevronDown, ListChecks } from 'lucide-react'
import { Draggable } from '@hello-pangea/dnd'
import { Todo, DailyProgress } from '../types/todo.types'
import { useTodoItemAnimations } from '../hooks/useTodoAnimations'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { format, startOfDay } from 'date-fns'

/**
 * Props for the TodoItem component.
 * @property {Todo} todo - The task data to display.
 * @property {number} index - The position within the draggable list.
 * @property {Function} onToggle - Callback for completion toggle.
 * @property {Function} onDelete - Callback for task removal.
 * @property {Function} onEdit - Callback for updating task content.
 * @property {Function} [onTrackDaily] - Callback for opening the daily tracker modal.
 * @property {Function} [onSaveDailyProgress] - Callback for saving daily sub-task progress inline.
 * @property {boolean} [isDragDisabled] - Whether dragging is disabled.
 * @property {string} [className] - Optional CSS classes.
 */
interface TodoItemProps {
    todo: Todo
    index: number
    onToggle: (id: string) => void
    onDelete: (id: string) => void
    onEdit: (id: string, data: Partial<Todo>) => void
    onTrackDaily?: (todo: Todo) => void
    onSaveDailyProgress?: (todoId: string, dateKey: string, progress: DailyProgress) => void
    isDragDisabled?: boolean
    className?: string
}

/**
 * Individual task card with drag-and-drop support and GSAP micro-animations.
 * Daily tasks render a collapsible sub-task list instead of a normal checkbox.
 * @param {TodoItemProps} props - Component properties.
 * @returns {JSX.Element} The rendered task item.
 */
export function TodoItem({ todo, index, onToggle, onDelete, onEdit, onTrackDaily, onSaveDailyProgress, isDragDisabled, className }: TodoItemProps) {
    const containerRef = useRef<HTMLDivElement>(null)
    const [isEditing, setIsEditing] = useState(false)
    const [editTitle, setEditTitle] = useState(todo.title)
    const [editDescription, setEditDescription] = useState(todo.description || '')
    const [isSubTasksOpen, setIsSubTasksOpen] = useState(false)

    // Isolated Animation Hook
    const { animateDelete } = useTodoItemAnimations(containerRef)

    const today = startOfDay(new Date())
    const todayKey = format(today, "yyyy-MM-dd")

    const isDaily = todo.isDaily ?? false
    const subTasks = todo.subTasks ?? []
    const existingProgress = todo.dailyProgress?.[todayKey]
    const completedSubTaskIds = existingProgress?.completedSubTasks ?? []
    const completedCount = subTasks.filter(st => completedSubTaskIds.includes(st.id)).length
    const totalSubTasks = subTasks.length
    const allSubTasksCompleted = totalSubTasks > 0 && completedCount === totalSubTasks

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

    /**
     * Toggles a single sub-task's completion and auto-sets isCompleted
     * when all are done.
     * @param {string} subTaskId - The sub-task ID to toggle.
     * @param {boolean} checked - The new checked state.
     */
    const handleSubTaskToggle = (subTaskId: string, checked: boolean) => {
        if (!onSaveDailyProgress) return

        let updatedIds: string[]
        if (checked) {
            updatedIds = [...completedSubTaskIds, subTaskId]
        } else {
            updatedIds = completedSubTaskIds.filter(id => id !== subTaskId)
        }

        const allDone = totalSubTasks > 0 && updatedIds.length === totalSubTasks

        onSaveDailyProgress(todo.id, todayKey, {
            isCompleted: allDone,
            completedSubTasks: updatedIds,
            notes: existingProgress?.notes ?? "",
        })
    }

    return (
        <Draggable draggableId={todo.id} index={index} isDragDisabled={isDragDisabled}>
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
                            "relative overflow-hidden border border-border/40 transition-all duration-300 hover:border-border rounded-none",
                            isDaily
                                ? (allSubTasksCompleted ? "opacity-50" : "opacity-100")
                                : (todo.isCompleted ? "opacity-50" : "opacity-100"),
                            snapshot.isDragging ? "shadow-xl border-foreground/40 z-50 bg-background" : "bg-card/30 hover:bg-card/60"
                        )}>
                            <div className="flex items-start gap-4 p-4 py-4">
                                {/* Checkbox: Only show for non-daily tasks */}
                                {!isDaily && (
                                    <button
                                        onClick={() => onToggle(todo.id)}
                                        className="mt-1 transition-transform active:scale-95"
                                    >
                                        {todo.isCompleted ? (
                                            <CheckCircle2 className="h-5 w-5 text-primary fill-primary/10" />
                                        ) : (
                                            <Circle className="h-5 w-5 text-muted-foreground/40 group-hover:text-primary transition-colors" />
                                        )}
                                    </button>
                                )}

                                {/* Daily task: Show progress indicator instead of checkbox */}
                                {isDaily && totalSubTasks > 0 && (
                                    <div className="mt-1 flex items-center">
                                        {allSubTasksCompleted ? (
                                            <CheckCircle2 className="h-5 w-5 text-primary fill-primary/10" />
                                        ) : (
                                            <div className="relative flex items-center justify-center h-5 w-5">
                                                <ListChecks className="h-4 w-4 text-muted-foreground/40 group-hover:text-primary transition-colors" />
                                            </div>
                                        )}
                                    </div>
                                )}

                                {isDaily && totalSubTasks === 0 && (
                                    <div className="mt-1">
                                        <Circle className="h-5 w-5 text-muted-foreground/30" />
                                    </div>
                                )}

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
                                            <div className="flex items-center gap-2">
                                                <h3 className={cn(
                                                    "text-sm font-semibold leading-none tracking-tight transition-all",
                                                    isDaily
                                                        ? (allSubTasksCompleted && "line-through text-muted-foreground")
                                                        : (todo.isCompleted && "line-through text-muted-foreground")
                                                )}>
                                                    {todo.title}
                                                </h3>
                                                {isDaily && (
                                                    <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary tracking-wide">
                                                        {totalSubTasks > 0 ? `${completedCount}/${totalSubTasks}` : 'Daily'}
                                                    </span>
                                                )}
                                            </div>
                                            {todo.description && (
                                                <p className="text-sm text-muted-foreground line-clamp-2">
                                                    {todo.description}
                                                </p>
                                            )}
                                        </>
                                    )}

                                    <div className="flex items-center gap-4 pt-1">
                                        <span className="flex items-center gap-1 text-sm text-muted-foreground/40">
                                            <Clock className="h-3 w-3" />
                                            {new Date(todo.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    {isDaily && !isEditing && onTrackDaily && (
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => onTrackDaily(todo)}
                                            className="h-8 w-8 text-foreground hover:bg-foreground/10"
                                            title="Track Daily Progress"
                                        >
                                            <CalendarDays className="h-4 w-4" />
                                        </Button>
                                    )}
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

                            {/* Collapsible Sub-tasks for Daily Tasks */}
                            {isDaily && totalSubTasks > 0 && !isEditing && (
                                <Collapsible open={isSubTasksOpen} onOpenChange={setIsSubTasksOpen}>
                                    <CollapsibleTrigger asChild>
                                        <button className="w-full flex items-center justify-between px-4 py-2 border-t border-border/30 bg-muted/10 hover:bg-muted/30 transition-colors text-sm text-muted-foreground">
                                            <span className="flex items-center gap-2">
                                                <ListChecks className="h-4 w-4" />
                                                Sub-tasks
                                            </span>
                                            <ChevronDown className={cn(
                                                "h-4 w-4 transition-transform duration-200",
                                                isSubTasksOpen && "rotate-180"
                                            )} />
                                        </button>
                                    </CollapsibleTrigger>
                                    <CollapsibleContent>
                                        <div className="border-t border-border bg-muted/10 px-4 py-2 space-y-1">
                                            {subTasks.map((subTask) => {
                                                const isChecked = completedSubTaskIds.includes(subTask.id)
                                                return (
                                                    <div
                                                        key={subTask.id}
                                                        className={cn(
                                                            "flex items-center gap-3 py-2 px-2 rounded-none transition-all duration-200",
                                                            isChecked ? "opacity-60" : "opacity-100"
                                                        )}
                                                    >
                                                        <Checkbox
                                                            id={`item-subtask-${todo.id}-${subTask.id}`}
                                                            checked={isChecked}
                                                            onCheckedChange={(checked) => handleSubTaskToggle(subTask.id, checked as boolean)}
                                                            className="h-4 w-4 border-2 border-primary data-[state=checked]:bg-primary rounded-none shrink-0"
                                                        />
                                                        <label
                                                            htmlFor={`item-subtask-${todo.id}-${subTask.id}`}
                                                            className={cn(
                                                                "text-sm cursor-pointer flex-1",
                                                                isChecked ? "line-through text-muted-foreground" : "text-foreground"
                                                            )}
                                                        >
                                                            {subTask.title}
                                                        </label>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    </CollapsibleContent>
                                </Collapsible>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </Draggable>
    )
}
