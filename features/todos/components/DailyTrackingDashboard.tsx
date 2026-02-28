/*
 * File Name:     DailyTrackingDashboard.tsx
 * Description:   Dashboard for viewing daily task completion history with today-only interaction.
 * Author:        Antigravity
 * Created Date:  2026-02-28
 */

"use client"

import React, { useState } from 'react'
import { Calendar } from '@/components/ui/calendar'
import { Checkbox } from '@/components/ui/checkbox'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Todo, DailyProgress } from '../types/todo.types'
import { cn } from '@/lib/utils'
import { CalendarDays, CheckCircle2, Circle, TrendingUp } from 'lucide-react'
import { format, startOfDay } from 'date-fns'

/**
 * Props for the DailyTrackingDashboard component.
 * @property {Todo[]} dailyTodos - List of daily-tracked tasks.
 * @property {Function} onSaveProgress - Callback to persist progress changes.
 */
interface DailyTrackingDashboardProps {
    dailyTodos: Todo[]
    onSaveProgress: (todoId: string, dateKey: string, progress: DailyProgress) => void
}

/**
 * Dashboard that displays a read-only calendar with completion history
 * and allows users to mark only today's tasks as completed.
 * @param {DailyTrackingDashboardProps} props - Component properties.
 * @returns {JSX.Element} The rendered dashboard.
 */
