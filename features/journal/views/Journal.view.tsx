/*
 * File Name:     Journal.view.tsx
 * Description:   Editorial journal editor — newspaper column layout, static word
 *                count, em-dash empty state for archive sidebar, noise overlay.
 */

"use client"

import React, { useRef, useState } from 'react'
import { Save, History, Calendar as CalendarIcon, ArrowLeft, ArrowUpRight, PenLine } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { useJournal } from '../hooks/useJournal'
import { useJournalAnimations } from '../hooks/useJournalAnimations'
import { JournalEntry } from '../types/journal.types'
import { format } from 'date-fns'
import Link from 'next/link'

/* ─── Editor sub-component ─── */
const JournalEditor = ({ onSave }: { onSave: (title: string, content: string) => void }) => {
    const [title, setTitle] = useState("")
    const [content, setContent] = useState("")

    const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0

    const handleSave = () => {
        if (!content.trim() && !title.trim()) return
        onSave(title, content)
        setTitle("")
        setContent("")
    }

    return (
        <div className="space-y-5 relative group/editor">
            {/* Soft ambient glow on focus */}
            <div className="absolute -inset-4 bg-gradient-to-br from-primary/8 via-transparent to-transparent rounded-3xl blur-2xl opacity-0 transition-opacity duration-700 group-hover/editor:opacity-100 pointer-events-none" />

            <Card className="relative bg-background/80 backdrop-blur-2xl border-border/40 shadow-sm dark:shadow-md overflow-hidden transition-shadow duration-300 rounded-2xl flex flex-col ring-1 ring-inset ring-foreground/5 h-full focus-within:ring-primary/20 focus-within:shadow-lg">
                <CardContent className="p-0 flex flex-col h-full relative z-10">
                    {/* Title input */}
                    <div className="px-6 sm:px-10 pt-10 pb-4 border-b border-border/15">
                        <Input
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="A New Reflection…"
                            className="border-0 p-0 h-auto bg-transparent focus-visible:ring-0 text-3xl sm:text-4xl lg:text-5xl font-serif font-semibold tracking-tight transition-all duration-300 placeholder:text-muted-foreground/25 text-foreground"
                        />
                    </div>

                    {/* Body textarea */}
                    <div className="flex-1 px-6 sm:px-10 pb-8 pt-6 relative flex flex-col">
                        <Textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder="It was a quiet morning…"
                            className="flex-1 min-h-80 border-none focus-visible:ring-0 bg-transparent resize-none p-0 text-lg sm:text-xl font-sans leading-[1.85] placeholder:italic placeholder:text-muted-foreground/25 text-foreground/90 transition-all duration-300"
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Footer row */}
            <div className="flex justify-between items-center px-1">
                {/* Static word count — no ping dot distraction */}
                <span className="font-mono text-xs text-muted-foreground/50 tracking-wider tabular-nums">
                    {wordCount > 0 ? `${wordCount} word${wordCount !== 1 ? 's' : ''}` : 'Ready to write'}
                </span>

                <Button
                    onClick={handleSave}
                    disabled={!content.trim() && !title.trim()}
                    className="px-7 py-5 rounded-full text-sm font-semibold transition-all duration-300 hover:scale-105 active:scale-95 shadow-md shadow-primary/20 bg-foreground text-background hover:bg-foreground/90 disabled:opacity-40 disabled:hover:scale-100 gap-2"
                >
                    <Save className="h-4 w-4" />
                    Save Journal
                </Button>
            </div>
        </div>
    )
}

