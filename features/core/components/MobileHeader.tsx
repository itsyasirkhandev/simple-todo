/*
 * File Name:     MobileHeader.tsx
 * Description:   Thin branded app header shown only on mobile.
 *                Shows wordmark + theme toggle. Desktop uses the TopNav pill instead.
 */

"use client"

import React from 'react'
import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import { ROUTES } from '@/constants/routes'
import { ModeToggle } from '@/components/mode-toggle'
import { cn } from '@/lib/utils'

const pageLabels: Record<string, string> = {
    view: 'Tasks',
    create: 'New Task',
    track: 'Tracker',
}

export const MobileHeader = () => {
    const pathname = usePathname()
    const searchParams = useSearchParams()
    const activeTab = searchParams.get('tab') || 'view'

    // Resolve current page title
    let pageTitle = 'Focus'
    if (pathname === ROUTES.HOME) {
        pageTitle = pageLabels[activeTab] ?? 'Tasks'
    } else if (pathname === ROUTES.JOURNAL || pathname.startsWith('/journal/create')) {
        pageTitle = pathname.includes('create') ? 'New Entry' : 'Journal'
    } else if (pathname === ROUTES.JOURNAL) {
        pageTitle = 'Journal'
    }

    return (
        <header
            className="sm:hidden fixed top-0 left-0 right-0 z-50"
            style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}
        >
            <div className="bg-background/90 backdrop-blur-xl border-b border-border/40 shadow-sm">
                <div className="flex items-center justify-between px-4 h-14">
                    {/* Wordmark */}
                    <Link href={ROUTES.HOME} className="flex items-center gap-2 focus-visible:outline-none">
                        <span className="font-mono text-[11px] tracking-[0.22em] uppercase text-foreground/80 font-semibold select-none">
                            YASIR
                        </span>
                        <span className="w-px h-3.5 bg-border/60" />
                        <span className="font-serif text-base font-semibold text-foreground/70 tracking-tight">
                            {pageTitle}
                        </span>
                    </Link>

                    {/* Theme toggle on mobile header */}
                    <ModeToggle />
                </div>
            </div>
        </header>
    )
}
