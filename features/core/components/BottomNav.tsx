/*
 * File Name:     BottomNav.tsx
 * Description:   Native-style mobile bottom navigation bar.
 *                Visible only on mobile (sm:hidden). Provides large tap targets,
 *                haptic-style active feedback, and iOS safe-area insets.
 */

"use client"

import React from 'react'
import Link from 'next/link'
import { useSearchParams, usePathname } from 'next/navigation'
import { LayoutGrid, PlusCircle, Activity, BookOpen } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ROUTES } from '@/constants/routes'
import { useTodos } from '@/features/todos'

interface BottomNavItem {
    href: string
    icon: React.ReactNode
    label: string
    isActive: boolean
    badge?: boolean
}

export const BottomNav = () => {
    const searchParams = useSearchParams()
    const pathname = usePathname()
    const { todos, isLoaded } = useTodos()

    const activeTab = searchParams.get('tab') || 'view'
    const isHome = pathname === ROUTES.HOME
    const isJournal = pathname === ROUTES.JOURNAL || pathname.startsWith('/journal')

    const items: BottomNavItem[] = [
        {
            href: `${ROUTES.HOME}?tab=view`,
            icon: <LayoutGrid className="h-5 w-5" />,
            label: 'Tasks',
            isActive: isHome && activeTab === 'view',
        },
        {
            href: `${ROUTES.HOME}?tab=create`,
            icon: <PlusCircle className="h-5 w-5" />,
            label: 'Create',
            isActive: isHome && activeTab === 'create',
        },
        {
            href: `${ROUTES.HOME}?tab=track`,
            icon: <Activity className="h-5 w-5" />,
            label: 'Track',
            isActive: isHome && activeTab === 'track',
            badge: isLoaded && !(isHome && activeTab === 'track') && todos.some(t => t.isDaily),
        },
        {
            href: ROUTES.JOURNAL,
            icon: <BookOpen className="h-5 w-5" />,
            label: 'Journal',
            isActive: isJournal,
        },
    ]

    return (
        <nav
            className="sm:hidden fixed bottom-0 left-0 right-0 z-50"
            style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
        >
            {/* Frosted glass surface */}
            <div className="bg-background/90 backdrop-blur-2xl border-t border-border/50 shadow-[0_-8px_32px_-4px_hsl(0_0%_0%/0.15)]">
                <div className="flex items-stretch h-16">
                    {items.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "relative flex-1 flex flex-col items-center justify-center gap-1 transition-all duration-200 active:scale-95",
                                item.isActive ? "text-primary" : "text-muted-foreground"
                            )}
                        >
                            {/* Active indicator pill above icon */}
                            {item.isActive && (
                                <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-[2.5px] bg-primary rounded-full" />
                            )}

                            {/* Icon with active scale */}
                            <span
                                className={cn(
                                    "relative flex items-center justify-center w-10 h-8 rounded-xl transition-all duration-200",
                                    item.isActive && "bg-primary/12 scale-110"
                                )}
                            >
                                {item.icon}

                                {/* Badge dot */}
                                {item.badge && (
                                    <span className="absolute top-0.5 right-0.5 flex h-2 w-2">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-60" />
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
                                    </span>
                                )}
                            </span>

                            {/* Label */}
                            <span
                                className={cn(
                                    "font-mono text-[9px] tracking-wider uppercase transition-all duration-200",
                                    item.isActive ? "font-semibold text-primary" : "text-muted-foreground/60"
                                )}
                            >
                                {item.label}
                            </span>
                        </Link>
                    ))}
                </div>
            </div>
        </nav>
    )
}
