/*
 * File Name:     EisenhowerMatrix.view.tsx
 * Description:   Main orchestrator for the 4 quadrants of the Eisenhower Matrix.
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

type TabView = 'view' | 'create' | 'track'

/**
 * Main dashboard view for the Eisenhower Matrix.
 * Orchestrates task loading, drag-and-drop state, and quadrant rendering.
 * Implements View Isolation by acting as the primary entry point for the App Router.
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
        <div ref={containerRef} className="min-h-screen bg-background text-foreground selection:bg-primary selection:text-primary-foreground p-6 md:p-8 pt-20 md:pt-24">
            {/* Floating Mode Toggle */}
            <div className="fixed top-6 right-6 z-50">
                <ModeToggle />
            </div>

            {/* Sticky Navigation - Tab Switchers */}
            <nav className="anim-matrix-header fixed top-6 left-1/2 -translate-x-1/2 z-40 flex items-center gap-1 p-1 rounded-full bg-background/70 backdrop-blur-xl border border-border/60 shadow-lg transition-all">
                <button
                    onClick={() => setActiveTab('view')}
                    className={cn(
                        "px-4 py-1.5 rounded-full text-sm font-semibold tracking-tight transition-all duration-300 whitespace-nowrap",
                        activeTab === 'view' ? "bg-foreground text-background shadow-sm" : "text-muted-foreground hover:text-foreground"
                    )}
                >
                    Tasks
                </button>
                <button
                    onClick={() => setActiveTab('create')}
                    className={cn(
                        "px-4 py-1.5 rounded-full text-sm font-semibold tracking-tight transition-all duration-300 whitespace-nowrap",
                        activeTab === 'create' ? "bg-foreground text-background shadow-sm" : "text-muted-foreground hover:text-foreground"
                    )}
                >
                    New
                </button>
                <button
                    onClick={() => setActiveTab('track')}
                    className={cn(
                        "px-4 py-1.5 rounded-full text-sm font-semibold tracking-tight transition-all duration-300 whitespace-nowrap flex items-center gap-2",
                        activeTab === 'track' ? "bg-foreground text-background shadow-sm" : "text-muted-foreground hover:text-foreground"
                    )}
                >
                    <span className="relative flex h-1.5 w-1.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-60"></span>
                        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-primary"></span>
                    </span>
                    Track
                </button>
            </nav>

            <div className="max-w-6xl mx-auto space-y-8 relative z-10">

                <div>
                    {activeTab === 'view' && (
                        <DragDropContext onDragEnd={handleDragEnd}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="anim-matrix-quadrant overflow-hidden">
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
                                <div className="anim-matrix-quadrant overflow-hidden">
                                    <TodoQuadrant
                                        title="Important, Not Urgent"
                                        type="unurgent-important"
                                        todos={getTodosByPriority('unurgent-important')}
                                        onToggle={toggleTodo}
                                        onDelete={deleteTodo}
                                        onEdit={updateTodo}
                                        onTrackDaily={setTrackingTodo}
                                        onSaveDailyProgress={handleSaveDashboardProgress}
                                    />
                                </div>
                                <div className="anim-matrix-quadrant overflow-hidden">
                                    <TodoQuadrant
                                        title="Urgent, Not Important"
                                        type="urgent-unimportant"
                                        todos={getTodosByPriority('urgent-unimportant')}
                                        onToggle={toggleTodo}
                                        onDelete={deleteTodo}
                                        onEdit={updateTodo}
                                        onTrackDaily={setTrackingTodo}
                                        onSaveDailyProgress={handleSaveDashboardProgress}
                                    />
                                </div>
                                <div className="anim-matrix-quadrant overflow-hidden">
                                    <TodoQuadrant
                                        title="Not Urgent, Not Important"
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
                        <div className="max-w-2xl mx-auto py-8 anim-matrix-quadrant">
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
                </div>

                {trackingTodo && (
                    <DailyTrackerModal
                        isOpen={!!trackingTodo}
                        onClose={() => setTrackingTodo(null)}
                        todo={trackingTodo}
                        onSave={handleSaveDailyProgress}
                    />
                )}
            </div>
        </div>
    )
}
