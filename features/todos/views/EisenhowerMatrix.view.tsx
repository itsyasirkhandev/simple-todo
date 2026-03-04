/*
 * File Name:     EisenhowerMatrix.view.tsx
 * Description:   Industrial-editorial hero redesign. Dramatic header, grid
 *                texture background, animated tab transitions, lg-breakpoint
 *                visual priority for urgent-important quadrant.
 */

"use client"

import React, { useRef, useState } from 'react'
import { DragDropContext, DropResult } from '@hello-pangea/dnd'
import { useRouter, useSearchParams } from 'next/navigation'
import { ROUTES } from '@/constants/routes'
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

export const EisenhowerMatrix = () => {
    const { todos, isLoaded, addTodo, toggleTodo, deleteTodo, getTodosByPriority, reorderTodo, updateTodo } = useTodos()
    const searchParams = useSearchParams()
    const router = useRouter()
    const containerRef = useRef<HTMLDivElement>(null)
    const [trackingTodo, setTrackingTodo] = useState<Todo | null>(null)

    const activeTab = (searchParams.get('tab') as TabView) || 'view'

    useMatrixAnimations(containerRef)

    if (!isLoaded) return null

    const handleDragEnd = (result: DropResult) => {
        const { destination, source, draggableId } = result
        if (!destination) return
        if (destination.droppableId === source.droppableId && destination.index === source.index) return
        reorderTodo(draggableId, source.droppableId as TodoPriority, destination.droppableId as TodoPriority, source.index, destination.index)
    }

    const handleSaveDailyProgress = (todoId: string, dateKey: string, progress: DailyProgress) => {
        if (!trackingTodo) return
        const updatedDailyProgress = { ...(trackingTodo.dailyProgress || {}), [dateKey]: progress }
        const updatedTodo = { ...trackingTodo, dailyProgress: updatedDailyProgress }
        updateTodo(trackingTodo.id, { dailyProgress: updatedDailyProgress })
        setTrackingTodo(updatedTodo)
    }

    const handleSaveDashboardProgress = (todoId: string, dateKey: string, progress: DailyProgress) => {
        const targetTodo = todos.find(t => t.id === todoId)
        if (!targetTodo) return
        const updatedDailyProgress = { ...(targetTodo.dailyProgress || {}), [dateKey]: progress }
        updateTodo(todoId, { dailyProgress: updatedDailyProgress })
    }

    const handleFormSubmit = (data: TodoFormValues) => {
        addTodo(data)
        router.push(`${ROUTES.HOME}?tab=view`)
    }

    return (
        <div
            ref={containerRef}
            className="min-h-screen bg-background text-foreground selection:bg-primary/25 selection:text-foreground px-4 sm:p-8 md:p-12 pt-16 sm:pt-28 md:pt-40 pb-28 sm:pb-12 relative"
        >
            {/* Geometric grid texture */}
            <div
                aria-hidden
                className="fixed inset-0 pointer-events-none z-0 opacity-[0.035] dark:opacity-[0.04]"
                style={{
                    backgroundImage: `linear-gradient(var(--color-border, #888) 1px, transparent 1px), linear-gradient(90deg, var(--color-border, #888) 1px, transparent 1px)`,
                    backgroundSize: '48px 48px',
                }}
            />

            {/* Noise grain overlay */}
            <div aria-hidden className="fixed inset-0 noise-overlay z-0" />

            <main className="max-w-6xl mx-auto space-y-6 sm:space-y-12 relative z-10">

                {/* ── Editorial Hero Header — only in View tab ── */}
                {activeTab === 'view' && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-3 duration-700">
                        <p className="label-mono text-primary">Command Center</p>
                        <h1 className="display-serif text-3xl sm:text-6xl md:text-7xl text-foreground leading-[1.05] tracking-[-0.03em]">
                            Yasir&apos;s{' '}
                            <em className="not-italic font-normal text-muted-foreground/60 italic">
                                Focus
                            </em>
                        </h1>
                        <div className="rule-x mt-2" />
                    </div>
                )}

                <section className="relative min-h-96">

                    {/* View tab — Eisenhower Matrix */}
                    {activeTab === 'view' && (
                        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                            <DragDropContext onDragEnd={handleDragEnd}>
                                {/* On lg+: Urgent+Important spans 2 cols, others fill remaining 2-col row */}
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                                    {/* Urgent + Important — wide / hero quadrant */}
                                    <div className="anim-matrix-quadrant lg:col-span-2 relative">
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
                                    {/* Un-Urgent + Important */}
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
                                    {/* Urgent + Un-Important */}
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
                                    {/* Un-Urgent + Un-Important */}
                                    <div className="anim-matrix-quadrant relative md:col-span-1 lg:col-span-2">
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
                        </div>
                    )}

                    {activeTab === 'create' && (
                        <div className="max-w-4xl mx-auto py-12 anim-matrix-quadrant animate-in fade-in slide-in-from-bottom-2 duration-300">
                            <TodoForm onSubmit={handleFormSubmit} />
                        </div>
                    )}

                    {activeTab === 'track' && (
                        <div className="anim-matrix-quadrant animate-in fade-in slide-in-from-bottom-2 duration-300">
                            <DailyTrackingDashboard dailyTodos={todos.filter(t => t.isDaily)} />
                        </div>
                    )}
                </section>
            </main>

            {trackingTodo && (
                <DailyTrackerModal
                    isOpen={!!trackingTodo}
                    onClose={() => setTrackingTodo(null)}
                    todo={trackingTodo}
                    onSave={handleSaveDailyProgress}
                />
            )}
        </div>
    )
}
