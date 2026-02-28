/*
 * File Name:     DailyTrackingDashboard.tsx
 * Description:   Analytics dashboard for viewing daily task completion with a calendar heatmap.
 *                Entirely read-only — no editing capabilities.
 * Author:        Antigravity
 * Created Date:  2026-02-28
 */

"use client"

import React, { useState, useMemo } from 'react'
import { Calendar } from '@/components/ui/calendar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Badge } from '@/components/ui/badge'
import { Todo } from '../types/todo.types'
import { cn } from '@/lib/utils'
import {
    CalendarDays,
    CheckCircle2,
    Circle,
    TrendingUp,
    Flame,
    Trophy,
    BarChart2,
    Eye,
} from 'lucide-react'
import {
    format,
    startOfDay,
    subDays,
    eachDayOfInterval,
    isSameDay,
    differenceInCalendarDays,
    startOfWeek,
    endOfWeek,
} from 'date-fns'

/**
 * Props for the DailyTrackingDashboard component.
 * @property {Todo[]} dailyTodos - List of daily-tracked tasks.
 */
interface DailyTrackingDashboardProps {
    dailyTodos: Todo[]
}

/**
 * Calculates the current consecutive completion streak for a task.
 * @param {Record<string, { isCompleted: boolean }>} progress - The daily progress record.
 * @returns {number} The current streak length in days.
 */
function calculateCurrentStreak(progress: Record<string, { isCompleted: boolean }> | undefined): number {
    if (!progress) return 0

    const today = startOfDay(new Date())
    let streak = 0
    let checkDate = today

    // Check today first, if not completed, start from yesterday
    const todayKey = format(today, "yyyy-MM-dd")
    if (!progress[todayKey]?.isCompleted) {
        checkDate = subDays(today, 1)
    }

    while (true) {
        const key = format(checkDate, "yyyy-MM-dd")
        if (progress[key]?.isCompleted) {
            streak++
            checkDate = subDays(checkDate, 1)
        } else {
            break
        }
    }

    return streak
}

/**
 * Calculates the best (longest) consecutive completion streak for a task.
 * @param {Record<string, { isCompleted: boolean }>} progress - The daily progress record.
 * @returns {number} The longest streak in days.
 */
function calculateBestStreak(progress: Record<string, { isCompleted: boolean }> | undefined): number {
    if (!progress) return 0

    const completedDates = Object.entries(progress)
        .filter(([, p]) => p.isCompleted)
        .map(([dateStr]) => new Date(dateStr + "T00:00:00"))
        .sort((a, b) => a.getTime() - b.getTime())

    if (completedDates.length === 0) return 0

    let bestStreak = 1
    let currentStreak = 1

    for (let i = 1; i < completedDates.length; i++) {
        const diff = differenceInCalendarDays(completedDates[i], completedDates[i - 1])
        if (diff === 1) {
            currentStreak++
            bestStreak = Math.max(bestStreak, currentStreak)
        } else {
            currentStreak = 1
        }
    }

    return bestStreak
}

/**
 * Calculates how many completions fall within the current week (Mon–Sun).
 * @param {Record<string, { isCompleted: boolean }>} progress - The daily progress record.
 * @returns {number} The number of completions this week.
 */
function calculateThisWeekCompletions(progress: Record<string, { isCompleted: boolean }> | undefined): number {
    if (!progress) return 0

    const today = startOfDay(new Date())
    const weekStart = startOfWeek(today, { weekStartsOn: 1 })
    const weekEnd = endOfWeek(today, { weekStartsOn: 1 })
    const days = eachDayOfInterval({ start: weekStart, end: weekEnd })

    return days.filter(day => {
        const key = format(day, "yyyy-MM-dd")
        return progress[key]?.isCompleted
    }).length
}

/**
 * Read-only analytics dashboard for daily task tracking.
 * Shows a calendar heatmap, streak analytics, and per-task statistics.
 * Users can view their past completion history but cannot edit anything.
 *
 * @param {DailyTrackingDashboardProps} props - Component properties.
 * @returns {JSX.Element} The rendered analytics dashboard.
 */
