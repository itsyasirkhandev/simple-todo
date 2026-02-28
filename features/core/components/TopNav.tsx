/*
 * File Name:     TopNav.tsx
 * Description:   Global navigation bar providing routes to Tasks and Journal.
 * Author:        Antigravity
 * Created Date:  2026-02-28
 */

"use client"

import React from 'react'
import Link from 'next/link'
import { useSearchParams, usePathname } from 'next/navigation'
import { LayoutGrid, PlusCircle, Activity, Book } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ROUTES } from '@/constants/routes'
import { useTodos } from '@/features/todos'

/**
 * Global Top Navigation component.
 * Extracts the premium design from the dashboard to provide consistent site-wide routing.
 * @returns {JSX.Element} The rendered navigation header.
 */
export const TopNav = () => {
    const searchParams = useSearchParams()
    const pathname = usePathname()
    const { todos, isLoaded } = useTodos()

    // Determine active tab/route
    const activeTab = searchParams.get('tab') || 'view'
    const isHome = pathname === ROUTES.HOME
    const isJournal = pathname === ROUTES.JOURNAL

    return (
        <header className="fixed top-8 left-1/2 -translate-x-1/2 z-40 w-max max-w-[90vw] animate-in fade-in slide-in-from-top-4 duration-700">
            <nav className="flex items-center p-1.5 bg-background/80 backdrop-blur-xl border border-border/50 shadow-sm rounded-full transition-all duration-500">
                <Link
                    href={`${ROUTES.HOME}?tab=view`}
                    className={cn(
                        "group flex items-center justify-center gap-2 px-3 sm:px-6 py-2.5 text-sm font-semibold font-sans tracking-tight transition-all duration-300 rounded-full",
                        isHome && activeTab === 'view' ? "bg-foreground text-background shadow-md" : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                    )}
                >
                    <LayoutGrid className={cn("h-3.5 w-3.5 sm:h-4 sm:w-4 transition-transform group-hover:scale-110", isHome && activeTab === 'view' ? "text-primary/80" : "text-muted-foreground")} />
                    <span className="hidden sm:inline">View Tasks</span>
                    <span className="sm:hidden">Tasks</span>
                </Link>

                <Link
                    href={`${ROUTES.HOME}?tab=create`}
                    className={cn(
                        "group flex items-center justify-center gap-2 px-3 sm:px-6 py-2.5 text-sm font-semibold font-sans tracking-tight transition-all duration-300 rounded-full",
                        isHome && activeTab === 'create' ? "bg-foreground text-background shadow-md" : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                    )}
                >
                    <PlusCircle className={cn("h-3.5 w-3.5 sm:h-4 sm:w-4 transition-transform group-hover:rotate-90", isHome && activeTab === 'create' ? "text-primary/80" : "text-muted-foreground")} />
                    <span className="hidden sm:inline">Create Task</span>
                    <span className="sm:hidden">Create</span>
                </Link>

                <Link
                    href={`${ROUTES.HOME}?tab=track`}
                    className={cn(
                        "group flex items-center justify-center gap-2 px-3 sm:px-6 py-2.5 text-sm font-semibold font-sans tracking-tight transition-all duration-300 relative rounded-full",
                        isHome && activeTab === 'track' ? "bg-foreground text-background shadow-md" : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                    )}
                >
                    <Activity className={cn("h-3.5 w-3.5 sm:h-4 sm:w-4 transition-transform group-hover:scale-110", isHome && activeTab === 'track' ? "text-primary/80 animate-pulse" : "text-muted-foreground")} />
                    <span className="hidden sm:inline">Track Progress</span>
                    <span className="sm:hidden">Track</span>
                    {isLoaded && !(isHome && activeTab === 'track') && todos.some(t => t.isDaily) && (
                        <span className="absolute top-2 right-4 flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-60"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                        </span>
                    )}
                </Link>

                <div className="w-px h-6 bg-border/50 mx-1" />

                <Link
                    href={ROUTES.JOURNAL}
                    className={cn(
                        "group flex items-center justify-center gap-2 px-3 sm:px-6 py-2.5 text-[11px] sm:text-[13px] font-semibold font-sans tracking-tight transition-all duration-300 rounded-full",
                        isJournal ? "bg-foreground text-background shadow-md" : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                    )}
                >
                    <Book className={cn("h-3.5 w-3.5 sm:h-4 sm:w-4 transition-transform group-hover:scale-110", isJournal ? "text-primary/80" : "text-muted-foreground")} />
                    <span className="hidden sm:inline">Daily Journal</span>
                    <span className="sm:hidden">Journal</span>
                </Link>
            </nav>
        </header>
    )
}
