"use client"

import React, { useRef, useState } from 'react'
import { Calendar as CalendarIcon, History, Plus, FileText, ChevronRight, Trash2 } from 'lucide-react'
import { useJournal } from '../hooks/useJournal'
import { useJournalListAnimations } from '../hooks/useJournalListAnimations'
import { format } from 'date-fns'
import { JournalEntry } from '../types/journal.types'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import Link from 'next/link'

/**
 * Journal List View component.
 * Displays all created journals organized by date in a premium layout.
 * 
 * @returns {JSX.Element} The rendered journal list page.
 */
export const JournalListView = () => {
    const { entries, isLoaded, deleteEntry } = useJournal()
    const containerRef = useRef<HTMLDivElement>(null)
    const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);

    // Isolated Animation Logic
    useJournalListAnimations(containerRef)

    if (!isLoaded) return null

    // Group entries by month-year for a more organized editorial look
    const groupedEntries = entries.reduce((acc, entry) => {
        const dateKey = format(new Date(`${entry.date}T00:00:00`), 'MMMM yyyy');
        if (!acc[dateKey]) acc[dateKey] = [];
        acc[dateKey].push(entry);
        return acc;
    }, {} as Record<string, typeof entries>);

    return (
        <div ref={containerRef} className="min-h-screen bg-background text-foreground selection:bg-primary selection:text-primary-foreground p-4 sm:p-8 md:p-12 pt-28 sm:pt-32 md:pt-40 relative">
            {/* Background Texture Overlay */}
            <div className="fixed inset-0 pointer-events-none z-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-primary/5 via-background to-background" />

            <main className="max-w-6xl mx-auto space-y-16 relative z-10 w-full">


                {entries.length === 0 ? (
                    <div className="anim-list-header flex flex-col items-center justify-center py-32 text-center space-y-6">
                        <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center">
                            <FileText className="h-10 w-10 text-primary opacity-50" />
                        </div>
                        <div className="space-y-2">
                            <h2 className="text-2xl font-serif font-semibold">The page is blank</h2>
                            <p className="text-muted-foreground max-w-sm mx-auto">You haven&apos;t chronicled any thoughts yet. Start your journey of self-reflection today.</p>
                        </div>
                        <Link href="/journal/create">
                            <Button className="mt-4 px-8 py-6 rounded-full text-base font-semibold shadow-lg shadow-primary/20 transition-all duration-500 hover:scale-105">
                                <Plus className="mr-2 h-5 w-5" /> Write First Entry
                            </Button>
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-20">
                        {Object.entries(groupedEntries).map(([monthYear, monthEntries]) => (
                            <section key={monthYear} className="space-y-8">
                                <div className="anim-list-header flex items-center gap-4">
                                    <h2 className="text-2xl sm:text-3xl font-serif font-semibold tracking-tight text-foreground/80">{monthYear}</h2>
                                    <div className="h-px flex-1 bg-border/40" />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                                    {monthEntries.map((entry) => (
                                        <div key={entry.id} className="anim-list-card h-full">
                                            <div
                                                className="w-full group relative text-left bg-card hover:bg-card/80 backdrop-blur-xl border border-border rounded-3xl p-6 sm:p-8 transition-all duration-700 ease-out hover:-translate-y-2 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 overflow-hidden flex flex-col h-72"
                                            >
                                                {/* Decorative gradient blur in background of card */}
                                                <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/10 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

                                                <div className="flex items-center justify-between mb-6 text-muted-foreground w-full relative z-10 transition-colors duration-500 group-hover:text-primary">
                                                    <span className="text-xs font-semibold uppercase tracking-widest">
                                                        {format(new Date(entry.createdAt), 'MMM do')}
                                                    </span>
                                                    <div className="flex items-center gap-4">
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                if (window.confirm("Are you sure you want to delete this journal entry?")) {
                                                                    deleteEntry(entry.id);
                                                                }
                                                            }}
                                                            className="p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-500 hover:bg-destructive/10 text-muted-foreground hover:text-destructive focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-destructive/50"
                                                            title="Delete Entry"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </button>
                                                        <button
                                                            className="flex items-center gap-1.5 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-500 focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-primary/50 rounded"
                                                            onClick={() => setSelectedEntry(entry)}
                                                        >
                                                            <span className="text-xs font-semibold tracking-wider uppercase">Read</span>
                                                            <ChevronRight className="h-3 w-3" />
                                                        </button>
                                                    </div>
                                                </div>

                                                <div
                                                    className="flex-1 cursor-pointer flex flex-col"
                                                    onClick={() => setSelectedEntry(entry)}
                                                    role="button"
                                                    tabIndex={0}
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter' || e.key === ' ') {
                                                            setSelectedEntry(entry);
                                                        }
                                                    }}
                                                >
                                                    <h3 className="font-serif font-semibold text-2xl mb-4 leading-tight line-clamp-2 relative z-10 text-foreground transition-colors duration-500">
                                                        {entry.title || "Untitled Session"}
                                                    </h3>

                                                    <p className="text-muted-foreground font-sans text-sm leading-relaxed line-clamp-4 relative z-10 flex-1">
                                                        {entry.content || <span className="italic">Observation without words...</span>}
                                                    </p>

                                                    <div className="mt-6 pt-4 border-t border-border/30 flex items-center justify-between text-xs text-muted-foreground relative z-10">
                                                        <div className="flex items-center gap-1.5">
                                                            <History className="h-3.5 w-3.5" />
                                                            <span>{format(new Date(entry.createdAt), 'h:mm a')}</span>
                                                        </div>
                                                        <span className="font-mono text-xs uppercase tracking-widest">{entry.id.split('-')[0]}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        ))}
                    </div>
                )}
            </main>

            {/* Floating Action Button for New Entry when we have journals */}
            {entries.length > 0 && (
                <div className="anim-list-fab fixed bottom-8 right-8 z-40">
                    <Link href="/journal/create">
                        <Button size="icon" className="h-16 w-16 rounded-full shadow-[0_8px_30px_-5px_hsl(var(--primary)/0.4)] hover:shadow-[0_12px_40px_-5px_hsl(var(--primary)/0.6)] transition-all duration-500 hover:scale-110 active:scale-95 bg-primary text-primary-foreground border border-primary/20 backdrop-blur-md">
                            <Plus className="h-6 w-6" />
                        </Button>
                    </Link>
                </div>
            )}

            {/* Reading Dialog */}
            <Dialog open={!!selectedEntry} onOpenChange={(open) => !open && setSelectedEntry(null)}>
                <DialogContent className="sm:max-w-2xl lg:max-w-3xl max-h-[85vh] p-0 overflow-hidden bg-background/95 backdrop-blur-xl border-border/50">
                    <div className="p-6 sm:p-8 md:p-12 border-b border-border/10 bg-muted/10 relative">
                        {/* Elegant typographic accent */}
                        <div className="absolute -top-10 -left-6 text-9xl font-serif text-primary/5 pointer-events-none select-none">“</div>

                        <DialogHeader className="relative z-10">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6 text-primary/60 mb-6">
                                <div className="flex items-center gap-2">
                                    <CalendarIcon className="h-4 w-4" />
                                    <span className="text-xs font-semibold tracking-widest uppercase">
                                        {selectedEntry && format(new Date(selectedEntry.createdAt), 'MMMM do, yyyy')}
                                    </span>
                                </div>
                                <div className="hidden sm:block opacity-30">•</div>
                                <div className="flex items-center gap-2">
                                    <History className="h-4 w-4" />
                                    <span className="text-xs font-semibold tracking-widest uppercase">
                                        {selectedEntry && format(new Date(selectedEntry.createdAt), 'h:mm a')}
                                    </span>
                                </div>
                            </div>
                            <DialogTitle className="text-3xl sm:text-4xl md:text-5xl font-serif font-semibold tracking-tight text-foreground leading-[1.1]">
                                {selectedEntry?.title || "Untitled Session"}
                            </DialogTitle>
                        </DialogHeader>
                    </div>
                    <ScrollArea className="p-6 sm:p-8 md:p-12 max-h-[55vh]">
                        <div className="font-serif text-base sm:text-2xl leading-[1.8] text-foreground/80 whitespace-pre-wrap max-w-prose mx-auto pb-8">
                            {selectedEntry?.content || <span className="italic opacity-50">This entry has no content.</span>}
                        </div>
                    </ScrollArea>
                </DialogContent>
            </Dialog>
        </div>
    )
}