/* ─── Main View ─── */
export const JournalView = () => {
    const { entries, saveEntry, isLoaded } = useJournal()
    const containerRef = useRef<HTMLDivElement>(null)
    const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null)

    useJournalAnimations(containerRef)

    if (!isLoaded) return null

    const groupedEntries = entries.reduce((acc, entry) => {
        const dateKey = entry.date
        if (!acc[dateKey]) acc[dateKey] = []
        acc[dateKey].push(entry)
        return acc
    }, {} as Record<string, typeof entries>)

    return (
        <div ref={containerRef} className="min-h-screen bg-background text-foreground selection:bg-primary/25 selection:text-foreground relative overflow-hidden">
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

            <main className="max-w-7xl mx-auto px-4 sm:px-10 lg:px-12 pt-6 sm:pt-36 pb-28 sm:pb-24 relative z-10 flex flex-col gap-8 lg:gap-12">

                {/* ── Header ── */}
                <div className="anim-journal-header space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-border/30">
                        <Link href="/journal" className="w-fit focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 rounded-full">
                            <Button variant="outline" size="sm" className="gap-2 rounded-full px-4 bg-background/50 hover:bg-muted text-muted-foreground hover:text-foreground transition-all group border-border/50 shadow-sm backdrop-blur-sm">
                                <ArrowLeft className="h-3.5 w-3.5 group-hover:-translate-x-1 transition-transform" />
                                <span className="font-mono tracking-wider text-[10px] uppercase">All Journals</span>
                            </Button>
                        </Link>
                        <p className="label-mono text-primary/70">Reflection Space</p>
                    </div>

                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-5 mt-2">
                        <div className="space-y-1">
                            <h1 className="display-serif text-5xl sm:text-6xl md:text-7xl text-foreground">
                                Today&apos;s{' '}
                                <em className="not-italic font-normal text-muted-foreground/60 italic">
                                    Thoughts
                                </em>
                            </h1>
                        </div>
                        <div className="flex items-center gap-3 text-muted-foreground bg-card/80 px-4 py-3 rounded-xl border border-border/40 backdrop-blur-md self-start md:self-end shadow-sm">
                            <CalendarIcon className="h-4 w-4 text-primary/60" />
                            <div className="flex flex-col">
                                <span className="font-mono text-[9px] tracking-widest uppercase text-muted-foreground/50">Date</span>
                                <span className="font-sans text-sm font-semibold text-foreground">{format(new Date(), 'MMMM do, yyyy')}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Newspaper column layout ── */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-0 lg:divide-x lg:divide-border/30">
                    {/* Editor — 3 cols */}
                    <div className="lg:col-span-3 lg:pr-10 anim-journal-editor h-full flex flex-col min-h-96">
                        <JournalEditor onSave={(title, content) => saveEntry(title, content)} />
                    </div>

                    {/* Archive sidebar — 1 col, newspaper vertical rule separates it */}
                    <aside className="lg:pl-10 mt-10 lg:mt-0 space-y-6">
                        <div className="anim-journal-header flex items-center justify-between pb-4 border-b border-border/30">
                            <div className="flex items-center gap-2">
                                <History className="h-4 w-4 text-muted-foreground/50" />
                                <h2 className="font-mono text-[10px] tracking-widest text-muted-foreground uppercase">Archive</h2>
                            </div>
                            <span className="font-mono text-[10px] tracking-wider text-muted-foreground/40">{entries.length}</span>
                        </div>

                        <div className="relative">
                            {/* Timeline line */}
                            {Object.keys(groupedEntries).length > 0 && (
                                <div className="absolute left-3 top-4 bottom-4 w-px bg-gradient-to-b from-primary/30 to-transparent z-0" />
                            )}

                            <div className="space-y-6 max-h-[460px] overflow-y-auto pr-2 relative z-10 pb-8 scroll-smooth">
                                {Object.keys(groupedEntries).length === 0 ? (
                                    // Em-dash editorial empty state
                                    <div className="flex flex-col items-center py-10 text-center select-none">
                                        <span className="font-serif text-6xl text-muted-foreground/15 leading-none">—</span>
                                        <p className="font-serif italic text-xs text-muted-foreground/30 mt-3 max-w-[140px]">
                                            A blank page awaits.
                                        </p>
                                    </div>
                                ) : (
                                    Object.entries(groupedEntries).map(([date, dayEntries]) => (
                                        <div key={date} className="space-y-3 relative mt-3">
                                            <div className="flex items-center gap-3 py-1.5">
                                                <div className="h-2 w-2 bg-background border-2 border-primary rounded-full ml-2 flex-shrink-0 z-10" />
                                                <h3 className="font-mono text-[10px] tracking-widest uppercase text-muted-foreground/50">
                                                    {format(new Date(`${date}T00:00:00`), 'MMM do')}
                                                </h3>
                                            </div>

                                            <div className="space-y-2 pl-8">
                                                {dayEntries.map((entry) => (
                                                    <button
                                                        key={entry.id}
                                                        onClick={() => setSelectedEntry(entry)}
                                                        className="anim-journal-item w-full text-left p-4 rounded-xl transition-all duration-200 bg-background/60 hover:bg-card border border-border/30 hover:border-primary/30 text-foreground group relative overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary shadow-sm hover:shadow-md"
                                                    >
                                                        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                                            <ArrowUpRight className="h-3.5 w-3.5 text-primary" />
                                                        </div>
                                                        <div className="mb-2">
                                                            <span className="font-mono text-[10px] tracking-wider text-primary/60 bg-primary/8 px-2 py-0.5 rounded uppercase">
                                                                {format(new Date(entry.createdAt), 'h:mm a')}
                                                            </span>
                                                        </div>
                                                        <h4 className="font-serif font-semibold text-base mb-1.5 truncate pr-5 group-hover:text-primary transition-colors leading-tight">
                                                            {entry.title || "Untitled Session"}
                                                        </h4>
                                                        <p className="text-xs text-muted-foreground font-sans line-clamp-2 leading-relaxed">
                                                            {entry.content || "Empty entry"}
                                                        </p>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </aside>
                </div>
            </main>

            {/* Reading Dialog */}
            <Dialog open={!!selectedEntry} onOpenChange={(open) => !open && setSelectedEntry(null)}>
                <DialogContent className="sm:max-w-2xl lg:max-w-4xl max-h-[90vh] p-0 overflow-hidden bg-background/98 backdrop-blur-2xl border-border/50 shadow-2xl rounded-2xl">
                    <div className="absolute inset-0 bg-gradient-to-b from-primary/3 to-transparent pointer-events-none" />
                    <div className="p-8 sm:p-12 border-b border-border/15 bg-muted/5 relative overflow-hidden">
                        <DialogHeader>
                            <div className="flex flex-wrap items-center gap-2 text-muted-foreground/60 mb-5">
                                <span className="font-mono text-[10px] tracking-widest uppercase flex items-center gap-1.5">
                                    <CalendarIcon className="h-3 w-3" />
                                    {selectedEntry && format(new Date(selectedEntry.createdAt), 'MMMM do, yyyy')}
                                </span>
                                <span className="opacity-40">·</span>
                                <span className="font-mono text-[10px] tracking-widest uppercase flex items-center gap-1.5">
                                    <History className="h-3 w-3" />
                                    {selectedEntry && format(new Date(selectedEntry.createdAt), 'h:mm a')}
                                </span>
                            </div>
                            <DialogTitle className="display-serif text-4xl sm:text-5xl md:text-6xl text-foreground leading-[1.05]">
                                {selectedEntry?.title || "Untitled Session"}
                            </DialogTitle>
                        </DialogHeader>
                    </div>
                    <ScrollArea className="max-h-[60vh] relative">
                        <div className="p-8 sm:p-12 border-l-4 border-primary/15 ml-8 sm:ml-12 mr-8 sm:mr-12 my-8">
                            <p className="font-serif text-lg leading-[1.9] text-foreground/90 whitespace-pre-wrap">
                                {selectedEntry?.content || <span className="italic opacity-40">This entry has no content.</span>}
                            </p>
                        </div>
                    </ScrollArea>
                </DialogContent>
            </Dialog>
        </div>
    )
}
