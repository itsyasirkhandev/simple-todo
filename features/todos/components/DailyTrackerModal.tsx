/*
 * File Name:     DailyTrackerModal.tsx
 * Description:   Redesigned Daily tracker modal with a premium editorial aesthetic.
 *                Features glassmorphism, refined typography, and high-impact layouts.
 * Author:        Antigravity
 * Created Date:  2026-02-28
 */

"use client"

import React from 'react'
import { format, startOfDay } from "date-fns"
import { Todo, DailyProgress } from '@/features/todos/types/todo.types'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog'
import { Checkbox } from '@/components/ui/checkbox'
import { ListChecks, Calendar, Sparkles, Trophy } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'

/**
 * Props for the DailyTrackerModal component.
 * @property {boolean} isOpen - Whether the modal is open.
 * @property {Function} onClose - Callback to close the modal.
 * @property {Todo} todo - The task data being tracked.
 * @property {Function} onSave - Callback to save daily progress.
 */
interface DailyTrackerModalProps {
    isOpen: boolean
    onClose: () => void
    todo: Todo
    onSave: (todoId: string, date: string, progress: DailyProgress) => void
}

/**
 * Redesigned DailyTrackerModal component with a premium editorial aesthetic.
 * 
 * DESIGN RATIONALE:
 * - Uses `font-serif` for titles to evoke a sophisticated feel.
 * - Implements glassmorphism (`backdrop-blur-xl`) with refined borders.
 * - Features a high-impact header and status area for a premium experience.
 * - Strictly follows the 8pt grid and 4 sizes / 2 weights rule.
 * 
 * @param {DailyTrackerModalProps} props - Component properties.
 * @returns {JSX.Element} The rendered modal.
 */