export function DailyTrackingDashboard({ dailyTodos }: DailyTrackingDashboardProps) {
    const [selectedTodoId, setSelectedTodoId] = useState<string | null>(dailyTodos[0]?.id || null)

    const today = startOfDay(new Date())
    const todayKey = format(today, "yyyy-MM-dd")

    const selectedTodo = dailyTodos.find(t => t.id === selectedTodoId)
    const selectedDailyProgress = selectedTodo?.dailyProgress

    /** Dates where the selected task was marked as completed */
    const completedDates = useMemo(() => {
        if (!selectedDailyProgress) return []
        return Object.entries(selectedDailyProgress)
            .filter(([, progress]) => progress.isCompleted)
            .map(([dateStr]) => new Date(dateStr + "T00:00:00"))
    }, [selectedDailyProgress])

    /** Aggregated analytics for the selected task */
    const analytics = useMemo(() => {
        const totalCompleted = completedDates.length
        const currentStreak = calculateCurrentStreak(selectedDailyProgress)
        const bestStreak = calculateBestStreak(selectedDailyProgress)
        const thisWeek = calculateThisWeekCompletions(selectedDailyProgress)
        const isTodayDone = selectedDailyProgress?.[todayKey]?.isCompleted ?? false

        return { totalCompleted, currentStreak, bestStreak, thisWeek, isTodayDone }
    }, [completedDates, selectedDailyProgress, todayKey])

    /** Global analytics across all daily tasks */
    const globalAnalytics = useMemo(() => {
        let totalCompletionsAcrossAll = 0
        dailyTodos.forEach(todo => {
            if (todo.dailyProgress) {
                totalCompletionsAcrossAll += Object.values(todo.dailyProgress).filter(p => p.isCompleted).length
            }
        })

        const todayCompletedCount = dailyTodos.filter(t => t.dailyProgress?.[todayKey]?.isCompleted).length

        return { totalCompletionsAcrossAll, todayCompletedCount, totalTasks: dailyTodos.length }
    }, [dailyTodos, todayKey])

    if (dailyTodos.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-96 border border-dashed border-border/40 bg-card/50 p-12 text-center">
                <CalendarDays className="h-16 w-16 text-muted-foreground mb-4 opacity-50" />
                <h2 className="text-2xl font-serif font-semibold tracking-tighter uppercase mb-2">No Daily Tasks</h2>
                <p className="text-muted-foreground max-w-md">Activate the &quot;Daily Task&quot; switch when creating a new task to see your analytics here.</p>
            </div>
        )
    }

    return (
        <TooltipProvider delayDuration={100}>
            <div className="space-y-8">
                {/* Global Summary Bar */}
                <div className="flex flex-wrap items-center gap-6 py-4 border-b border-border/30">
                    <div className="flex items-center gap-2">
                        <Eye className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Analytics</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">Today:</span>
                        <Badge variant="secondary" className="rounded-none font-semibold">
                            {globalAnalytics.todayCompletedCount} / {globalAnalytics.totalTasks}
                        </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">All time:</span>
                        <Badge variant="outline" className="rounded-none font-semibold">
                            {globalAnalytics.totalCompletionsAcrossAll} completions
                        </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">{format(today, "EEEE, MMM d")}</span>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row gap-8">
                    {/* Task Selector Sidebar */}
                    <div className="w-full md:w-64 shrink-0 space-y-4">
                        <h3 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground pb-2 border-b border-border/30">
                            Tasks
                        </h3>
                        <ScrollArea className="max-h-96">
                            <div className="space-y-1">
                                {dailyTodos.map(todo => {
                                    const todoTotalCompleted = todo.dailyProgress
                                        ? Object.values(todo.dailyProgress).filter(p => p.isCompleted).length
                                        : 0
                                    const todoTodayDone = todo.dailyProgress?.[todayKey]?.isCompleted ?? false
                                    const isSelected = selectedTodoId === todo.id

                                    return (
                                        <button
                                            key={todo.id}
                                            onClick={() => setSelectedTodoId(todo.id)}
                                            className={cn(
                                                "w-full text-left px-4 py-4 transition-all duration-300 border-l-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
                                                isSelected
                                                    ? "border-l-primary bg-primary/5"
                                                    : "border-l-transparent hover:border-l-border hover:bg-muted/20"
                                            )}
                                        >
                                            <div className="flex items-center justify-between gap-2">
                                                <span className={cn(
                                                    "text-base font-semibold truncate",
                                                    isSelected ? "text-foreground" : "text-muted-foreground"
                                                )}>
                                                    {todo.title}
                                                </span>
                                                {todoTodayDone ? (
                                                    <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                                                ) : (
                                                    <Circle className="h-4 w-4 text-muted-foreground/40 shrink-0" />
                                                )}
                                            </div>
                                            <div className="mt-1 text-sm text-muted-foreground">
                                                {todoTotalCompleted} day{todoTotalCompleted !== 1 ? 's' : ''} tracked
                                            </div>
                                        </button>
                                    )
                                })}
                            </div>
                        </ScrollArea>
                    </div>

                    {/* Main Analytics Panel */}
                    {selectedTodo ? (
                        <div className="flex-1 min-w-0 space-y-8">
                            {/* Task Title Header */}
                            <div className="space-y-1">
                                <h2 className="text-3xl font-serif font-semibold tracking-tighter">
                                    {selectedTodo.title}
                                </h2>
                                <div className="flex items-center gap-4">
                                    {analytics.isTodayDone ? (
                                        <span className="flex items-center gap-1 text-sm text-primary font-semibold">
                                            <CheckCircle2 className="h-4 w-4" />
                                            Done today
                                        </span>
                                    ) : (
                                        <span className="flex items-center gap-1 text-sm text-muted-foreground">
                                            <Circle className="h-4 w-4" />
                                            Not done today
                                        </span>
                                    )}
                                    {analytics.currentStreak > 0 && (
                                        <span className="flex items-center gap-1 text-sm text-primary font-semibold">
                                            <Flame className="h-4 w-4" />
                                            {analytics.currentStreak} day streak
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Stats Grid */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <StatCard
                                    icon={<BarChart2 className="h-4 w-4" />}
                                    label="Total Days"
                                    value={analytics.totalCompleted}
                                />
                                <StatCard
                                    icon={<Flame className="h-4 w-4" />}
                                    label="Current Streak"
                                    value={analytics.currentStreak}
                                    highlight={analytics.currentStreak > 0}
                                />
                                <StatCard
                                    icon={<Trophy className="h-4 w-4" />}
                                    label="Best Streak"
                                    value={analytics.bestStreak}
                                />
                                <StatCard
                                    icon={<TrendingUp className="h-4 w-4" />}
                                    label="This Week"
                                    value={`${analytics.thisWeek}/7`}
                                />
                            </div>

                            {/* Calendar View — Large & Prominent */}
                            <div className="space-y-4">
                                <h4 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground border-b border-border/30 pb-2">
                                    Completion Calendar
                                </h4>
                                <div className="bg-card border border-border p-8 shadow-md">
                                    <Calendar
                                        mode="multiple"
                                        selected={completedDates}
                                        className="rounded-none font-sans w-full [--cell-size:--spacing(14)]"
                                        disabled={() => true}
                                        modifiers={{
                                            completed: completedDates,
                                            today: [today],
                                        }}
                                        modifiersClassNames={{
                                            completed: "bg-primary/40 text-primary font-bold ring-1 ring-primary/30",
                                        }}
                                        classNames={{
                                            root: "w-full",
                                            caption_label: "select-none font-semibold text-2xl font-serif tracking-tighter text-foreground",
                                            weekday: "text-foreground/70 rounded-md flex-1 font-semibold text-sm select-none",
                                            day: "text-foreground",
                                            disabled: "text-foreground opacity-100 cursor-default",
                                        }}
                                    />
                                    {/* Legend */}
                                    <div className="flex items-center gap-8 mt-8 pt-6 border-t border-border/50 justify-center w-full">
                                        <div className="flex items-center gap-2">
                                            <div className="h-5 w-5 rounded-none bg-primary/40 border border-primary/50" />
                                            <span className="text-sm font-medium text-foreground/80">Completed</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="h-5 w-5 rounded-none bg-accent border border-border" />
                                            <span className="text-sm font-medium text-foreground/80">Today</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Heatmap — Last 12 Weeks */}
                            <div className="space-y-4">
                                <h4 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground border-b border-border/30 pb-2">
                                    Last 12 Weeks Activity
                                </h4>
                                <HeatmapGrid
                                    progress={selectedDailyProgress}
                                    weeks={12}
                                />
                            </div>

                            {/* Sub-tasks read-only view */}
                            {selectedTodo.subTasks && selectedTodo.subTasks.length > 0 && (
                                <div className="space-y-4">
                                    <h4 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground border-b border-border/30 pb-2">
                                        Daily Items
                                    </h4>
                                    <div className="space-y-1 bg-card border border-border/40 p-4 shadow-sm">
                                        {selectedTodo.subTasks.map(task => (
                                            <div key={task.id} className="flex items-center gap-4 py-2 px-2">
                                                <Circle className="h-4 w-4 text-muted-foreground/40 shrink-0" />
                                                <span className="text-base text-muted-foreground">
                                                    {task.title}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="flex-1 flex items-center justify-center p-8">
                            <p className="text-base font-serif tracking-tighter text-muted-foreground">Select a task from the sidebar</p>
                        </div>
                    )}
                </div>
            </div>
        </TooltipProvider>
    )
}

/* ─────────────────── Internal Sub-components ─────────────────── */

/**
 * Props for the StatCard sub-component.
 * @property {React.ReactNode} icon - The icon displayed next to the label.
 * @property {string} label - The metric label.
 * @property {string | number} value - The metric value.
 * @property {boolean} [highlight] - Whether to apply an accent highlight.
 */
interface StatCardProps {
    icon: React.ReactNode
    label: string
    value: string | number
    highlight?: boolean
}

/**
 * Read-only statistic card for displaying a single metric.
 * @param {StatCardProps} props - Component properties.
 * @returns {JSX.Element} The rendered stat card.
 */
function StatCard({ icon, label, value, highlight }: StatCardProps) {
    return (
        <div className={cn(
            "border p-4 space-y-2 transition-all duration-300",
            highlight
                ? "border-primary/30 bg-primary/5"
                : "border-border/40 bg-card/50"
        )}>
            <div className="flex items-center gap-2 text-muted-foreground">
                {icon}
                <span className="text-sm font-semibold uppercase tracking-wider">{label}</span>
            </div>
            <p className="text-3xl font-serif font-semibold tracking-tighter">{value}</p>
        </div>
    )
}

/**
 * Props for the HeatmapGrid sub-component.
 * @property {Record<string, { isCompleted: boolean }>} [progress] - Daily progress data.
 * @property {number} weeks - Number of weeks to display.
 */
interface HeatmapGridProps {
    progress: Record<string, { isCompleted: boolean }> | undefined
    weeks: number
}

/**
 * GitHub-style contribution heatmap showing daily completions over recent weeks.
 * Each cell represents a day and is color-coded based on completion status.
 * Entirely read-only.
 *
 * @param {HeatmapGridProps} props - Component properties.
 * @returns {JSX.Element} The rendered heatmap.
 */
function HeatmapGrid({ progress, weeks }: HeatmapGridProps) {
    const today = startOfDay(new Date())
    const startDate = subDays(today, weeks * 7 - 1)

    const days = useMemo(() => {
        return eachDayOfInterval({ start: startDate, end: today })
    }, [startDate, today])

    /** Organize days into weeks for the grid */
    const weekColumns = useMemo(() => {
        const columns: Date[][] = []
        let currentWeek: Date[] = []

        days.forEach((day, index) => {
            currentWeek.push(day)
            if ((index + 1) % 7 === 0 || index === days.length - 1) {
                columns.push(currentWeek)
                currentWeek = []
            }
        })

        return columns
    }, [days])

    const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

    return (
        <div className="bg-card border border-border p-8 shadow-md overflow-x-auto">
            <div className="flex gap-2 min-w-fit">
                {/* Day labels */}
                <div className="flex flex-col gap-2 mr-2 pt-8">
                    {dayLabels.map((label, i) => (
                        <div key={label} className={cn(
                            "h-7 w-7 flex items-center text-sm font-medium text-foreground/70",
                            i % 2 !== 0 && "opacity-0" // show only Mon, Wed, Fri, Sun
                        )}>
                            {label}
                        </div>
                    ))}
                </div>

                {/* Week columns */}
                {weekColumns.map((week, weekIndex) => (
                    <div key={weekIndex} className="flex flex-col gap-2">
                        {/* Month label for first day of month */}
                        <div className="h-8 flex items-end">
                            {week[0] && week[0].getDate() <= 7 && (
                                <span className="text-sm font-medium text-foreground/70">
                                    {format(week[0], "MMM")}
                                </span>
                            )}
                        </div>

                        {/* Day cells */}
                        {week.map(day => {
                            const key = format(day, "yyyy-MM-dd")
                            const isCompleted = progress?.[key]?.isCompleted ?? false
                            const isToday = isSameDay(day, today)

                            return (
                                <Tooltip key={key}>
                                    <TooltipTrigger asChild>
                                        <div
                                            className={cn(
                                                "h-7 w-7 rounded-sm transition-colors duration-200 cursor-default",
                                                isCompleted
                                                    ? "bg-primary/70"
                                                    : "bg-muted/60 border border-border/40",
                                                isToday && "ring-2 ring-primary ring-offset-1 ring-offset-background"
                                            )}
                                        />
                                    </TooltipTrigger>
                                    <TooltipContent side="top" className="rounded-none text-sm">
                                        <p className="font-semibold">{format(day, "MMM d, yyyy")}</p>
                                        <p className="text-muted-foreground">
                                            {isCompleted ? "✓ Completed" : "Not completed"}
                                        </p>
                                    </TooltipContent>
                                </Tooltip>
                            )
                        })}
                    </div>
                ))}
            </div>

            {/* Heatmap Legend */}
            <div className="flex items-center gap-2 mt-6 pt-4 border-t border-border/50">
                <span className="text-sm font-medium text-foreground/70 mr-1">Less</span>
                <div className="h-5 w-5 rounded-sm bg-muted/60 border border-border/40" />
                <div className="h-5 w-5 rounded-sm bg-primary/70" />
                <span className="text-sm font-medium text-foreground/70 ml-1">More</span>
            </div>
        </div>
    )
}
