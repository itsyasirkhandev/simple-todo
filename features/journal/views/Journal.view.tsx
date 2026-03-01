/*
 * File Name:     Journal.view.tsx
 * Description:   Main view for the Daily Journal feature, redesigned for premium SaaS aesthetics.
 * Author:        Antigravity
 * Created Date:  2026-02-28
 * Last Modified: 2026-03-01
 */

"use client"

import React, { useRef, useState } from 'react'
import { Save, History, Calendar as CalendarIcon, Sparkles, ArrowLeft, ArrowUpRight, PenLine } from 'lucide-react'
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

/**
 * Editor sub-component for the Journal.
 * Uses a key from parent to reset state on date change without useEffect.
 * 
 * @param {object} props - Component properties.
 * @param {Function} props.onSave - Callback function to save the entry.
 * @returns {JSX.Element} The rendered editor.
 */
const JournalEditor = ({
    onSave
}: {
    onSave: (title: string, content: string) => void;
}) => {
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");

    const handleSave = () => {
        if (!content.trim() && !title.trim()) return;
        onSave(title, content);
        setTitle("");
        setContent("");
    };

    return (
        <div className="space-y-6 relative group">
            {/* Soft background glow on hover */}
            <div className="absolute -inset-4 bg-gradient-to-br from-primary/10 via-transparent to-transparent rounded-3xl blur-2xl opacity-0 transition-opacity duration-700 group-hover:opacity-100 pointer-events-none" />

            <Card className="relative bg-background/80 backdrop-blur-2xl border-border/40 shadow-sm dark:shadow-md overflow-hidden transition-all duration-500 rounded-2xl flex flex-col ring-1 ring-inset ring-foreground/5 h-full">
                <CardContent className="p-0 flex flex-col h-full relative z-10">
                    <div className="px-6 sm:px-10 pt-10 pb-4 relative group/header transition-colors duration-500 focus-within:bg-muted/10">
                        <Input
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="A New Reflection..."
                            className="border-0 p-0 h-auto bg-transparent focus-visible:ring-0 text-4xl sm:text-5xl lg:text-6xl font-serif font-semibold tracking-tight transition-all duration-300 placeholder:text-muted-foreground/30 text-foreground"
                        />
                    </div>
                    <div className="flex-1 px-6 sm:px-10 pb-10 relative flex flex-col">
                        <Textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder="It was a quiet morning..."
                            className="flex-1 min-h-96 border-none focus-visible:ring-0 bg-transparent resize-none p-0 text-base sm:text-2xl font-sans leading-relaxed placeholder:italic placeholder:text-muted-foreground/30 text-foreground/90 transition-all duration-500"
                        />
                    </div>
                </CardContent>
            </Card>

            <div className="flex justify-between items-center px-2">
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 text-sm sm:text-base font-semibold text-muted-foreground uppercase tracking-widest px-3 py-1.5 bg-background shadow-sm rounded-full border border-border/50 backdrop-blur-sm">
                        <span className="relative flex h-2 w-2">
                            {content.length > 0 && (
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary/60 opacity-75"></span>
                            )}
                            <span className={`relative inline-flex rounded-full h-2 w-2 ${content.length > 0 ? "bg-primary" : "bg-muted-foreground/50"}`}></span>
                        </span>
                        <span>{content.length > 0 ? "Drafting" : "Ready"}</span>
                    </div>
                    {content.length > 0 && (
                        <span className="text-xs text-muted-foreground font-sans hidden sm:block opacity-60">
                            {content.trim().split(/\s+/).length} word{content.trim().split(/\s+/).length !== 1 ? 's' : ''}
                        </span>
                    )}
                </div>
                <Button
                    onClick={handleSave}
                    disabled={!content.trim() && !title.trim()}
                    className="px-8 py-6 rounded-full text-base font-semibold transition-all duration-500 hover:scale-105 active:scale-95 shadow-lg shadow-primary/20 bg-foreground text-background hover:bg-foreground/90 disabled:opacity-50 disabled:hover:scale-100 gap-2 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                >
                    <Save className="h-4 w-4" />
                    Save Journal
                </Button>
            </div>
        </div>
    );
};

/**
 * Daily Journal View component.
 * Provides a premium, distraction-free environment for daily reflection.
 * @returns {JSX.Element} The rendered journal page.
 */
