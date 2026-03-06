/*
 * File Name:     TodoItem.tsx
 * Description:   Industrial-editorial redesign. Serif title, 3px accent bar,
 *                visible drag handle, hidden mobile actions, smooth completion,
 *                inline subtask progress bar.
 */

"use client"

import React, { useRef, useState, useCallback } from 'react'
import { Trash2, CheckCircle2, Clock, Pencil, X, Check, CalendarDays, ChevronDown, ListChecks, Layers, Plus, GripVertical, PlusCircle } from 'lucide-react'
import { Draggable, DraggableProvided, DraggableStateSnapshot } from '@hello-pangea/dnd'
import { Todo, DailyProgress } from '../types/todo.types'
import { useTodoItemAnimations } from '../hooks/useTodoAnimations'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { format, startOfDay } from 'date-fns'
import { JSX } from 'react/jsx-runtime'

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

export function TodoItem({ todo, index, onToggle, onDelete, onEdit, onTrackDaily, onSaveDailyProgress, isDragDisabled, className }: TodoItemProps): JSX.Element {
    const containerRef = useRef<HTMLDivElement>(null)
    const [isEditing, setIsEditing] = useState(false)
    const [editTitle, setEditTitle] = useState(todo.title)
    const [editDescription, setEditDescription] = useState(todo.description || '')
    const [editSubTasks, setEditSubTasks] = useState<{ id: string; title: string }[]>(todo.subTasks ?? [])
    const [newSubTaskTitle, setNewSubTaskTitle] = useState('')
    const [isSubTasksOpen, setIsSubTasksOpen] = useState(false)

    const { animateDelete } = useTodoItemAnimations(containerRef)

    const today = startOfDay(new Date())
    const todayKey = format(today, "yyyy-MM-dd")

    const isDaily = todo.isDaily ?? false
    const subTasks = todo.subTasks ?? []
    const existingProgress = todo.dailyProgress?.[todayKey]
    const completedSubTaskIds = existingProgress?.completedSubTasks ?? []
    // For daily tasks: use dailyProgress. For non-daily tasks: also track via dailyProgress or a simple completed list
    const nonDailyCompletedIds = existingProgress?.completedSubTasks ?? []
    const completedCount = isDaily
        ? subTasks.filter(st => completedSubTaskIds.includes(st.id)).length
        : subTasks.filter(st => nonDailyCompletedIds.includes(st.id)).length
    const totalSubTasks = subTasks.length
    const allSubTasksCompleted = totalSubTasks > 0 && completedCount === totalSubTasks
    const isCompleted = isDaily ? allSubTasksCompleted : (totalSubTasks > 0 ? allSubTasksCompleted : todo.isCompleted)

    const handleSave = () => {
        if (!editTitle.trim()) return
        // Filter out any subtasks with empty titles
        const cleanedSubTasks = editSubTasks.filter(st => st.title.trim())
        onEdit(todo.id, { title: editTitle, description: editDescription, subTasks: cleanedSubTasks })
        setIsEditing(false)
    }

    const cancelEdit = () => {
        setEditTitle(todo.title)
        setEditDescription(todo.description || '')
        setEditSubTasks(todo.subTasks ?? [])
        setNewSubTaskTitle('')
        setIsEditing(false)
    }

    const startEditing = useCallback(() => {
        setEditTitle(todo.title)
        setEditDescription(todo.description || '')
        setEditSubTasks(todo.subTasks ?? [])
        setNewSubTaskTitle('')
        setIsEditing(true)
    }, [todo.title, todo.description, todo.subTasks])

    const addEditSubTask = () => {
        if (!newSubTaskTitle.trim()) return
        setEditSubTasks(prev => [...prev, { id: crypto.randomUUID(), title: newSubTaskTitle.trim() }])
        setNewSubTaskTitle('')
    }

    const removeEditSubTask = (id: string) => {
        setEditSubTasks(prev => prev.filter(st => st.id !== id))
    }

    const updateEditSubTaskTitle = (id: string, title: string) => {
        setEditSubTasks(prev => prev.map(st => st.id === id ? { ...st, title } : st))
    }

    const handleDelete = () => {
        animateDelete(() => onDelete(todo.id))
    }

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
            {(provided: DraggableProvided, snapshot: DraggableStateSnapshot) => (
                <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    className={cn("group relative py-1.5", className, snapshot.isDragging && "z-50")}
                >
                    <div ref={containerRef} className="anim-todo-item">
                        <div className={cn(
                            "relative overflow-hidden transition-all duration-500 rounded-xl",
                            "bg-card border border-border/50",
                            "hover:border-primary/40 hover:bg-card/90 shadow-sm hover:shadow-md",
                            isCompleted && "opacity-60 grayscale transition-all duration-500",
                            snapshot.isDragging && "shadow-xl border-primary/60 scale-[1.02] rotate-[0.5deg]"
                        )}>
                            {/* 3px left accent bar */}
                            <div className={cn(
                                "absolute top-0 left-0 w-[3px] h-full transition-colors duration-500",
                                isCompleted ? "bg-muted-foreground/20" : "bg-primary"
                            )} />

                            <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4 pl-4 pr-3 py-3.5 sm:py-4">

                                {/* Drag handle — only on hover, desktop only */}
                                {!isDragDisabled && (
                                    <div
                                        {...provided.dragHandleProps}
                                        className="hidden sm:flex items-center justify-center w-4 h-full shrink-0 opacity-0 group-hover:opacity-40 transition-opacity duration-200 cursor-grab active:cursor-grabbing mt-1 text-muted-foreground"
                                        aria-label="Drag to reorder"
                                    >
                                        <GripVertical className="h-4 w-4" />
                                    </div>
                                )}

                                <div className="flex items-start gap-3 sm:gap-4 flex-1 w-full min-w-0">
                                    {/* Completion toggle */}
                                    <div className="mt-1 shrink-0">
                                        {!isDaily ? (
                                            <button
                                                onClick={() => onToggle(todo.id)}
                                                className="relative flex items-center justify-center p-1 rounded-full transition-transform active:scale-90"
                                                aria-label={todo.isCompleted ? "Unmark as completed" : "Mark as completed"}
                                            >
                                                {todo.isCompleted ? (
                                                    <div className="flex items-center justify-center h-5 w-5 rounded-full bg-primary text-primary-foreground">
                                                        <Check className="h-3 w-3" />
                                                    </div>
                                                ) : (
                                                    <div className="h-5 w-5 rounded-full border-2 border-primary/40 group-hover:border-primary transition-colors flex items-center justify-center">
                                                        <div className="h-1.5 w-1.5 rounded-full bg-primary opacity-0 group-hover:opacity-40 transition-opacity" />
                                                    </div>
                                                )}
                                            </button>
                                        ) : (
                                            <div className="relative flex items-center justify-center h-5 w-5">
                                                {allSubTasksCompleted ? (
                                                    <div className="flex items-center justify-center h-5 w-5 rounded-full bg-primary text-primary-foreground shadow-sm">
                                                        <CheckCircle2 className="h-3 w-3" />
                                                    </div>
                                                ) : (
                                                    <div className="h-5 w-5 flex items-center justify-center text-primary/60 group-hover:text-primary transition-colors">
                                                        <Layers className="h-4 w-4" />
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 space-y-2.5 min-w-0">
                                        {isEditing ? (
                                            <div className="space-y-3 pr-2">
                                                <Input
                                                    value={editTitle}
                                                    onChange={(e) => setEditTitle(e.target.value)}
                                                    className="h-10 text-sm font-medium font-sans tracking-tight bg-background/50 border-border/50 focus-visible:border-primary rounded-lg"
                                                    autoFocus
                                                />
                                                <Textarea
                                                    value={editDescription}
                                                    onChange={(e) => setEditDescription(e.target.value)}
                                                    className="min-h-20 text-sm font-normal font-sans bg-background/50 border-border/50 focus-visible:border-primary rounded-lg resize-none"
                                                />

                                                {/* Subtasks inline editor */}
                                                <div className="space-y-2 pt-2 border-t border-border/30">
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-xs font-semibold font-sans text-primary flex items-center gap-1.5">
                                                            <ListChecks className="h-3.5 w-3.5" />
                                                            Sub Tasks
                                                        </span>
                                                        <span className="font-mono text-[10px] text-muted-foreground/60">
                                                            {editSubTasks.length} {editSubTasks.length === 1 ? 'item' : 'items'}
                                                        </span>
                                                    </div>

                                                    {/* Existing subtasks */}
                                                    {editSubTasks.map((st) => (
                                                        <div key={st.id} className="flex items-center gap-2">
                                                            <Input
                                                                value={st.title}
                                                                onChange={(e) => updateEditSubTaskTitle(st.id, e.target.value)}
                                                                className="h-9 text-sm font-sans bg-background/50 border-border/50 focus-visible:border-primary rounded-lg flex-1"
                                                                placeholder="Sub task title..."
                                                            />
                                                            <Button
                                                                type="button"
                                                                variant="ghost"
                                                                size="icon"
                                                                onClick={() => removeEditSubTask(st.id)}
                                                                className="h-9 w-9 shrink-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                                                            >
                                                                <Trash2 className="h-3.5 w-3.5" />
                                                            </Button>
                                                        </div>
                                                    ))}

                                                    {/* New subtask input */}
                                                    <div className="flex items-center gap-2">
                                                        <Input
                                                            value={newSubTaskTitle}
                                                            onChange={(e) => setNewSubTaskTitle(e.target.value)}
                                                            onKeyDown={(e) => {
                                                                if (e.key === 'Enter') {
                                                                    e.preventDefault()
                                                                    addEditSubTask()
                                                                }
                                                            }}
                                                            className="h-9 text-sm font-sans bg-background/50 border-dashed border-border/50 focus-visible:border-primary rounded-lg flex-1"
                                                            placeholder="Add a new sub task..."
                                                        />
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            size="icon"
                                                            onClick={addEditSubTask}
                                                            disabled={!newSubTaskTitle.trim()}
                                                            className="h-9 w-9 shrink-0 border-border/50 hover:bg-primary hover:text-primary-foreground rounded-lg transition-all"
                                                        >
                                                            <PlusCircle className="h-3.5 w-3.5" />
                                                        </Button>
                                                    </div>
                                                </div>

                                                <div className="flex gap-2 pt-1">
                                                    <Button size="sm" onClick={handleSave} className="h-8 px-3 text-xs font-semibold rounded-md">
                                                        <Check className="h-3 w-3 mr-1.5" /> Save
                                                    </Button>
                                                    <Button size="sm" variant="ghost" onClick={cancelEdit} className="h-8 px-3 text-xs font-semibold rounded-md">
                                                        <X className="h-3 w-3 mr-1.5" /> Discard
                                                    </Button>
                                                </div>
                                            </div>
                                        ) : (
                                            <>
                                                <div className="space-y-1">
                                                    <div className="flex items-baseline gap-2.5">
                                                        {/* Serif title for editorial feel */}
                                                        <h3 className={cn(
                                                            "text-[15px] font-serif font-semibold tracking-tight transition-all duration-500 break-words min-w-0 leading-snug",
                                                            isCompleted && "line-through text-muted-foreground/50"
                                                        )}>
                                                            {todo.title}
                                                        </h3>
                                                        {isDaily && (
                                                            <span className="font-mono text-[10px] tracking-wider text-primary/80 bg-primary/10 px-1.5 py-0.5 rounded shrink-0">
                                                                {totalSubTasks > 0 ? `${completedCount}/${totalSubTasks}` : 'Daily'}
                                                            </span>
                                                        )}
                                                        {!isDaily && totalSubTasks > 0 && (
                                                            <span className="font-mono text-[10px] tracking-wider text-primary/80 bg-primary/10 px-1.5 py-0.5 rounded shrink-0">
                                                                {completedCount}/{totalSubTasks}
                                                            </span>
                                                        )}
                                                    </div>
                                                    {todo.description && (
                                                        <p className="text-xs font-normal text-muted-foreground font-sans line-clamp-2 leading-relaxed break-words">
                                                            {todo.description}
                                                        </p>
                                                    )}
                                                </div>

                                                {/* Subtask progress bar — shown for all tasks with subtasks */}
                                                {totalSubTasks > 0 && (
                                                    <div className="w-full h-[2px] bg-muted/60 rounded-full overflow-hidden">
                                                        <div
                                                            className="h-full bg-primary rounded-full transition-all duration-500"
                                                            style={{ width: `${(completedCount / totalSubTasks) * 100}%` }}
                                                        />
                                                    </div>
                                                )}

                                                <div className="flex items-center gap-3 text-[10px] font-mono text-muted-foreground/60 tracking-wider">
                                                    <span className="flex items-center gap-1">
                                                        <Clock className="h-2.5 w-2.5" />
                                                        {format(new Date(todo.createdAt), "MMM d, yyyy")}
                                                    </span>
                                                    {totalSubTasks > 0 && (
                                                        <span className="flex items-center gap-1 text-primary/50">
                                                            <ListChecks className="h-2.5 w-2.5" />
                                                            {totalSubTasks} steps
                                                        </span>
                                                    )}
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>

                                {/* Desktop: hover-reveal action column */}
                                <div className="hidden sm:flex flex-col gap-1.5 shrink-0 opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0 transition-all duration-200">
                                    {isDaily && !isEditing && onTrackDaily && (
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            onClick={() => onTrackDaily(todo)}
                                            className="h-8 w-8 border-border/40 bg-background/80 hover:bg-primary hover:text-primary-foreground rounded-lg shadow-sm transition-all"
                                            title="View History"
                                        >
                                            <CalendarDays className="h-3.5 w-3.5" />
                                        </Button>
                                    )}
                                    {!isEditing && (
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            onClick={startEditing}
                                            className="h-8 w-8 border-border/40 bg-background/80 hover:bg-foreground hover:text-background rounded-lg shadow-sm transition-all"
                                        >
                                            <Pencil className="h-3.5 w-3.5" />
                                        </Button>
                                    )}
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        onClick={handleDelete}
                                        className="h-8 w-8 border-border/40 bg-background/80 hover:bg-destructive hover:text-destructive-foreground rounded-lg shadow-sm transition-all"
                                    >
                                        <Trash2 className="h-3.5 w-3.5" />
                                    </Button>
                                </div>

                            </div>

                            {/* Mobile: full-width action bar with labelled buttons */}
                            {!isEditing && (
                                <div className="sm:hidden flex items-stretch border-t border-border/20 divide-x divide-border/20">
                                    {/* Complete / undo */}
                                    {!isDaily && (
                                        <button
                                            onClick={() => onToggle(todo.id)}
                                            className={cn(
                                                "flex-1 flex flex-col items-center justify-center py-2.5 gap-0.5 transition-colors active:scale-95",
                                                todo.isCompleted ? "text-primary bg-primary/5" : "text-muted-foreground hover:text-primary hover:bg-primary/5"
                                            )}
                                        >
                                            <Check className="h-4 w-4" />
                                            <span className="font-mono text-[9px] tracking-wider uppercase">{todo.isCompleted ? 'Undo' : 'Done'}</span>
                                        </button>
                                    )}
                                    {/* Edit */}
                                    <button
                                        onClick={startEditing}
                                        className="flex-1 flex flex-col items-center justify-center py-2.5 gap-0.5 text-muted-foreground hover:text-foreground hover:bg-muted/20 transition-colors active:scale-95"
                                    >
                                        <Pencil className="h-4 w-4" />
                                        <span className="font-mono text-[9px] tracking-wider uppercase">Edit</span>
                                    </button>
                                    {/* Track (daily only) */}
                                    {isDaily && onTrackDaily && (
                                        <button
                                            onClick={() => onTrackDaily(todo)}
                                            className="flex-1 flex flex-col items-center justify-center py-2.5 gap-0.5 text-muted-foreground hover:text-primary hover:bg-primary/5 transition-colors active:scale-95"
                                        >
                                            <CalendarDays className="h-4 w-4" />
                                            <span className="font-mono text-[9px] tracking-wider uppercase">History</span>
                                        </button>
                                    )}
                                    {/* Delete */}
                                    <button
                                        onClick={handleDelete}
                                        className="flex-1 flex flex-col items-center justify-center py-2.5 gap-0.5 text-muted-foreground hover:text-destructive hover:bg-destructive/5 transition-colors active:scale-95"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                        <span className="font-mono text-[9px] tracking-wider uppercase">Delete</span>
                                    </button>
                                </div>
                            )}

                            {/* Collapsible subtask list — shown for all tasks with subtasks */}
                            {totalSubTasks > 0 && !isEditing && (
                                <Collapsible open={isSubTasksOpen} onOpenChange={setIsSubTasksOpen}>
                                    <CollapsibleTrigger asChild>
                                        <button className="w-full flex items-center justify-between px-4 py-2.5 border-t border-border/20 bg-muted/5 hover:bg-muted/10 transition-colors">
                                            <span className="font-mono text-[10px] tracking-wider text-muted-foreground flex items-center gap-2 uppercase">
                                                <Plus className={cn("h-3 w-3 transition-transform duration-200", isSubTasksOpen && "rotate-45")} />
                                                Sub Tasks ({completedCount}/{totalSubTasks})
                                            </span>
                                            <ChevronDown className={cn("h-3 w-3 text-muted-foreground/50 transition-transform duration-200", isSubTasksOpen && "rotate-180")} />
                                        </button>
                                    </CollapsibleTrigger>
                                    <CollapsibleContent>
                                        <div className="border-t border-border/10 bg-muted/5 px-4 py-3 space-y-2.5">
                                            {subTasks.map((subTask) => {
                                                const isChecked = isDaily
                                                    ? completedSubTaskIds.includes(subTask.id)
                                                    : nonDailyCompletedIds.includes(subTask.id)
                                                return (
                                                    <div
                                                        key={subTask.id}
                                                        className={cn(
                                                            "flex items-center gap-3 py-2 border-b border-border/10 last:border-0",
                                                            isChecked && "opacity-50"
                                                        )}
                                                    >
                                                        <Checkbox
                                                            id={`item-subtask-${todo.id}-${subTask.id}`}
                                                            checked={isChecked}
                                                            onCheckedChange={(checked) => handleSubTaskToggle(subTask.id, checked as boolean)}
                                                            className="h-4 w-4 border-2 border-primary/30 data-[state=checked]:bg-primary data-[state=checked]:border-primary rounded-sm transition-all"
                                                        />
                                                        <label
                                                            htmlFor={`item-subtask-${todo.id}-${subTask.id}`}
                                                            className={cn(
                                                                "text-xs font-sans cursor-pointer transition-colors",
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
