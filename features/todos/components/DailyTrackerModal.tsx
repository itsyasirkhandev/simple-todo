/*
 * File Name:     DailyTrackerModal.tsx
 * Description:   Modal for tracking daily progress of a specific task.
 * Author:        Antigravity
 * Created Date:  2026-02-28
 */

"use client"

import React, { useState } from 'react'
import { Calendar as CalendarIcon, Save } from 'lucide-react'
import { format } from "date-fns"
import { Todo, DailyProgress } from '@/features/todos/types/todo.types'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog'
import { Calendar } from '@/components/ui/calendar'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'

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
 * Modal to track daily sub-tasks and notes using a Calendar.
 * @param {DailyTrackerModalProps} props - Component properties.
 * @returns {JSX.Element} The rendered modal.
 */
export function DailyTrackerModal({ isOpen, onClose, todo, onSave }: DailyTrackerModalProps) {
    const [date, setDate] = useState<Date | undefined>(new Date())

    // Format date consistently to YYYY-MM-DD
    const dateKey = date ? format(date, "yyyy-MM-dd") : ""

    // Get existing data or defaults for the selected date
    const existingProgress = todo.dailyProgress?.[dateKey]
    const [isCompleted, setIsCompleted] = useState(existingProgress?.isCompleted || false)
    const [completedSubTasks, setCompletedSubTasks] = useState<string[]>(existingProgress?.completedSubTasks || [])
    const [notes, setNotes] = useState(existingProgress?.notes || "")

    // Reset local state when date changes
    React.useEffect(() => {
        if (dateKey) {
            const progress = todo.dailyProgress?.[dateKey]
            setIsCompleted(progress?.isCompleted || false)
            setCompletedSubTasks(progress?.completedSubTasks || [])
            setNotes(progress?.notes || "")
        }
    }, [dateKey, todo.dailyProgress])

    const handleSubTaskToggle = (subTaskId: string, checked: boolean) => {
        if (checked) {
            setCompletedSubTasks(prev => [...prev, subTaskId])
        } else {
            setCompletedSubTasks(prev => prev.filter(id => id !== subTaskId))
        }
    }

    const handleSave = () => {
        if (!dateKey) return

        onSave(todo.id, dateKey, {
            isCompleted,
            completedSubTasks,
            notes
        })
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[600px] border-4 border-foreground rounded-none shadow-xl">
                <DialogHeader>
                    <DialogTitle className="text-xl font-serif font-bold uppercase tracking-widest">{todo.title}</DialogTitle>
                    <DialogDescription className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
                        Daily Tracker
                    </DialogDescription>
                </DialogHeader>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
                    {/* Calendar Section */}
                    <div className="flex flex-col items-center border-2 border-border p-4">
                        <Calendar
                            mode="single"
                            selected={date}
                            onSelect={setDate}
                            className="rounded-none border-none p-0"
                        />
                    </div>

                    {/* Progress Section */}
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <h4 className="text-sm font-semibold uppercase tracking-widest text-foreground flex items-center gap-2">
                                <CalendarIcon className="h-4 w-4" />
                                {date ? format(date, "MMMM d, yyyy") : "Select a date"}
                            </h4>
                        </div>

                        {todo.subTasks && todo.subTasks.length > 0 && (
                            <div className="space-y-4 rounded-none border-2 border-border p-4 bg-muted/20">
                                <Label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                                    Sub-Tasks
                                </Label>
                                <div className="space-y-3">
                                    {todo.subTasks.map((subTask) => (
                                        <div key={subTask.id} className="flex items-center space-x-2">
                                            <Checkbox
                                                id={`subtask-${subTask.id}`}
                                                checked={completedSubTasks.includes(subTask.id)}
                                                onCheckedChange={(checked) => handleSubTaskToggle(subTask.id, checked as boolean)}
                                                className="rounded-none"
                                            />
                                            <label
                                                htmlFor={`subtask-${subTask.id}`}
                                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                            >
                                                {subTask.title}
                                            </label>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label htmlFor="daily-notes" className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                                Daily Notes
                            </Label>
                            <Textarea
                                id="daily-notes"
                                placeholder="How did it go today?"
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                className="min-h-24 resize-none border-2 border-border focus-visible:ring-0 focus:border-foreground rounded-none"
                            />
                        </div>

                        <div className="flex items-center space-x-2 p-4 border-2 border-border bg-foreground/5">
                            <Checkbox
                                id="day-completed"
                                checked={isCompleted}
                                onCheckedChange={(checked) => setIsCompleted(checked as boolean)}
                                className="rounded-none"
                            />
                            <label
                                htmlFor="day-completed"
                                className="text-sm font-bold uppercase tracking-wider leading-none cursor-pointer"
                            >
                                Mark Day Complete
                            </label>
                        </div>

                        <Button
                            onClick={handleSave}
                            className="w-full h-12 rounded-none border-2 border-transparent transition-all hover:bg-foreground hover:text-background uppercase tracking-widest font-bold"
                        >
                            <Save className="mr-2 h-4 w-4" /> Save Progress
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
