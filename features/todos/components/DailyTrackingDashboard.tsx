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
    startOfYear,
    endOfYear,
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

    const today = useMemo(() => startOfDay(new Date()), [])
    const todayKey = useMemo(() => format(today, "yyyy-MM-dd"), [today])

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
                <h2 className="text-xl font-sans font-semibold tracking-tight mb-2">No Daily Tasks</h2>
                <p className="text-muted-foreground max-w-md">Activate the &quot;Daily Task&quot; switch when creating a new task to see your analytics here.</p>
            </div>
        )
    }

    return (
        <div className="space-y-8">
            {/* Global Summary Bar */}
            <div className="flex flex-wrap items-center gap-6 py-4 border-b border-border/30">
                <div className="flex items-center gap-2">
                    <Eye className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium tracking-tight text-muted-foreground">Analytics</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Today:</span>
                    <Badge variant="secondary" className="rounded-full font-medium">
                        {globalAnalytics.todayCompletedCount} / {globalAnalytics.totalTasks}
                    </Badge>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">All time:</span>
                    <Badge variant="outline" className="rounded-full font-medium">
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
                    <h3 className="text-sm font-medium tracking-tight text-muted-foreground pb-2 border-b border-border/30">
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
                            <h2 className="text-2xl font-sans font-bold tracking-tight">
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
                            <h4 className="text-sm font-medium tracking-tight text-muted-foreground border-b border-border/30 pb-2">
                                Completion Calendar
                            </h4>
                            <div className="bg-card border border-border/50 p-6 rounded-xl shadow-sm">
                                <Calendar
                                    mode="multiple"
                                    selected={completedDates}
                                    weekStartsOn={0}
                                    className="rounded-xl font-sans w-full [--cell-size:--spacing(14)]"
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
                                        caption_label: "select-none font-bold text-xl font-sans tracking-tight text-foreground",
                                        weekday: "text-foreground/70 rounded-md flex-1 font-semibold text-sm select-none flex items-center justify-center min-w-(--cell-size)",
                                        day: "relative w-full h-full p-0 text-center aspect-square select-none text-foreground",
                                        disabled: "opacity-100 cursor-default",
                                    }}
                                />
                                {/* Legend */}
                                <div className="flex items-center gap-8 mt-8 pt-6 border-t border-border/50 justify-center w-full">
                                    <div className="flex items-center gap-2">
                                        <div className="h-5 w-5 rounded-md bg-primary/40 border border-primary/50" />
                                        <span className="text-sm font-medium text-foreground/80">Completed</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="h-5 w-5 rounded-md bg-accent border border-border" />
                                        <span className="text-sm font-medium text-foreground/80">Today</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Heatmap — Annual Activity (Compact GitHub Style) */}
                        <div className="space-y-4 pt-2">
                            <HeatmapGrid todo={selectedTodo} />
                        </div>

                        {/* Sub-tasks read-only view */}
                        {selectedTodo.subTasks && selectedTodo.subTasks.length > 0 && (
                            <div className="space-y-4">
                                <h4 className="text-sm font-medium tracking-tight text-muted-foreground border-b border-border/30 pb-2">
                                    Daily Items
                                </h4>
                                <div className="space-y-1 bg-card border border-border/50 p-4 rounded-xl shadow-sm">
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
                        <p className="text-sm font-medium font-sans text-muted-foreground">Select a task from the sidebar</p>
                    </div>
                )}
            </div>
        </div>
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
                <span className="text-sm font-medium tracking-tight">{label}</span>
            </div>
            <p className="text-3xl font-sans font-bold tracking-tight">{value}</p>
        </div>
    )
}

/**
 * Props for the HeatmapGrid sub-component.
 * @property {Todo} [todo] - The task data for intensity calculation.
 */
interface HeatmapGridProps {
    todo?: Todo
}

/**
 * GitHub-style contribution heatmap showing daily completions over recent weeks.
 * Each cell represents a day and is color-coded based on completion status.
 * Entirely read-only.
 *
 * @param {HeatmapGridProps} props - Component properties.
 * @returns {JSX.Element} The rendered heatmap.
 */
