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

        updateTodo(trackingTodo.id, { dailyProgress: updatedDailyProgress })
        setTrackingTodo(null) // Close modal after save
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
        <div ref={containerRef} className="min-h-screen bg-background text-foreground selection:bg-primary selection:text-primary-foreground p-8 md:p-12 pt-24 md:pt-32">
            {/* Sticky Navigation - Tab Switchers */}
            <nav className="fixed top-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 p-1 rounded-full bg-background/60 backdrop-blur-xl border-2 border-primary/20 shadow-2xl transition-all hover:border-primary/40 w-11/12 max-w-fit overflow-x-auto hide-scrollbar">
                <button
                    onClick={() => setActiveTab('view')}
                    className={cn(
                        "px-6 py-2 rounded-full text-sm font-semibold uppercase tracking-tighter transition-all whitespace-nowrap",
                        activeTab === 'view' ? "bg-primary text-primary-foreground" : "hover:bg-primary/20"
                    )}
                >
                    View Tasks
                </button>
                <div className="w-px h-4 bg-primary/20 shrink-0" />
                <button
                    onClick={() => setActiveTab('create')}
                    className={cn(
                        "px-6 py-2 rounded-full text-sm font-semibold uppercase tracking-tighter transition-all whitespace-nowrap",
                        activeTab === 'create' ? "bg-primary text-primary-foreground" : "hover:bg-primary/20"
                    )}
                >
                    Create Task
                </button>
                <div className="w-px h-4 bg-primary/20 shrink-0" />
                <button
                    onClick={() => setActiveTab('track')}
                    className={cn(
                        "px-6 py-2 rounded-full text-sm font-semibold uppercase tracking-tighter transition-all whitespace-nowrap flex items-center gap-2",
                        activeTab === 'track' ? "bg-primary text-primary-foreground" : "hover:bg-primary/20"
                    )}
                >
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-current opacity-50"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-current"></span>
                    </span>
                    Track Tasks
                </button>
            </nav>

            <div className="fixed inset-0 pointer-events-none opacity-[0.05] bg-grid-slate-900/[0.04] bg-[bottom_1px_center] [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />

            <div className="max-w-7xl mx-auto space-y-12 relative z-10">
                <header className="anim-matrix-header flex flex-col md:flex-row items-center justify-between gap-6 border-b-4 border-foreground pb-8 mb-8">
                    <h1 className="text-5xl md:text-7xl font-semibold tracking-tighter leading-none font-serif uppercase break-words">
                        Simple <br /> Todo
                    </h1>
                    <div className="flex items-start self-start md:self-auto">
                        <ModeToggle />
                    </div>
                </header>

                <div>
                    {activeTab === 'view' && (
                        <DragDropContext onDragEnd={handleDragEnd}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 scroll-mt-24 md:scroll-mt-32">
                                <div className="anim-matrix-quadrant overflow-hidden">
                                    <TodoQuadrant
                                        title="Urgent & Important"
                                        type="urgent-important"
                                        todos={getTodosByPriority('urgent-important')}
                                        onToggle={toggleTodo}
                                        onDelete={deleteTodo}
                                        onEdit={updateTodo}
                                        onTrackDaily={setTrackingTodo}
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
                                    />
                                </div>
                            </div>
                        </DragDropContext>
                    )}

                    {activeTab === 'create' && (
                        <div className="max-w-2xl mx-auto py-12 anim-matrix-quadrant">
                            <TodoForm onSubmit={handleFormSubmit} />
                        </div>
                    )}

                    {activeTab === 'track' && (
                        <div className="anim-matrix-quadrant">
                            <DailyTrackingDashboard
                                dailyTodos={todos.filter(t => t.isDaily)}
                                onSaveProgress={handleSaveDashboardProgress}
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
