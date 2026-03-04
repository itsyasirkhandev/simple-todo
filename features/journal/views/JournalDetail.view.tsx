"use client"

import React from 'react'
import { useRouter } from 'next/navigation'
import { useJournal } from '../hooks/useJournal'
import { Calendar as CalendarIcon, History, ArrowLeft, PenLine } from 'lucide-react'
import { format } from 'date-fns'
import Link from 'next/link'

interface JournalDetailViewProps {
    id: string
}

export const JournalDetailView = ({ id }: JournalDetailViewProps) => {
    const { entries } = useJournal()
    const router = useRouter()

    // We'll just rely on the fallback from parent or initial render
    // Or we can just render the client stuff directly since we disabled ssr on the wrapper.

    const entry = entries.find(e => e.id === id)

    if (!entry) {
        return (
            <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
                <div className="space-y-6 text-center">
                    <h1 className="font-serif text-4xl text-foreground">Entry not found</h1>
                    <p className="text-muted-foreground font-mono text-sm max-w-sm mx-auto">
                        The journal entry you requested does not exist or has been removed from the archive.
                    </p>
                    <button
                        onClick={() => router.push('/journal')}
                        className="group inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-primary hover:text-foreground transition-colors"
                    >
                        <ArrowLeft className="h-4 w-4 transform group-hover:-translate-x-1 transition-transform" />
                        Return to Archive
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-background text-foreground selection:bg-primary/25 selection:text-foreground md:px-12 relative overflow-hidden">
            {/* Geometric grid texture */}
            <div
                aria-hidden
                className="fixed inset-0 pointer-events-none z-0 opacity-[0.03] dark:opacity-[0.04]"
                style={{
                    backgroundImage: `linear-gradient(var(--color-border, #888) 1px, transparent 1px), linear-gradient(90deg, var(--color-border, #888) 1px, transparent 1px)`,
                    backgroundSize: '48px 48px',
                }}
            />
            <div aria-hidden className="fixed inset-0 noise-overlay z-0" />

            {/* Glowing Accent */}
            <div className="fixed top-0 right-0 w-[40vw] h-[40vw] rounded-full bg-primary/5 blur-[100px] pointer-events-none" />

            {/* Navigation Header */}
            <header className="fixed top-0 left-0 right-0 z-50 p-6 md:p-8 flex justify-between items-center bg-gradient-to-b from-background via-background/90 to-transparent backdrop-blur-[2px]">
                <button
                    onClick={() => router.push('/journal')}
                    className="group inline-flex items-center gap-2 font-mono text-[10px] md:text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground transition-all duration-300"
                >
                    <ArrowLeft className="h-3.5 w-3.5 transform group-hover:-translate-x-1 transition-transform" />
                    Back to Archive
                </button>

                <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground/50 hidden md:block">
                    Session {entry.id.split('-')[0]}
                </div>
            </header>

            <main className="max-w-4xl mx-auto pt-32 pb-24 md:pt-48 md:pb-32 px-6 relative z-10 w-full min-h-screen flex flex-col">
                <article className="flex-1 space-y-16">
                    {/* Editorial header */}
                    <header className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">
                        {/* Meta info row */}
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-border/20 pb-4">
                            <span className="font-mono text-[10px] sm:text-xs tracking-widest uppercase flex items-center gap-1.5 text-primary">
                                <CalendarIcon className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                                {format(new Date(entry.createdAt), 'MMMM do, yyyy')}
                            </span>
                            <span className="opacity-30 text-muted-foreground">/</span>
                            <span className="font-mono text-[10px] sm:text-xs tracking-widest uppercase flex items-center gap-1.5 text-muted-foreground">
                                <History className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                                {format(new Date(entry.createdAt), 'h:mm a')}
                            </span>
                        </div>

                        {/* Huge title */}
                        <h1 className="font-serif text-5xl sm:text-6xl md:text-7xl lg:text-8xl text-foreground leading-[1.05] tracking-tight">
                            {entry.title || "Untitled Session"}
                        </h1>
                    </header>

                    {/* Content area */}
                    <div className="animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-200 fill-mode-both relative">
                        {/* Large decorative quotation mark for ambiance */}
                        <div className="absolute -top-16 -left-8 md:-left-16 font-serif text-[10rem] md:text-[14rem] text-primary/5 pointer-events-none select-none leading-none z-[-1]">
                            &ldquo;
                        </div>

                        <div className="prose prose-lg md:prose-xl dark:prose-invert max-w-none">
                            <p className="font-serif text-lg md:text-2xl leading-[1.8] md:leading-[1.9] text-foreground/85 whitespace-pre-wrap">
                                {entry.content || <span className="italic opacity-40">This entry has no content.</span>}
                            </p>
                        </div>
                    </div>
                </article>

                {/* Footer details */}
                <footer className="mt-32 pt-8 border-t border-border/20 animate-in fade-in duration-1000 delay-500 fill-mode-both flex justify-between items-end">
                    <div className="space-y-1">
                        <p className="font-mono text-[10px] text-muted-foreground/60 uppercase tracking-widest">Recorded on</p>
                        <p className="font-sans text-sm text-foreground/80">{format(new Date(entry.createdAt), 'EEEE, MMMM do yyyy')}</p>
                    </div>

                    <Link href="/journal/create" className="group flex items-center justify-center h-12 w-12 rounded-full border border-border/50 hover:border-primary/50 hover:bg-primary/5 transition-all duration-300">
                        <PenLine className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    </Link>
                </footer>
            </main>
        </div>
    )
}