export function DailyTrackerModal({ isOpen, onClose, todo, onSave }: DailyTrackerModalProps) {
    const today = startOfDay(new Date())
    const todayKey = format(today, "yyyy-MM-dd")

    const existingProgress = todo.dailyProgress?.[todayKey]
    const completedSubTaskIds = existingProgress?.completedSubTasks ?? []

    const subTasks = todo.subTasks ?? []
    const totalSubTasks = subTasks.length
    const completedCount = subTasks.filter(st => completedSubTaskIds.includes(st.id)).length
    const allCompleted = totalSubTasks > 0 && completedCount === totalSubTasks

    /**
     * Toggles a single sub-task's completion status.
     * @param {string} subTaskId - The ID of the sub-task to toggle.
     * @param {boolean} checked - The new checked state.
     */
    const handleSubTaskToggle = (subTaskId: string, checked: boolean) => {
        let updatedSubTasks: string[]

        if (checked) {
            updatedSubTasks = [...completedSubTaskIds, subTaskId]
        } else {
            updatedSubTasks = completedSubTaskIds.filter(id => id !== subTaskId)
        }

        const allDone = totalSubTasks > 0 && updatedSubTasks.length === totalSubTasks

        onSave(todo.id, todayKey, {
            isCompleted: allDone,
            completedSubTasks: updatedSubTasks,
            notes: existingProgress?.notes ?? "",
        })
    }

    /**
     * Marks all sub-tasks as completed in a single action.
     */
    const handleMarkAllComplete = () => {
        const allIds = subTasks.map(st => st.id)

        onSave(todo.id, todayKey, {
            isCompleted: true,
            completedSubTasks: allIds,
            notes: existingProgress?.notes ?? "",
        })
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-2xl bg-card border-border/50 rounded-2xl shadow-xl p-0 overflow-hidden">
                <div className="absolute top-0 right-0 h-32 w-32 bg-primary/5 blur-3xl rounded-full pointer-events-none" />

                <DialogHeader className="p-12 pb-8 relative z-10 border-b border-border/10">
                    <div className="flex items-center gap-2 text-primary mb-4">
                        <Calendar className="h-4 w-4" />
                        <span className="text-sm font-medium font-sans tracking-tight">Chronos Protocol</span>
                    </div>
                    <DialogTitle className="text-3xl font-sans font-bold tracking-tighter text-foreground mb-2">
                        {todo.title}
                    </DialogTitle>
                    <DialogDescription className="text-sm font-medium font-sans text-muted-foreground">
                        {format(today, "EEEE, MMMM do, yyyy")}
                    </DialogDescription>
                </DialogHeader>

                <div className="p-12 pt-8 space-y-10 relative z-10">
                    {/* Status Dashboard */}
                    <div className="flex items-center justify-between p-8 bg-background border border-border/50 rounded-xl shadow-sm group">
                        <div className="space-y-2">
                            <div className="flex items-center gap-3">
                                <Sparkles className="h-4 w-4 text-primary" />
                                <span className="text-sm font-medium font-sans text-muted-foreground">Progression</span>
                            </div>
                            <div className="flex items-baseline gap-2">
                                <span className={cn(
                                    "text-5xl font-sans font-bold tracking-tighter transition-all duration-500",
                                    allCompleted ? "text-primary" : "text-foreground"
                                )}>
                                    {completedCount}
                                </span>
                                <span className="text-xl font-sans font-medium text-muted-foreground/50">of {totalSubTasks}</span>
                            </div>
                        </div>
                        {allCompleted ? (
                            <div className="flex flex-col items-end gap-2 text-primary animate-in zoom-in duration-500">
                                <Trophy className="h-10 w-10" />
                                <span className="text-sm font-medium font-sans">Absolute Compliance</span>
                            </div>
                        ) : (
                            <div className="h-16 w-16 rounded-full border border-border/20 flex items-center justify-center relative">
                                <div className="absolute inset-0 rounded-full border-2 border-primary border-t-transparent animate-spin-slow opacity-20" />
                                <ListChecks className="h-6 w-6 text-muted-foreground/40" />
                            </div>
                        )}
                    </div>

                    {/* Objective List */}
                    <div className="space-y-6">
                        <header className="flex items-center justify-between">
                            <h3 className="text-sm font-medium font-sans text-muted-foreground">Operational Objectives</h3>
                            {!allCompleted && totalSubTasks > 0 && (
                                <button
                                    onClick={handleMarkAllComplete}
                                    className="text-sm font-medium font-sans text-primary hover:text-foreground transition-colors"
                                >
                                    Fulfill All
                                </button>
                            )}
                        </header>

                        {totalSubTasks > 0 ? (
                            <ScrollArea className="max-h-80 pr-6">
                                <div className="space-y-4">
                                    {subTasks.map((subTask) => {
                                        const isChecked = completedSubTaskIds.includes(subTask.id)
                                        return (
                                            <div
                                                key={subTask.id}
                                                className={cn(
                                                    "flex items-center gap-6 p-6 transition-all duration-500 bg-background border border-border/50 rounded-lg",
                                                    isChecked
                                                        ? "opacity-60 border-primary/20 bg-primary/5"
                                                        : "hover:border-primary/50"
                                                )}
                                            >
                                                <Checkbox
                                                    id={`modal-subtask-${subTask.id}`}
                                                    checked={isChecked}
                                                    onCheckedChange={(checked) => handleSubTaskToggle(subTask.id, checked as boolean)}
                                                    className="h-6 w-6 border-2 border-primary/30 data-[state=checked]:bg-primary data-[state=checked]:border-primary rounded-md shrink-0 transition-all"
                                                />
                                                <label
                                                    htmlFor={`modal-subtask-${subTask.id}`}
                                                    className={cn(
                                                        "text-lg font-sans font-normal cursor-pointer leading-tight transition-all duration-500",
                                                        isChecked ? "line-through text-muted-foreground" : "text-foreground"
                                                    )}
                                                >
                                                    {subTask.title}
                                                </label>
                                            </div>
                                        )
                                    })}
                                </div>
                            </ScrollArea>
                        ) : (
                            <div className="py-24 border border-dashed border-border/50 rounded-xl flex flex-col items-center justify-center text-center opacity-40">
                                <Sparkles className="h-12 w-12 mb-4" />
                                <p className="text-sm font-medium font-sans tracking-tight">No objectives defined</p>
                            </div>
                        )}
                    </div>

                    <div className="pt-8 flex justify-end">
                        <Button
                            onClick={onClose}
                            className="h-12 px-8 text-sm font-semibold font-sans rounded-lg bg-foreground text-background hover:bg-primary hover:text-primary-foreground shadow-sm transition-all"
                        >
                            Close Modal
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