export const JournalView = () => {
    const { entries, saveEntry, isLoaded } = useJournal()
    const containerRef = useRef<HTMLDivElement>(null)
    const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);

    // Isolated Animation Logic
    useJournalAnimations(containerRef)

    if (!isLoaded) return null

    // Group entries by date
    const groupedEntries = entries.reduce((acc, entry) => {
        const dateKey = entry.date;
        if (!acc[dateKey]) acc[dateKey] = [];
        acc[dateKey].push(entry);
        return acc;
    }, {} as Record<string, typeof entries>);

    return (
        <div ref={containerRef} className="min-h-screen bg-background text-foreground selection:bg-primary/30 selection:text-foreground relative overflow-hidden">
            {/* Ambient Background Gradient Mesh */}
            <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full bg-primary/5 rounded-full blur-3xl mix-blend-multiply dark:mix-blend-screen opacity-60"></div>
                <div className="absolute bottom-0 right-0 w-1/2 h-1/2 bg-secondary/5 rounded-full blur-3xl mix-blend-multiply dark:mix-blend-screen opacity-60"></div>
            </div>

            {/* Custom Noise Grain */}
            <div className="fixed inset-0 pointer-events-none z-0 opacity-[0.03] dark:opacity-[0.05]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.85\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")' }}></div>

            <main className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-12 pt-28 sm:pt-36 pb-24 relative z-10 flex flex-col gap-12 lg:gap-16">

                {/* Branding & Header */}
                <div className="anim-journal-header space-y-6 opacity-90">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-border/30">
                        <Link href="/journal" className="inline-flex w-fit focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-full">
                            <Button variant="outline" size="sm" className="gap-2 rounded-full px-5 bg-background/50 hover:bg-muted text-muted-foreground hover:text-foreground transition-all group border-border/50 shadow-sm backdrop-blur-sm">
                                <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                                <span className="font-semibold tracking-tight text-xs uppercase">All Journals</span>
                            </Button>
                        </Link>
                        <div className="flex items-center gap-2 text-primary opacity-80 bg-primary/5 px-3 py-1.5 rounded-full border border-primary/10">
                            <Sparkles className="h-3.5 w-3.5" />
                            <span className="text-sm font-semibold tracking-widest uppercase">Reflection Space</span>
                        </div>
                    </div>

                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mt-4">
                        <div className="space-y-2">
                            <h1 className="text-5xl sm:text-6xl md:text-7xl font-serif font-semibold tracking-tighter text-foreground leading-[1.1]">
                                Today&apos;s <br className="hidden sm:block md:hidden" />
                                <span className="text-muted-foreground/60 italic font-normal">Thoughts</span>
                            </h1>
                        </div>
                        <div className="flex items-center gap-3 text-muted-foreground bg-muted/30 px-5 py-3 rounded-2xl border border-border/40 backdrop-blur-md self-start md:self-end">
                            <CalendarIcon className="h-5 w-5 text-primary/60" />
                            <div className="flex flex-col">
                                <span className="text-sm font-semibold uppercase tracking-wider opacity-70">Date</span>
                                <span className="text-sm font-sans font-semibold text-foreground">{format(new Date(), 'MMMM do, yyyy')}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-12 lg:gap-16">
                    {/* Editor Section */}
                    <div className="lg:col-span-3 anim-journal-editor h-full flex flex-col min-h-96">
                        <JournalEditor
                            onSave={(title, content) => saveEntry(title, content)}
                        />
                    </div>

                    {/* Timeline / History Section */}
                    <aside className="space-y-8 lg:mt-2 relative">
                        <div className="anim-journal-header flex items-center justify-between pb-4 border-b border-border/30 sticky top-0 bg-background/80 backdrop-blur-md z-30">
                            <div className="flex items-center gap-3">
                                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                    <History className="h-4 w-4" />
                                </div>
                                <h2 className="text-sm font-semibold tracking-widest text-foreground uppercase">Archive</h2>
                            </div>
                            <span className="text-sm font-semibold text-muted-foreground bg-muted/60 px-2 py-1 rounded-md border border-border/50 shadow-sm">{entries.length} items</span>
                        </div>

                        <div className="relative pl-1">
                            {/* Timeline guide line */}
                            {Object.keys(groupedEntries).length > 0 && (
                                <div className="absolute left-3 top-6 bottom-4 w-px bg-gradient-to-b from-primary/30 py-transparent to-transparent z-0" />
                            )}

                            <div className="space-y-8 h-96 min-h-96 md:h-[500px] md:min-h-[500px] overflow-y-auto pr-2 custom-scrollbar relative z-10 pb-10 scroll-smooth">
                                {Object.keys(groupedEntries).length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-16 text-center space-y-4 opacity-60">
                                        <div className="p-4 bg-muted/50 rounded-full">
                                            <PenLine className="h-8 w-8 text-muted-foreground" />
                                        </div>
                                        <p className="text-sm font-serif italic text-muted-foreground max-w-[200px]">A blank page is a playground for your thoughts.</p>
                                    </div>
                                ) : (
                                    Object.entries(groupedEntries).map(([date, dayEntries]) => (
                                        <div key={date} className="space-y-5 relative mt-4">
                                            <div className="flex items-center gap-4 bg-background py-2 sticky top-0 z-20">
                                                <div className="h-2 w-2 bg-background border-2 border-primary rounded-full ml-2 flex-shrink-0 shadow-sm z-10" />
                                                <h3 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground bg-muted/40 px-3 py-1 rounded-full border border-border/30">
                                                    {format(new Date(`${date}T00:00:00`), 'MMM do')}
                                                </h3>
                                            </div>

                                            <div className="space-y-4 pl-10 pr-2">
                                                {dayEntries.map((entry) => (
                                                    <button
                                                        key={entry.id}
                                                        onClick={() => setSelectedEntry(entry)}
                                                        className="anim-journal-item w-full text-left p-5 rounded-2xl transition-all duration-300 bg-background/60 hover:bg-muted/30 border border-border/40 hover:border-primary/40 text-foreground group relative overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary shadow-sm hover:shadow-md"
                                                    >
                                                        <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0 duration-300">
                                                            <ArrowUpRight className="h-4 w-4 text-primary" />
                                                        </div>
                                                        <div className="flex items-center gap-2 mb-3">
                                                            <span className="text-sm font-semibold uppercase tracking-widest text-primary/70 bg-primary/10 px-2.5 py-1 rounded-md">
                                                                {format(new Date(entry.createdAt), 'h:mm a')}
                                                            </span>
                                                        </div>
                                                        <h4 className="font-serif font-semibold text-2xl mb-2 truncate pr-6 group-hover:text-primary transition-colors">
                                                            {entry.title || "Untitled Session"}
                                                        </h4>
                                                        <p className="text-sm text-muted-foreground font-sans line-clamp-2 leading-relaxed opacity-80">
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

            <Dialog open={!!selectedEntry} onOpenChange={(open) => !open && setSelectedEntry(null)}>
                <DialogContent className="sm:max-w-2xl lg:max-w-4xl max-h-[85vh] p-0 overflow-hidden bg-background/80 backdrop-blur-3xl border-border/40 shadow-2xl rounded-2xl">
                    <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
                    <div className="p-8 sm:p-12 border-b border-border/10 bg-muted/10 relative">
                        <DialogHeader>
                            <div className="flex flex-wrap items-center gap-3 text-muted-foreground mb-6">
                                <div className="flex items-center gap-2 bg-background/80 backdrop-blur-sm px-4 py-2 rounded-full border border-border/40 shadow-sm">
                                    <CalendarIcon className="h-3.5 w-3.5 text-primary" />
                                    <span className="text-sm font-semibold uppercase tracking-wider">
                                        {selectedEntry && format(new Date(selectedEntry.createdAt), 'MMMM do, yyyy')}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 bg-background/80 backdrop-blur-sm px-4 py-2 rounded-full border border-border/40 shadow-sm">
                                    <History className="h-3.5 w-3.5 text-primary" />
                                    <span className="text-sm font-semibold uppercase tracking-wider">
                                        {selectedEntry && format(new Date(selectedEntry.createdAt), 'h:mm a')}
                                    </span>
                                </div>
                            </div>
                            <DialogTitle className="text-4xl sm:text-5xl md:text-6xl font-serif font-semibold tracking-tight text-foreground leading-tight">
                                {selectedEntry?.title || "Untitled Session"}
                            </DialogTitle>
                        </DialogHeader>
                    </div>
                    <ScrollArea className="p-8 sm:p-12 max-h-128 relative">
                        <div className="font-sans text-base sm:text-2xl leading-[1.8] text-foreground/90 whitespace-pre-wrap max-w-3xl">
                            {selectedEntry?.content || <span className="italic opacity-50 font-serif">This entry has no content.</span>}
                        </div>
                    </ScrollArea>
                </DialogContent>
            </Dialog>
        </div>
    )
}
