/*
 * File Name:     EisenhowerMatrix.view.tsx
 * Description:   Main orchestrator for the Eisenhower Matrix with a premium editorial dashboard.
 * Author:        Antigravity
 * Created Date:  2026-02-28
 */

"use client"

import React, { useRef, useState } from 'react'
import { DragDropContext, DropResult } from '@hello-pangea/dnd'
import { ModeToggle } from '@/components/mode-toggle'
import { cn } from '@/lib/utils'
import { TodoPriority } from '../types/todo.types'
import { useTodos } from '../hooks/useTodos'
import { useMatrixAnimations } from '../hooks/useTodoAnimations'
import { TodoQuadrant } from '../components/TodoQuadrant'
import { TodoForm } from '../components/TodoForm'
import { DailyTrackerModal } from '../components/DailyTrackerModal'
import { DailyTrackingDashboard } from '../components/DailyTrackingDashboard'
import { Todo, DailyProgress } from '../types/todo.types'
import { TodoFormValues } from '../schemas/todo.schema'
import { Sparkles, LayoutGrid, PlusCircle, Activity } from 'lucide-react'

type TabView = 'view' | 'create' | 'track'

/**
 * Main dashboard view for the Eisenhower Matrix.
 * Orchestrates task loading, drag-and-drop state, and quadrant rendering.
 * Redesigned for a high-end, editorial experience.
 * 
 * @returns {JSX.Element} The rendered matrix page.
 */
