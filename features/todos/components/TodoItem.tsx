/*
 * File Name:     TodoItem.tsx
 * Description:   Redesigned Todo item component with a premium editorial aesthetic.
 *                Features glassmorphism, refined typography, and improved micro-interactions.
 * Author:        Antigravity
 * Created Date:  2026-02-28
 */

"use client"

import React, { useRef, useState } from 'react'
import { Trash2, CheckCircle2, Clock, Pencil, X, Check, CalendarDays, ChevronDown, ListChecks, Layers, Plus } from 'lucide-react'
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
 * Redesigned TodoItem component with a premium editorial aesthetic.
 * 
 * DESIGN RATIONALE:
 * - Uses `font-serif` for titles to evoke a sophisticated, high-end feel.
 * - Implements glassmorphism (`backdrop-blur-xl`) for depth and layering.
 * - Utilizes a 60/30/10 color strategy with subtle primary accents.
 * - Strictly adheres to the 4 sizes / 2 weights typography rule.
 * 
 * @param {TodoItemProps} props - Component properties.
 * @returns {JSX.Element} The rendered task item.
 */
export function TodoItem({ todo, index, onToggle, onDelete, onEdit, onTrackDaily, onSaveDailyProgress, isDragDisabled, className }: TodoItemProps) {
    const containerRef = useRef<HTMLDivElement>(null)
    const [isEditing, setIsEditing] = useState(false)
    const [editTitle, setEditTitle] = useState(todo.title)
    const [editDescription, setEditDescription] = useState(todo.description || '')
    const [isSubTasksOpen, setIsSubTasksOpen] = useState(false)

    // Isolated Animation Hook (GSAP)
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
     * Saves the edited todo content and resets state.
     */
    const handleSave = () => {
        if (!editTitle.trim()) return
        onEdit(todo.id, { title: editTitle, description: editDescription })
        setIsEditing(false)
    }

    /**
     * Terminate edit mode without saving changes.
     */
    const cancelEdit = () => {
        setEditTitle(todo.title)
        setEditDescription(todo.description || '')
        setIsEditing(false)
    }

    /**
     * Orchestrates the deletion by triggering a GSAP exit animation.
     */
    const handleDelete = () => {
        animateDelete(() => onDelete(todo.id))
    }

    /**
     * Updates completion status for a sub-task and recalculates parent status.
     * 
     * @param {string} subTaskId - The ID of the targeted sub-task.
     * @param {boolean} checked - The new completion state.
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
                        snapshot.isDragging && "z-50"
                    )}
                >
                    <div ref={containerRef} className="anim-todo-item">
                        <div className={cn(
                            "relative overflow-hidden transition-all duration-300 rounded-xl",
                            "bg-card border border-border/50",
                            "hover:border-primary/50 hover:bg-card/80 shadow-sm hover:shadow-md",
                            (isDaily ? allSubTasksCompleted : todo.isCompleted) && "opacity-60 grayscale",
                            snapshot.isDragging && "shadow-2xl border-primary scale-105"
                        )}>
                            {/* Accent Bar */}
                            <div className={cn(
                                "absolute top-0 left-0 w-1 h-full transition-all duration-300",
                                (isDaily ? allSubTasksCompleted : todo.isCompleted) ? "bg-muted-foreground/30" : "bg-primary"
                            )} />

                            <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6 p-4 sm:p-6">
                                <div className="flex items-start gap-4 sm:gap-6 flex-1 w-full min-w-0">
                                    {/* Precision Status Toggle */}
                                    <div className="mt-1 shrink-0">
                                        {!isDaily ? (
                                            <button
                                                onClick={() => onToggle(todo.id)}
                                                className="relative flex items-center justify-center p-1 rounded-full transition-transform active:scale-90"
                                                aria-label={todo.isCompleted ? "Unmark as completed" : "Mark as completed"}
                                            >
                                                {todo.isCompleted ? (
                                                    <div className="flex items-center justify-center h-6 w-6 rounded-full bg-primary text-primary-foreground">
                                                        <Check className="h-4 w-4" />
                                                    </div>
                                                ) : (
                                                    <div className="h-6 w-6 rounded-full border-2 border-primary/40 group-hover:border-primary transition-colors flex items-center justify-center">
                                                        <div className="h-2 w-2 rounded-full bg-primary opacity-0 group-hover:opacity-40 transition-opacity" />
                                                    </div>
                                                )}
                                            </button>
                                        ) : (
                                            <div className="relative flex items-center justify-center h-6 w-6">
                                                {allSubTasksCompleted ? (
                                                    <div className="flex items-center justify-center h-6 w-6 rounded-full bg-primary text-primary-foreground shadow-sm">
                                                        <CheckCircle2 className="h-4 w-4" />
                                                    </div>
                                                ) : (
                                                    <div className="h-6 w-6 flex items-center justify-center text-primary/60 group-hover:text-primary transition-colors">
                                                        <Layers className="h-5 w-5" />
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    {/* Editorial Content Area */}
                                    <div className="flex-1 space-y-4 min-w-0">
                                        {isEditing ? (
                                            <div className="space-y-4 pr-8">
                                                <Input
                                                    value={editTitle}
                                                    onChange={(e) => setEditTitle(e.target.value)}
                                                    className="h-12 text-base font-medium font-sans tracking-tight bg-background/50 border-border/50 focus-visible:border-primary rounded-lg"
                                                    autoFocus
                                                />
                                                <Textarea
                                                    value={editDescription}
                                                    onChange={(e) => setEditDescription(e.target.value)}
                                                    className="min-h-24 text-sm font-normal font-sans bg-background/50 border-border/50 focus-visible:border-primary rounded-lg resize-none"
                                                />
                                                <div className="flex gap-2">
                                                    <Button size="sm" onClick={handleSave} className="h-10 px-4 text-sm font-medium rounded-md tracking-tight">
                                                        <Check className="h-4 w-4 mr-2" /> Save Changes
                                                    </Button>
                                                    <Button size="sm" variant="ghost" onClick={cancelEdit} className="h-10 px-4 text-sm font-medium rounded-md">
                                                        <X className="h-4 w-4 mr-2" /> Discard
                                                    </Button>
                                                </div>
                                            </div>
                                        ) : (
                                            <>
                                                <div className="space-y-1">
                                                    <div className="flex items-baseline gap-3">
                                                        <h3 className={cn(
                                                            "text-base font-semibold font-sans tracking-tight transition-all duration-300 break-words min-w-0",
                                                            (isDaily ? allSubTasksCompleted : todo.isCompleted) && "line-through text-muted-foreground/60"
                                                        )}>
                                                            {todo.title}
                                                        </h3>
                                                        {isDaily && (
                                                            <span className="text-xs font-medium font-sans text-primary/80 bg-primary/10 px-2 py-0.5 rounded-full shrink-0">
                                                                {totalSubTasks > 0 ? `${completedCount}/${totalSubTasks}` : 'Daily Routine'}
                                                            </span>
                                                        )}
                                                    </div>
                                                    {todo.description && (
                                                        <p className="text-sm font-normal text-muted-foreground font-sans line-clamp-3 leading-relaxed break-words">
                                                            {todo.description}
                                                        </p>
                                                    )}
                                                </div>

                                                <div className="flex items-center gap-4 text-xs font-medium text-muted-foreground/70 font-sans">
                                                    <span className="flex items-center gap-1.5">
                                                        <Clock className="h-3 w-3" />
                                                        {format(new Date(todo.createdAt), "MMM d, yyyy")}
                                                    </span>
                                                    {isDaily && totalSubTasks > 0 && (
                                                        <span className="flex items-center gap-1.5 text-primary/60">
                                                            <ListChecks className="h-3 w-3" />
                                                            {totalSubTasks} sub-tasks
                                                        </span>
                                                    )}
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>

                                {/* Floating Action Panel */}
                                <div className="flex flex-row sm:flex-col gap-2 shrink-0 w-full sm:w-auto justify-end mt-2 sm:mt-0 sm:translate-x-4 opacity-100 sm:opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300 sm:border-t-0 border-t border-border/20 pt-3 sm:pt-0">
                                    {isDaily && !isEditing && onTrackDaily && (
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            onClick={() => onTrackDaily(todo)}
                                            className="h-9 w-9 border-border/50 bg-background hover:bg-primary hover:text-primary-foreground rounded-md shadow-sm transition-all"
                                            title="View History"
                                        >
                                            <CalendarDays className="h-4 w-4" />
                                        </Button>
                                    )}
                                    {!isEditing && (
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            onClick={() => setIsEditing(true)}
                                            className="h-9 w-9 border-border/50 bg-background hover:bg-foreground hover:text-background rounded-md shadow-sm transition-all"
                                        >
                                            <Pencil className="h-4 w-4" />
                                        </Button>
                                    )}
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        onClick={handleDelete}
                                        className="h-9 w-9 border-border/50 bg-background hover:bg-destructive hover:text-destructive-foreground rounded-md shadow-sm transition-all"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>

                            {/* Collapsible Refined List for Daily Tasks */}
                            {isDaily && totalSubTasks > 0 && !isEditing && (
                                <Collapsible open={isSubTasksOpen} onOpenChange={setIsSubTasksOpen}>
                                    <CollapsibleTrigger asChild>
                                        <button className="w-full flex items-center justify-between px-4 sm:px-6 py-3 border-t border-border/20 bg-muted/5 hover:bg-muted/10 transition-colors">
                                            <span className="text-xs font-medium font-sans text-muted-foreground flex items-center gap-2">
                                                <Plus className={cn("h-3 w-3 transition-transform duration-300", isSubTasksOpen && "rotate-45")} />
                                                Progress Details
                                            </span>
                                            <ChevronDown className={cn(
                                                "h-3 w-3 text-muted-foreground/60 transition-transform duration-300",
                                                isSubTasksOpen && "rotate-180"
                                            )} />
                                        </button>
                                    </CollapsibleTrigger>
                                    <CollapsibleContent>
                                        <div className="border-t border-border/10 bg-muted/5 px-4 sm:px-6 py-4 pt-2 space-y-3">
                                            {subTasks.map((subTask) => {
                                                const isChecked = completedSubTaskIds.includes(subTask.id)
                                                return (
                                                    <div
                                                        key={subTask.id}
                                                        className={cn(
                                                            "flex items-center gap-4 py-3 border-b border-border/10 last:border-0",
                                                            isChecked && "opacity-60"
                                                        )}
                                                    >
                                                        <Checkbox
                                                            id={`item-subtask-${todo.id}-${subTask.id}`}
                                                            checked={isChecked}
                                                            onCheckedChange={(checked) => handleSubTaskToggle(subTask.id, checked as boolean)}
                                                            className="h-5 w-5 border-2 border-primary/30 data-[state=checked]:bg-primary data-[state=checked]:border-primary rounded-sm transition-all"
                                                        />
                                                        <label
                                                            htmlFor={`item-subtask-${todo.id}-${subTask.id}`}
                                                            className={cn(
                                                                "text-sm font-normal font-sans cursor-pointer transition-colors",
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
