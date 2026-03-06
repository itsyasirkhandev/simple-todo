/*
 * File Name:     RecycleBin.view.tsx
 * Description:   Recycle bin page — industrial-editorial design matching the
 *                Eisenhower Matrix aesthetic. Shows soft-deleted tasks with
 *                restore and permanent-delete actions.
 */

"use client"

import React, { useState } from 'react'
import { Trash2, RotateCcw, AlertTriangle, Clock, Layers, ListChecks, X } from 'lucide-react'
import { useTodos } from '../hooks/useTodos'
import { DeletedTodo } from '../types/todo.types'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { format, formatDistanceToNow } from 'date-fns'

/* ─── Priority label helper ─── */
const priorityLabels: Record<string, { label: string; color: string }> = {
    'urgent-important': { label: 'Urgent & Important', color: 'text-red-500 dark:text-red-400' },
    'unurgent-important': { label: 'Not Urgent & Important', color: 'text-blue-500 dark:text-blue-400' },
    'urgent-unimportant': { label: 'Urgent & Not Important', color: 'text-amber-500 dark:text-amber-400' },
    'unurgent-unimportant': { label: 'Not Urgent & Not Important', color: 'text-emerald-500 dark:text-emerald-400' },
}

export const RecycleBin = () => {
    const { deletedTodos, isLoaded, restoreTodo, permanentlyDeleteTodo, emptyRecycleBin } = useTodos()
    const [confirmEmptyAll, setConfirmEmptyAll] = useState(false)
    const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)

    if (!isLoaded) return null

    return (
        <div className="min-h-screen bg-background text-foreground selection:bg-primary/25 selection:text-foreground px-4 sm:px-8 md:px-12 pt-8 sm:pt-28 md:pt-40 pb-8 sm:pb-12 relative">
            {/* Geometric grid texture */}
            <div
                aria-hidden
                className="fixed inset-0 pointer-events-none z-0 opacity-[0.035] dark:opacity-[0.04]"
                style={{
                    backgroundImage: `linear-gradient(var(--color-border, #888) 1px, transparent 1px), linear-gradient(90deg, var(--color-border, #888) 1px, transparent 1px)`,
                    backgroundSize: '48px 48px',
                }}
            />

            {/* Noise grain overlay */}
            <div aria-hidden className="fixed inset-0 noise-overlay z-0" />

            <main className="max-w-4xl mx-auto space-y-6 sm:space-y-10 relative z-10">

                {/* ── Editorial Hero Header ── */}
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-3 duration-700">
                    <p className="label-mono text-destructive/80">Recycle Bin</p>
                    <h1 className="display-serif text-3xl sm:text-5xl md:text-6xl text-foreground leading-[1.05] tracking-[-0.03em]">
                        Deleted{' '}
                        <em className="not-italic font-normal text-muted-foreground/60 italic">
                            Tasks
                        </em>
                    </h1>
                    <div className="rule-x mt-2" />

                    {/* Stats + Empty All */}
                    <div className="flex items-center justify-between pt-2">
                        <p className="font-mono text-xs text-muted-foreground tracking-wider">
                            {deletedTodos.length} {deletedTodos.length === 1 ? 'task' : 'tasks'} in bin
                        </p>

                        {deletedTodos.length > 0 && (
                            <div className="relative">
                                {confirmEmptyAll ? (
                                    <div className="flex items-center gap-2 animate-in fade-in slide-in-from-right-2 duration-200">
                                        <span className="text-xs font-mono text-destructive tracking-wider">Delete all permanently?</span>
                                        <Button
                                            size="sm"
                                            variant="destructive"
                                            onClick={() => {
                                                emptyRecycleBin()
                                                setConfirmEmptyAll(false)
                                            }}
                                            className="h-7 px-3 text-xs font-mono tracking-wider rounded-lg"
                                        >
                                            Yes, delete all
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => setConfirmEmptyAll(false)}
                                            className="h-7 px-2 text-xs rounded-lg"
                                        >
                                            <X className="h-3.5 w-3.5" />
                                        </Button>
                                    </div>
                                ) : (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setConfirmEmptyAll(true)}
                                        className="h-8 px-3 text-xs font-mono tracking-wider border-destructive/30 text-destructive hover:bg-destructive hover:text-destructive-foreground rounded-lg transition-all duration-200"
                                    >
                                        <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                                        Empty Bin
                                    </Button>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* ── Empty State ── */}
                {deletedTodos.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-20 sm:py-32 animate-in fade-in duration-500">
                        <div className="relative mb-6">
                            <div className="absolute inset-0 bg-primary/10 rounded-full blur-2xl scale-150" />
                            <div className="relative flex items-center justify-center h-20 w-20 rounded-full bg-muted/40 border border-border/40">
                                <Trash2 className="h-8 w-8 text-muted-foreground/40" />
                            </div>
                        </div>
                        <h2 className="text-lg font-serif font-semibold text-foreground/80 mb-2">
                            Recycle bin is empty
                        </h2>
                        <p className="text-sm text-muted-foreground/60 font-sans max-w-xs text-center leading-relaxed">
                            When you delete tasks, they&apos;ll appear here so you can restore them if needed.
                        </p>
                    </div>
                )}

                {/* ── Deleted Tasks List ── */}
                {deletedTodos.length > 0 && (
                    <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-500">
                        {deletedTodos.map((entry: DeletedTodo) => (
                            <DeletedTodoCard
                                key={entry.todo.id}
                                entry={entry}
                                onRestore={restoreTodo}
                                onPermanentDelete={permanentlyDeleteTodo}
                                isConfirmingDelete={confirmDeleteId === entry.todo.id}
                                onConfirmDelete={() => setConfirmDeleteId(entry.todo.id)}
                                onCancelDelete={() => setConfirmDeleteId(null)}
                            />
                        ))}
                    </div>
                )}
            </main>
        </div>
    )
}

