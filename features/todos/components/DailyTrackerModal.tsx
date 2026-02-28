/*
 * File Name:     DailyTrackerModal.tsx
 * Description:   Modal for viewing and completing daily sub-tasks.
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
import { CheckCircle2, ListChecks } from 'lucide-react'
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
 * Modal showing a list of sub-tasks that can be individually marked
 * as completed. Includes a progress counter and a "Mark All Complete"
 * button. The parent `isCompleted` flag is auto-set when all sub-tasks
 * are checked.
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
     * Toggles a single sub-task's completion status and auto-sets
     * `isCompleted` when all sub-tasks are done.
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
            <DialogContent className="sm:max-w-lg border-4 border-foreground rounded-none shadow-xl p-0 overflow-hidden">
                <DialogHeader className="p-6 pb-4 border-b-2 border-border">
                    <DialogTitle className="text-2xl font-serif font-semibold uppercase tracking-tighter">{todo.title}</DialogTitle>
                    <DialogDescription className="font-mono text-sm uppercase tracking-widest text-muted-foreground">
                        {format(today, "EEEE, MMMM d, yyyy")}
                    </DialogDescription>
                </DialogHeader>

                <div className="p-6 space-y-6">
                    {/* Progress Stats */}
                    <div className="flex items-center justify-between px-4 py-4 bg-muted/20 border-2 border-border">
                        <div className="flex items-center gap-2">
                            <ListChecks className="h-5 w-5 text-primary" />
                            <span className="text-sm font-semibold uppercase tracking-wider">Sub-tasks</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className={cn(
                                "text-2xl font-serif font-semibold tracking-tighter",
                                allCompleted && "text-primary"
                            )}>
                                {completedCount}/{totalSubTasks}
                            </span>
                            {allCompleted && (
                                <CheckCircle2 className="h-5 w-5 text-primary" />
                            )}
                        </div>
                    </div>

                    {/* Sub-task List */}
                    {totalSubTasks > 0 ? (
                        <ScrollArea className="max-h-72">
                            <div className="space-y-2">
                                {subTasks.map((subTask) => {
                                    const isChecked = completedSubTaskIds.includes(subTask.id)
                                    return (
                                        <div
                                            key={subTask.id}
                                            className={cn(
                                                "flex items-center space-x-4 p-4 border-2 transition-all duration-200",
                                                isChecked
                                                    ? "border-primary/40 bg-primary/5"
                                                    : "border-border hover:border-primary/30"
                                            )}
                                        >
                                            <Checkbox
                                                id={`subtask-${subTask.id}`}
                                                checked={isChecked}
                                                onCheckedChange={(checked) => handleSubTaskToggle(subTask.id, checked as boolean)}
                                                className="h-5 w-5 border-2 border-primary data-[state=checked]:bg-primary rounded-none shrink-0"
                                            />
                                            <label
                                                htmlFor={`subtask-${subTask.id}`}
                                                className={cn(
                                                    "text-base cursor-pointer leading-snug flex-1",
                                                    isChecked
                                                        ? "line-through text-muted-foreground"
                                                        : "text-foreground"
                                                )}
                                            >
                                                {subTask.title}
                                            </label>
                                            {isChecked && (
                                                <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                                            )}
                                        </div>
                                    )
                                })}
                            </div>
                        </ScrollArea>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed border-border text-center">
                            <ListChecks className="h-10 w-10 text-muted-foreground mb-3 opacity-40" />
                            <p className="text-sm text-muted-foreground uppercase tracking-wider font-semibold">
                                No sub-tasks defined
                            </p>
                            <p className="text-sm text-muted-foreground mt-1">
                                Add sub-tasks when creating or editing this task.
                            </p>
                        </div>
                    )}

                    {/* Mark All Complete Button */}
                    {totalSubTasks > 0 && !allCompleted && (
                        <Button
                            onClick={handleMarkAllComplete}
                            className="w-full rounded-none border-2 border-primary bg-primary text-primary-foreground font-semibold uppercase tracking-wider hover:bg-primary/90 transition-all duration-200 py-6"
                        >
                            <CheckCircle2 className="h-5 w-5 mr-2" />
                            Mark All Complete
                        </Button>
                    )}

                    {/* All Done State */}
                    {allCompleted && totalSubTasks > 0 && (
                        <div className="flex items-center justify-center gap-2 py-4 bg-primary/10 border-2 border-primary/30 text-primary">
                            <CheckCircle2 className="h-5 w-5" />
                            <span className="text-sm font-semibold uppercase tracking-wider">
                                All sub-tasks completed for today!
                            </span>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}
