/*
 * File Name:     TopNav.tsx
 * Description:   Global navigation bar — industrial-editorial redesign.
 *                Left-anchored on desktop, centered on mobile. Bottom-border
 *                active state, wordmark, and upgraded font treatment.
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
 * Industrial-editorial redesign: left-anchored pill on desktop, with a
 * wordmark, mono-label nav items, and bottom-border active indicators.
 */
export const TopNav = () => {
    const searchParams = useSearchParams()
    const pathname = usePathname()
    const { todos, isLoaded } = useTodos()

    const activeTab = searchParams.get('tab') || 'view'
    const isHome = pathname === ROUTES.HOME
    const isJournal = pathname === ROUTES.JOURNAL || pathname.startsWith('/journal')

    return (
        <header className="fixed top-6 left-1/2 -translate-x-1/2 md:left-8 md:translate-x-0 z-40 animate-in fade-in slide-in-from-top-4 duration-700">
            <nav className="flex items-center gap-0.5 px-2 py-2 bg-background/85 backdrop-blur-xl border border-border/60 shadow-sm rounded-full transition-all duration-500">

                {/* Wordmark — home link */}
                <Link
                    href={ROUTES.HOME}
                    className="flex items-center px-3 py-1.5 mr-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 rounded-full"
                    title="Home"
                >
                    <span className="font-mono text-[10px] font-normal tracking-[0.2em] uppercase text-foreground/50 hover:text-primary transition-colors duration-300 select-none">
                        YASIR
                    </span>
                </Link>

                <div className="w-px h-4 bg-border/50 mr-1" />

                {/* View Tasks */}
                <NavItem
                    href={`${ROUTES.HOME}?tab=view`}
                    isActive={isHome && activeTab === 'view'}
                    icon={<LayoutGrid className="h-3.5 w-3.5" />}
                    label="Tasks"
                    labelFull="View Tasks"
                />

                {/* Create Task */}
                <NavItem
                    href={`${ROUTES.HOME}?tab=create`}
                    isActive={isHome && activeTab === 'create'}
                    icon={<PlusCircle className="h-3.5 w-3.5" />}
                    label="Create"
                    labelFull="Create Task"
                />

                {/* Track Progress */}
                <NavItem
                    href={`${ROUTES.HOME}?tab=track`}
                    isActive={isHome && activeTab === 'track'}
                    icon={<Activity className="h-3.5 w-3.5" />}
                    label="Track"
                    labelFull="Track Progress"
                    badge={isLoaded && !(isHome && activeTab === 'track') && todos.some(t => t.isDaily)}
                />

                <div className="w-px h-4 bg-border/50 mx-1" />

                {/* Journal — distinct secondary style */}
                <Link
                    href={ROUTES.JOURNAL}
                    className={cn(
                        "group flex items-center justify-center gap-1.5 px-3 sm:px-4 py-2 text-xs rounded-full border transition-all duration-300",
                        isJournal
                            ? "border-primary/50 bg-primary/10 text-primary font-semibold"
                            : "border-border/40 text-muted-foreground hover:border-primary/30 hover:text-foreground hover:bg-muted/30"
                    )}
                >
                    <Book className={cn("h-3.5 w-3.5 transition-transform group-hover:scale-110", isJournal && "text-primary")} />
                    <span className="hidden sm:inline font-mono tracking-wider text-[10px] uppercase">Journal</span>
                    <span className="sm:hidden font-mono tracking-wider text-[10px] uppercase">J</span>
                </Link>
            </nav>
        </header>
    )
}

/* ─── NavItem sub-component ─── */
interface NavItemProps {
    href: string
    isActive: boolean
    icon: React.ReactNode
    label: string
    labelFull: string
    badge?: boolean | null
}

const NavItem = ({ href, isActive, icon, label, labelFull, badge }: NavItemProps) => (
    <Link
        href={href}
        className={cn(
            "group relative flex items-center justify-center gap-1.5 px-3 sm:px-4 py-2 rounded-full transition-all duration-200",
            isActive
                ? "text-foreground bg-muted/60"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
        )}
    >
        <span className={cn("transition-colors duration-200", isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground")}>
            {icon}
        </span>
        <span className="hidden sm:inline font-mono tracking-wider text-[10px] uppercase">{labelFull}</span>
        <span className="sm:hidden font-mono tracking-wider text-[10px] uppercase">{label}</span>

        {/* Bottom-border active indicator */}
        {isActive && (
            <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-[2px] bg-primary rounded-full" />
        )}

        {/* Notification badge */}
        {badge && (
            <span className="absolute top-2 right-2 flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-60" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-primary" />
            </span>
        )}
    </Link>
)