export const EisenhowerMatrix = () => {
    const { todos, isLoaded, addTodo, toggleTodo, deleteTodo, getTodosByPriority, reorderTodo, updateTodo } = useTodos()
    const containerRef = useRef<HTMLDivElement>(null)
    const [trackingTodo, setTrackingTodo] = useState<Todo | null>(null)
    const [activeTab, setActiveTab] = useState<TabView>('view')

    // Isolated Animation Logic
    useMatrixAnimations(containerRef)

    if (!isLoaded) return null

    /**
     * Handles the end of a drag-and-drop action and synchronizes state.
     * 
     * @param {DropResult} result - The DnD result object provided by @hello-pangea/dnd.
     */
    const handleDragEnd = (result: DropResult) => {
        const { destination, source, draggableId } = result

        if (!destination) return

        if (
            destination.droppableId === source.droppableId &&
            destination.index === source.index
        ) {
            return
        }

        reorderTodo(
            draggableId,
            source.droppableId as TodoPriority,
            destination.droppableId as TodoPriority,
            source.index,
            destination.index
        )
    }

    const handleSaveDailyProgress = (todoId: string, dateKey: string, progress: DailyProgress) => {
        if (!trackingTodo) return

        const updatedDailyProgress = {
            ...(trackingTodo.dailyProgress || {}),
            [dateKey]: progress
        }

        const updatedTodo = { ...trackingTodo, dailyProgress: updatedDailyProgress }
        updateTodo(trackingTodo.id, { dailyProgress: updatedDailyProgress })
        setTrackingTodo(updatedTodo)
    }

    const handleSaveDashboardProgress = (todoId: string, dateKey: string, progress: DailyProgress) => {
        const targetTodo = todos.find(t => t.id === todoId)
        if (!targetTodo) return

        const updatedDailyProgress = {
            ...(targetTodo.dailyProgress || {}),
            [dateKey]: progress
        }

        updateTodo(todoId, { dailyProgress: updatedDailyProgress })
    }

    const handleFormSubmit = (data: TodoFormValues) => {
        addTodo(data)
        setActiveTab('view') // Return to view after creation
    }

    return (
        <div ref={containerRef} className="min-h-screen bg-background text-foreground selection:bg-primary selection:text-primary-foreground p-4 sm:p-8 md:p-12 pt-28 sm:pt-32 md:pt-40 relative">
            {/* Background Texture Overlay */}
            <div className="fixed inset-0 pointer-events-none z-0 bg-background/50" />

            {/* Floating Utility Controls */}
            <div className="fixed top-8 right-8 z-50">
                <ModeToggle />
            </div>

            {/* Navigation Header - Premium Control Center */}
            <header className="fixed top-8 left-1/2 -translate-x-1/2 z-40 w-max max-w-[90vw] animate-in slide-in-from-top-4 duration-700">
                <nav className="flex items-center p-1.5 bg-background/80 backdrop-blur-xl border border-border/50 shadow-sm rounded-full transition-all duration-500">
                    <button
                        onClick={() => setActiveTab('view')}
                        className={cn(
                            "group flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-6 py-2.5 text-[11px] sm:text-[13px] font-medium font-sans tracking-tight transition-all duration-300 rounded-full",
                            activeTab === 'view' ? "bg-foreground text-background shadow-md" : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                        )}
                    >
                        <LayoutGrid className={cn("h-3.5 w-3.5 sm:h-4 sm:w-4 transition-transform group-hover:scale-110", activeTab === 'view' ? "text-primary/80" : "text-muted-foreground")} />
                        <span className="hidden sm:inline">View Tasks</span>
                        <span className="sm:hidden">Tasks</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('create')}
                        className={cn(
                            "group flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-6 py-2.5 text-[11px] sm:text-[13px] font-medium font-sans tracking-tight transition-all duration-300 rounded-full",
                            activeTab === 'create' ? "bg-foreground text-background shadow-md" : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                        )}
                    >
                        <PlusCircle className={cn("h-3.5 w-3.5 sm:h-4 sm:w-4 transition-transform group-hover:rotate-90", activeTab === 'create' ? "text-primary/80" : "text-muted-foreground")} />
                        <span className="hidden sm:inline">Create Task</span>
                        <span className="sm:hidden">Create</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('track')}
                        className={cn(
                            "group flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-6 py-2.5 text-[11px] sm:text-[13px] font-medium font-sans tracking-tight transition-all duration-300 relative rounded-full",
                            activeTab === 'track' ? "bg-foreground text-background shadow-md" : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                        )}
                    >
                        <Activity className={cn("h-3.5 w-3.5 sm:h-4 sm:w-4 transition-transform group-hover:scale-110", activeTab === 'track' ? "text-primary/80 animate-pulse" : "text-muted-foreground")} />
                        <span className="hidden sm:inline">Track Progress</span>
                        <span className="sm:hidden">Track</span>
                        {activeTab !== 'track' && todos.some(t => t.isDaily) && (
                            <span className="absolute top-2 right-4 flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-60"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                            </span>
                        )}
                    </button>
                </nav>
            </header>

            <main className="max-w-6xl mx-auto space-y-12 relative z-10">
                {/* Visual Branding Section - Only visible in View mode to keep focus */}
                {activeTab === 'view' && (
                    <div className="space-y-3 opacity-90 animate-in fade-in slide-in-from-bottom-4 duration-1000">
                        <div className="flex items-center gap-2 text-primary">
                            <Sparkles className="h-4 w-4" />
                            <span className="text-sm font-medium font-sans tracking-tight">Command Center</span>
                        </div>
                        <h1 className="text-3xl sm:text-4xl md:text-5xl font-sans font-bold tracking-tighter text-foreground">
                            Yasir&apos;s <span className="text-muted-foreground">Todo</span>
                        </h1>
                    </div>
                )}

                <section className="relative min-h-96">
                    {activeTab === 'view' && (
                        <DragDropContext onDragEnd={handleDragEnd}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                <div className="anim-matrix-quadrant relative">
                                    <TodoQuadrant
                                        title="Urgent & Important"
                                        type="urgent-important"
                                        todos={getTodosByPriority('urgent-important')}
                                        onToggle={toggleTodo}
                                        onDelete={deleteTodo}
                                        onEdit={updateTodo}
                                        onTrackDaily={setTrackingTodo}
                                        onSaveDailyProgress={handleSaveDashboardProgress}
                                    />
                                </div>
                                <div className="anim-matrix-quadrant relative">
                                    <TodoQuadrant
                                        title="Un-Urgent & Important"
                                        type="unurgent-important"
                                        todos={getTodosByPriority('unurgent-important')}
                                        onToggle={toggleTodo}
                                        onDelete={deleteTodo}
                                        onEdit={updateTodo}
                                        onTrackDaily={setTrackingTodo}
                                        onSaveDailyProgress={handleSaveDashboardProgress}
                                    />
                                </div>
                                <div className="anim-matrix-quadrant relative">
                                    <TodoQuadrant
                                        title="Urgent & Un-Important"
                                        type="urgent-unimportant"
                                        todos={getTodosByPriority('urgent-unimportant')}
                                        onToggle={toggleTodo}
                                        onDelete={deleteTodo}
                                        onEdit={updateTodo}
                                        onTrackDaily={setTrackingTodo}
                                        onSaveDailyProgress={handleSaveDashboardProgress}
                                    />
                                </div>
                                <div className="anim-matrix-quadrant relative">
                                    <TodoQuadrant
                                        title="Un-Urgent & Un-Important"
                                        type="unurgent-unimportant"
                                        todos={getTodosByPriority('unurgent-unimportant')}
                                        onToggle={toggleTodo}
                                        onDelete={deleteTodo}
                                        onEdit={updateTodo}
                                        onTrackDaily={setTrackingTodo}
                                        onSaveDailyProgress={handleSaveDashboardProgress}
                                    />
                                </div>
                            </div>
                        </DragDropContext>
                    )}

                    {activeTab === 'create' && (
                        <div className="max-w-4xl mx-auto py-12 anim-matrix-quadrant">
                            <TodoForm onSubmit={handleFormSubmit} />
                        </div>
                    )}

                    {activeTab === 'track' && (
                        <div className="anim-matrix-quadrant">
                            <DailyTrackingDashboard
                                dailyTodos={todos.filter(t => t.isDaily)}
                            />
                        </div>
                    )}
                </section>

                {trackingTodo && (
                    <DailyTrackerModal
                        isOpen={!!trackingTodo}
                        onClose={() => setTrackingTodo(null)}
                        todo={trackingTodo}
                        onSave={handleSaveDailyProgress}
                    />
                )}
            </main>
        </div>
    )
}
