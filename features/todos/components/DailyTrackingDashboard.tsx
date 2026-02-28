"use client"

import React, { useState, useEffect } from 'react'
import { Calendar } from '@/components/ui/calendar'
import { Checkbox } from '@/components/ui/checkbox'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Todo, DailyProgress } from '../types/todo.types'
import { cn } from '@/lib/utils'
import { CalendarDays, CheckCircle2, Circle } from 'lucide-react'

interface DailyTrackingDashboardProps {
    dailyTodos: Todo[]
    onSaveProgress: (todoId: string, dateKey: string, progress: DailyProgress) => void
}

export function DailyTrackingDashboard({ dailyTodos, onSaveProgress }: DailyTrackingDashboardProps) {
    const [selectedTodoId, setSelectedTodoId] = useState<string | null>(dailyTodos[0]?.id || null)
    const [date, setDate] = useState<Date | undefined>(new Date())

    // Tracking States
    const [isCompleted, setIsCompleted] = useState(false)
    const [completedSubTasks, setCompletedSubTasks] = useState<string[]>([])
    const [notes, setNotes] = useState("")

    useEffect(() => {
        if (!selectedTodoId && dailyTodos.length > 0) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setSelectedTodoId(dailyTodos[0].id)
        }
    }, [dailyTodos, selectedTodoId])

    const selectedTodo = dailyTodos.find(t => t.id === selectedTodoId)
    const dateKey = date ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}` : ''

    // Load progress when date or selected todo changes
    useEffect(() => {
        if (selectedTodo && dateKey) {
            const progress = selectedTodo.dailyProgress?.[dateKey]
            if (progress) {
                // eslint-disable-next-line react-hooks/set-state-in-effect
                setIsCompleted(progress.isCompleted)
                // eslint-disable-next-line react-hooks/set-state-in-effect
                setCompletedSubTasks(progress.completedSubTasks)
                // eslint-disable-next-line react-hooks/set-state-in-effect
                setNotes(progress.notes)
            } else {
                // eslint-disable-next-line react-hooks/set-state-in-effect
                setIsCompleted(false)
                // eslint-disable-next-line react-hooks/set-state-in-effect
                setCompletedSubTasks([])
                // eslint-disable-next-line react-hooks/set-state-in-effect
                setNotes("")
            }
        }
    }, [selectedTodo, dateKey])

    const handleSubTaskToggle = (subTaskId: string) => {
        setCompletedSubTasks(prev =>
            prev.includes(subTaskId)
                ? prev.filter(id => id !== subTaskId)
                : [...prev, subTaskId]
        )
    }

    const handleSave = () => {
        if (!selectedTodo || !dateKey) return
        onSaveProgress(selectedTodo.id, dateKey, { isCompleted, completedSubTasks, notes })
    }

    if (dailyTodos.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-96 border-4 border-dashed border-border bg-background p-12 text-center">
                <CalendarDays className="h-16 w-16 text-muted-foreground mb-4 opacity-50" />
                <h2 className="text-2xl font-serif font-semibold tracking-tighter uppercase mb-2">No Daily Tasks</h2>
                <p className="text-muted-foreground max-w-md">Activate the &quot;Daily Task&quot; switch when creating a new task to see it here.</p>
            </div>
        )
    }

    return (
        <div className="flex flex-col md:flex-row h-[700px] border-4 border-foreground bg-background shadow-2xl overflow-hidden rounded-none">
            {/* Sidebar List */}
            <div className="w-full md:w-1/3 border-b-4 md:border-b-0 md:border-r-4 border-foreground bg-muted/10 flex flex-col">
                <div className="p-6 border-b-4 border-foreground bg-primary/5">
                    <h2 className="text-2xl font-serif font-semibold tracking-tighter uppercase">Daily Tasks</h2>
                    <p className="text-sm text-muted-foreground mt-1">Select a task to track progress</p>
                </div>
                <ScrollArea className="flex-1 p-4">
                    <div className="space-y-2">
                        {dailyTodos.map(todo => (
                            <button
                                key={todo.id}
                                onClick={() => setSelectedTodoId(todo.id)}
                                className={cn(
                                    "w-full text-left p-4 transition-all duration-200 border-2 rounded-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
                                    selectedTodoId === todo.id
                                        ? "border-primary bg-primary/10 shadow-sm"
                                        : "border-transparent hover:border-primary/30 hover:bg-primary/5"
                                )}
                            >
                                <div className="font-semibold text-lg truncate flex items-center justify-between">
                                    {todo.title}
                                    {todo.isCompleted && <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />}
                                </div>
                                <div className="text-sm text-muted-foreground mt-1 flex items-center gap-2">
                                    <span className="bg-primary/20 text-primary px-2 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider">
                                        {todo.subTasks?.length || 0} items
                                    </span>
                                </div>
                            </button>
                        ))}
                    </div>
                </ScrollArea>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 bg-background relative">
                {selectedTodo ? (
                    <>
                        <div className="p-6 md:p-8 border-b-2 border-border flex items-center justify-between sticky top-0 bg-background/95 backdrop-blur z-10">
                            <div>
                                <h3 className="text-3xl font-serif font-semibold tracking-tighter uppercase break-words">{selectedTodo.title}</h3>
                                {date && <p className="text-muted-foreground mt-1 text-sm font-medium tracking-wide uppercase">{date.toDateString()}</p>}
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 md:p-8">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12">
                                {/* Left Side: Calendar & Status */}
                                <div className="space-y-8">
                                    <div className="bg-card border-2 border-border p-4 shadow-sm inline-block rounded-none">
                                        <Calendar
                                            mode="single"
                                            selected={date}
                                            onSelect={setDate}
                                            className="rounded-none font-sans"
                                        />
                                    </div>

                                    <div className="bg-muted/10 border-2 border-border p-6 rounded-none space-y-4">
                                        <div className="flex items-center space-x-3">
                                            <Checkbox
                                                id="day-complete"
                                                checked={isCompleted}
                                                onCheckedChange={(checked) => setIsCompleted(checked as boolean)}
                                                className="h-6 w-6 border-2 border-primary data-[state=checked]:bg-primary rounded-none"
                                            />
                                            <label
                                                htmlFor="day-complete"
                                                className="text-lg font-semibold uppercase tracking-wider cursor-pointer leading-none"
                                            >
                                                Mark Day Complete
                                            </label>
                                        </div>
                                        <p className="text-sm text-muted-foreground pl-9">
                                            Check this when you&apos;ve successfully completed the habit for the selected date.
                                        </p>
                                    </div>
                                </div>

                                {/* Right Side: Subtasks & Notes */}
                                <div className="space-y-8 flex flex-col h-full">
                                    {selectedTodo.subTasks && selectedTodo.subTasks.length > 0 && (
                                        <div className="space-y-4">
                                            <h4 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground border-b-2 border-border pb-2">Daily Items</h4>
                                            <div className="space-y-3 bg-card border-2 border-border p-4 shadow-sm rounded-none">
                                                {selectedTodo.subTasks.map(task => (
                                                    <div key={task.id} className="flex items-start space-x-3 p-2 hover:bg-muted/50 transition-colors">
                                                        <Checkbox
                                                            id={task.id}
                                                            checked={completedSubTasks.includes(task.id)}
                                                            onCheckedChange={() => handleSubTaskToggle(task.id)}
                                                            className="mt-1 h-5 w-5 border-2 rounded-none"
                                                        />
                                                        <label htmlFor={task.id} className="text-base font-medium leading-tight cursor-pointer flex-1">
                                                            {task.title}
                                                        </label>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    <div className="space-y-4 flex-1 flex flex-col min-h-[200px]">
                                        <h4 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground border-b-2 border-border pb-2">Daily Journal</h4>
                                        <Textarea
                                            placeholder="How did you do today? Any blockers or wins?"
                                            value={notes}
                                            onChange={(e) => setNotes(e.target.value)}
                                            className="flex-1 min-h-[150px] resize-none border-2 border-border bg-card p-4 text-base focus-visible:ring-1 focus-visible:ring-primary focus:border-foreground rounded-none shadow-sm"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Sticky Footer */}
                        <div className="p-6 border-t-2 border-border bg-muted/10 sticky bottom-0 z-10">
                            <div className="flex justify-end max-w-7xl mx-auto">
                                <Button
                                    onClick={handleSave}
                                    className="h-12 px-8 text-sm font-semibold uppercase tracking-widest rounded-none shadow-lg hover:shadow-xl transition-all"
                                    size="lg"
                                >
                                    Save Progress
                                </Button>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="h-full flex items-center justify-center p-8 opacity-50">
                        <p className="text-xl font-serif tracking-tighter uppercase">Select a task from the sidebar</p>
                    </div>
                )}
            </div>
        </div>
    )
}