/* ─── Deleted Todo Card ─── */
interface DeletedTodoCardProps {
    entry: DeletedTodo
    onRestore: (id: string) => void
    onPermanentDelete: (id: string) => void
    isConfirmingDelete: boolean
    onConfirmDelete: () => void
    onCancelDelete: () => void
}

const DeletedTodoCard = ({
    entry,
    onRestore,
    onPermanentDelete,
    isConfirmingDelete,
    onConfirmDelete,
    onCancelDelete,
}: DeletedTodoCardProps) => {
    const { todo, deletedAt } = entry
    const priority = priorityLabels[todo.priority]
    const isDaily = todo.isDaily ?? false
    const subTasks = todo.subTasks ?? []

    return (
        <div className="group relative animate-in fade-in slide-in-from-bottom-1 duration-300">
            <div className={cn(
                "relative overflow-hidden transition-all duration-300 rounded-xl",
                "bg-card border border-border/50",
                "hover:border-border/80 hover:shadow-md",
            )}>
                {/* 3px left accent bar — destructive color to indicate deleted state */}
                <div className="absolute top-0 left-0 w-[3px] h-full bg-destructive/40 transition-colors duration-500" />

                <div className="flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-5 pl-5 pr-4 py-4">

                    {/* Deleted indicator icon */}
                    <div className="hidden sm:flex items-center justify-center mt-1 shrink-0">
                        <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-destructive/10 text-destructive/60">
                            <Trash2 className="h-4 w-4" />
                        </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 space-y-2 min-w-0">
                        {/* Title + badges */}
                        <div className="space-y-1.5">
                            <div className="flex items-baseline gap-2.5 flex-wrap">
                                <h3 className="text-[15px] font-serif font-semibold tracking-tight text-foreground/80 break-words min-w-0 leading-snug line-through decoration-muted-foreground/30">
                                    {todo.title}
                                </h3>
                                {isDaily && (
                                    <span className="font-mono text-[10px] tracking-wider text-primary/60 bg-primary/8 px-1.5 py-0.5 rounded shrink-0">
                                        Daily
                                    </span>
                                )}
                            </div>
                            {todo.description && (
                                <p className="text-xs font-normal text-muted-foreground/60 font-sans line-clamp-2 leading-relaxed break-words">
                                    {todo.description}
                                </p>
                            )}
                        </div>

                        {/* Subtasks summary */}
                        {subTasks.length > 0 && (
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground/50 font-mono">
                                <ListChecks className="h-3 w-3" />
                                <span>{subTasks.length} sub-task{subTasks.length !== 1 ? 's' : ''}</span>
                            </div>
                        )}

                        {/* Meta info row */}
                        <div className="flex items-center gap-3 flex-wrap text-[10px] font-mono text-muted-foreground/50 tracking-wider">
                            {/* Priority badge */}
                            <span className={cn("flex items-center gap-1", priority?.color)}>
                                <Layers className="h-2.5 w-2.5" />
                                {priority?.label}
                            </span>
                            {/* Created date */}
                            <span className="flex items-center gap-1">
                                <Clock className="h-2.5 w-2.5" />
                                Created {format(new Date(todo.createdAt), "MMM d, yyyy")}
                            </span>
                            {/* Deleted time */}
                            <span className="flex items-center gap-1 text-destructive/50">
                                <Trash2 className="h-2.5 w-2.5" />
                                Deleted {formatDistanceToNow(new Date(deletedAt), { addSuffix: true })}
                            </span>
                        </div>
                    </div>

                    {/* Desktop Actions */}
                    <div className="hidden sm:flex flex-col gap-2 shrink-0 self-center">
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onRestore(todo.id)}
                            className="h-9 px-4 text-xs font-mono tracking-wider border-primary/30 text-primary hover:bg-primary hover:text-primary-foreground rounded-lg transition-all duration-200 gap-1.5"
                        >
                            <RotateCcw className="h-3.5 w-3.5" />
                            Restore
                        </Button>
                        {isConfirmingDelete ? (
                            <div className="flex items-center gap-1.5 animate-in fade-in duration-200">
                                <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => onPermanentDelete(todo.id)}
                                    className="h-8 px-2.5 text-[10px] font-mono tracking-wider rounded-lg"
                                >
                                    Confirm
                                </Button>
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={onCancelDelete}
                                    className="h-8 px-2 rounded-lg"
                                >
                                    <X className="h-3. w-3.5" />
                                </Button>
                            </div>
                        ) : (
                            <Button
                                size="sm"
                                variant="ghost"
                                onClick={onConfirmDelete}
                                className="h-9 px-4 text-xs font-mono tracking-wider text-destructive/70 hover:text-destructive hover:bg-destructive/10 rounded-lg transition-all duration-200 gap-1.5"
                            >
                                <Trash2 className="h-3.5 w-3.5" />
                                Delete
                            </Button>
                        )}
                    </div>
                </div>

                {/* Mobile: full-width action bar */}
                <div className="sm:hidden flex items-stretch border-t border-border/20 divide-x divide-border/20">
                    <button
                        onClick={() => onRestore(todo.id)}
                        className="flex-1 flex flex-col items-center justify-center py-2.5 gap-0.5 text-primary hover:bg-primary/5 transition-colors active:scale-95"
                    >
                        <RotateCcw className="h-4 w-4" />
                        <span className="font-mono text-[9px] tracking-wider uppercase">Restore</span>
                    </button>
                    {isConfirmingDelete ? (
                        <>
                            <button
                                onClick={() => onPermanentDelete(todo.id)}
                                className="flex-1 flex flex-col items-center justify-center py-2.5 gap-0.5 text-destructive bg-destructive/5 transition-colors active:scale-95"
                            >
                                <AlertTriangle className="h-4 w-4" />
                                <span className="font-mono text-[9px] tracking-wider uppercase">Confirm</span>
                            </button>
                            <button
                                onClick={onCancelDelete}
                                className="flex-1 flex flex-col items-center justify-center py-2.5 gap-0.5 text-muted-foreground hover:text-foreground hover:bg-muted/20 transition-colors active:scale-95"
                            >
                                <X className="h-4 w-4" />
                                <span className="font-mono text-[9px] tracking-wider uppercase">Cancel</span>
                            </button>
                        </>
                    ) : (
                        <button
                            onClick={onConfirmDelete}
                            className="flex-1 flex flex-col items-center justify-center py-2.5 gap-0.5 text-muted-foreground hover:text-destructive hover:bg-destructive/5 transition-colors active:scale-95"
                        >
                            <Trash2 className="h-4 w-4" />
                            <span className="font-mono text-[9px] tracking-wider uppercase">Delete</span>
                        </button>
                    )}
                </div>
            </div>
        </div>
    )
}