export function DailyTrackingDashboard({ dailyTodos, onSaveProgress }: DailyTrackingDashboardProps) {
    const [selectedTodoId, setSelectedTodoId] = useState<string | null>(dailyTodos[0]?.id || null)

    const today = startOfDay(new Date())
    const todayKey = format(today, "yyyy-MM-dd")

    const selectedTodo = dailyTodos.find(t => t.id === selectedTodoId)

    const selectedDailyProgress = selectedTodo?.dailyProgress

    /** Dates where the selected task was marked as completed */
    const completedDates = selectedDailyProgress
        ? Object.entries(selectedDailyProgress)
            .filter(([, progress]) => progress.isCompleted)
            .map(([dateStr]) => new Date(dateStr + "T00:00:00"))
        : []

    const completedCount = completedDates.length
    const isTodayCompleted = selectedTodo?.dailyProgress?.[todayKey]?.isCompleted ?? false

    /**
     * Handles toggling today's completion status for the selected task.
     * @param {boolean} checked - The new checked state.
     */
    const handleTodayToggle = (checked: boolean) => {
        if (!selectedTodo) return
        const existingProgress = selectedTodo.dailyProgress?.[todayKey]
        onSaveProgress(selectedTodo.id, todayKey, {
            isCompleted: checked,
            completedSubTasks: existingProgress?.completedSubTasks ?? [],
            notes: existingProgress?.notes ?? "",
        })
    }

    if (dailyTodos.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-96 border border-dashed border-border/40 bg-card/50 p-12 text-center">
                <CalendarDays className="h-16 w-16 text-muted-foreground mb-4 opacity-50" />
                <h2 className="text-2xl font-serif font-semibold tracking-tighter uppercase mb-2">No Daily Tasks</h2>
                <p className="text-muted-foreground max-w-md">Activate the &quot;Daily Task&quot; switch when creating a new task to see it here.</p>
            </div>
        )
    }

    return (
        <div className="flex flex-col md:flex-row border border-border/40 bg-card/50 shadow-sm overflow-hidden rounded-none">
            {/* Sidebar List */}
            <div className="w-full md:w-1/3 border-b md:border-b-0 md:border-r border-border/40 bg-muted/5 flex flex-col">
                <div className="p-6 border-b border-border/40">
                    <h2 className="text-2xl font-serif font-semibold tracking-tighter uppercase">Daily Tasks</h2>
                    <p className="text-sm text-muted-foreground mt-1">Select a task to view progress</p>
                </div>
                <ScrollArea className="flex-1 p-4">
                    <div className="space-y-2">
                        {dailyTodos.map(todo => {
                            const todoTodayCompleted = todo.dailyProgress?.[todayKey]?.isCompleted ?? false
                            const todoTotalCompleted = todo.dailyProgress
                                ? Object.values(todo.dailyProgress).filter(p => p.isCompleted).length
                                : 0

                            return (
                                <button
                                    key={todo.id}
                                    onClick={() => setSelectedTodoId(todo.id)}
                                    className={cn(
                                        "w-full text-left p-4 transition-all duration-200 border rounded-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
                                        selectedTodoId === todo.id
                                            ? "border-primary/40 bg-primary/5 shadow-sm"
                                            : "border-transparent hover:border-border/40 hover:bg-muted/20"
                                    )}
                                >
                                    <div className="font-semibold text-base truncate flex items-center justify-between">
                                        {todo.title}
                                        {todoTodayCompleted ? (
                                            <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                                        ) : (
                                            <Circle className="h-4 w-4 text-muted-foreground shrink-0" />
                                        )}
                                    </div>
                                    <div className="text-sm text-muted-foreground mt-1 flex items-center gap-2">
                                        <span className="bg-primary/20 text-primary px-2 py-0.5 rounded-full text-sm font-semibold uppercase tracking-wider">
                                            {todoTotalCompleted} days
                                        </span>
                                    </div>
                                </button>
                            )
                        })}
                    </div>
                </ScrollArea>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 bg-background relative">
                {selectedTodo ? (
                    <>
                        {/* Header */}
                        <div className="p-6 md:p-8 border-b border-border/30 flex items-center justify-between sticky top-0 bg-background/95 backdrop-blur z-10">
                            <div>
                                <h3 className="text-3xl font-serif font-semibold tracking-tighter uppercase break-words">{selectedTodo.title}</h3>
                                <p className="text-muted-foreground mt-1 text-sm font-semibold tracking-wide uppercase">
                                    {format(today, "EEEE, MMMM d, yyyy")}
                                </p>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 md:p-8">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12">
                                {/* Left Side: Read-only Calendar */}
                                <div className="space-y-8">
                                    <div className="bg-card border border-border/40 p-4 shadow-sm inline-block rounded-none">
                                        <Calendar
                                            mode="multiple"
                                            selected={completedDates}
                                            className="rounded-none font-sans"
                                            disabled={() => true}
                                            modifiers={{
                                                completed: completedDates,
                                                today: [today],
                                            }}
                                            modifiersClassNames={{
                                                completed: "bg-primary/20 text-primary font-semibold",
                                            }}
                                        />
                                        {/* Legend */}
                                        <div className="flex items-center gap-4 mt-4 pt-4 border-t border-border/30 justify-center">
                                            <div className="flex items-center gap-2">
                                                <div className="h-4 w-4 rounded-none bg-primary/20 border border-primary/40" />
                                                <span className="text-sm text-muted-foreground">Completed</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className="h-4 w-4 rounded-none bg-accent border border-border" />
                                                <span className="text-sm text-muted-foreground">Today</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Stats Card */}
                                    <div className="bg-muted/5 border border-border/40 p-6 rounded-none space-y-4">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <TrendingUp className="h-5 w-5 text-primary" />
                                                <span className="text-sm font-semibold uppercase tracking-wider">Total Completed</span>
                                            </div>
                                            <span className="text-3xl font-serif font-semibold tracking-tighter">{completedCount}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Right Side: Today's Completion */}
                                <div className="space-y-8">
                                    {/* Today's Task Checkbox */}
                                    <div>
                                        <h4 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground border-b border-border/30 pb-2 mb-4">
                                            Today&apos;s Progress
                                        </h4>
                                        <div className={cn(
                                            "p-6 border transition-all duration-300",
                                            isTodayCompleted
                                                ? "border-primary/30 bg-primary/5"
                                                : "border-border/40 hover:border-primary/30"
                                        )}>
                                            <div className="flex items-center space-x-4">
                                                <Checkbox
                                                    id="dashboard-today-complete"
                                                    checked={isTodayCompleted}
                                                    onCheckedChange={(checked) => handleTodayToggle(checked as boolean)}
                                                    className="h-6 w-6 border border-primary data-[state=checked]:bg-primary rounded-none"
                                                />
                                                <div className="flex-1">
                                                    <label
                                                        htmlFor="dashboard-today-complete"
                                                        className="text-base font-semibold uppercase tracking-wider cursor-pointer leading-none block"
                                                    >
                                                        {isTodayCompleted ? "Completed Today ✓" : "Mark Today Complete"}
                                                    </label>
                                                    <p className="text-sm text-muted-foreground mt-2">
                                                        Check this when you&apos;ve successfully completed the task for today.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Sub-tasks Read-Only View */}
                                    {selectedTodo.subTasks && selectedTodo.subTasks.length > 0 && (
                                        <div>
                                            <h4 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground border-b border-border/30 pb-2 mb-4">
                                                Daily Items
                                            </h4>
                                            <div className="space-y-2 bg-card border border-border/40 p-4 shadow-sm rounded-none">
                                                {selectedTodo.subTasks.map(task => (
                                                    <div key={task.id} className="flex items-center space-x-4 p-2">
                                                        <Circle className="h-4 w-4 text-muted-foreground shrink-0" />
                                                        <span className="text-base text-muted-foreground">
                                                            {task.title}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="h-full flex items-center justify-center p-8 opacity-50">
                        <p className="text-base font-serif tracking-tighter uppercase">Select a task from the sidebar</p>
                    </div>
                )}
            </div>
        </div>
    )
}