function HeatmapGrid({ todo }: HeatmapGridProps) {
    const today = useMemo(() => startOfDay(new Date()), [])
    const currentYear = today.getFullYear()

    /** 
     * Display the current calendar year (Jan 1 to Dec 31).
     * We align to weeks starting on Monday.
     */
    const startDate = useMemo(() => startOfWeek(startOfYear(today), { weekStartsOn: 1 }), [today])
    const endDate = useMemo(() => endOfWeek(endOfYear(today), { weekStartsOn: 1 }), [today])

    const days = useMemo(() => {
        return eachDayOfInterval({ start: startDate, end: endDate })
    }, [startDate, endDate])

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
        <div className="bg-card border border-border/50 p-6 rounded-xl shadow-sm group/heatmap">
            <div className="mb-3 flex items-center justify-between">
                <h4 className="text-sm font-sans font-semibold tracking-tight text-foreground">
                    {currentYear} Activity (Year to Date)
                </h4>
            </div>
            <div className="overflow-x-auto">
                <div className="flex gap-1 min-w-fit">
                    {/* Day labels */}
                    <div className="flex flex-col gap-1 mr-2">
                        <div className="h-6" /> {/* Perfect hollow placeholder for month header row */}
                        {dayLabels.map((label, i) => (
                            <div key={label} className={cn(
                                "h-3 w-8 flex items-center text-xs font-medium font-sans text-muted-foreground/70",
                                i % 2 !== 0 && "invisible" // show only Mon, Wed, Fri, Sun
                            )}>
                                {label}
                            </div>
                        ))}
                    </div>

                    {/* Week columns */}
                    {weekColumns.map((week, weekIndex) => (
                        <div key={weekIndex} className="flex flex-col gap-1 w-3">
                            {/* Month label for first day of month */}
                            <div className="h-6 relative w-full">
                                {week[0] && week[0].getDate() <= 7 && (
                                    <span className="absolute bottom-1 left-0 text-xs font-medium text-foreground/70 whitespace-nowrap z-10">
                                        {format(week[0], "MMM")}
                                    </span>
                                )}
                            </div>

                            {/* Day cells */}
                            <div className="flex flex-col gap-1">
                                {week.map(day => {
                                    const key = format(day, "yyyy-MM-dd")
                                    const dayProgress = todo?.dailyProgress?.[key]
                                    const isToday = isSameDay(day, today)
                                    const isFuture = day > today

                                    /**
                                     * Calculate intensity based on sub-task completion ratio
                                     * or just 1.0 if no sub-tasks but marked completed.
                                     */
                                    let intensity = 0
                                    if (dayProgress?.isCompleted) {
                                        intensity = 1
                                    } else if (dayProgress?.completedSubTasks && todo?.subTasks && todo.subTasks.length > 0) {
                                        intensity = dayProgress.completedSubTasks.length / todo.subTasks.length
                                    }

                                    return (
                                        <div
                                            key={key}
                                            title={`${format(day, "MMM d, y")} - ${intensity > 0 ? `${Math.round(intensity * 100)}%` : "None"}`}
                                            style={{
                                                backgroundColor:
                                                    isFuture
                                                        ? 'var(--heatmap-future)'
                                                        : intensity === 0
                                                            ? 'var(--heatmap-empty)'
                                                            : undefined,
                                            }}
                                            className={cn(
                                                "h-3 w-3 rounded-sm transition-all duration-300 cursor-default",
                                                !isFuture && intensity > 0 && (
                                                    intensity <= 0.25
                                                        ? "bg-primary/30"
                                                        : intensity <= 0.5
                                                            ? "bg-primary/55"
                                                            : intensity <= 0.75
                                                                ? "bg-primary/80"
                                                                : "bg-primary"
                                                ),
                                                isToday && "ring-2 ring-primary ring-offset-1 ring-offset-background z-10"
                                            )}
                                        />
                                    )
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Heatmap Footer Legend */}
            <div className="flex items-center justify-end mt-2">
                <div className="flex items-center gap-1 select-none">
                    <span className="text-sm font-sans text-muted-foreground mr-1">Less</span>
                    <div className="h-3 w-3 rounded-sm bg-muted border border-border/20" />
                    <div className="h-3 w-3 rounded-sm bg-primary/30" />
                    <div className="h-3 w-3 rounded-sm bg-primary/55" />
                    <div className="h-3 w-3 rounded-sm bg-primary/80" />
                    <div className="h-3 w-3 rounded-sm bg-primary" />
                    <span className="text-sm font-sans text-muted-foreground ml-1">More</span>
                </div>
            </div>
        </div>
    )
}

