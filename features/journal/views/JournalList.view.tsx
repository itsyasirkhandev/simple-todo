"use client"

import React, { useRef, useState } from 'react'
import { Calendar as CalendarIcon, History, Plus, FileText, ChevronRight } from 'lucide-react'
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
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Trash2 } from 'lucide-react'
import Link from 'next/link'

/**
 * Journal List View — industrial-editorial redesign.
 * Masonry column card layout, dramatic month headers, AlertDialog delete,
 * refined reading dialog, animated FAB.
 */
export const JournalListView = () => {
    const { entries, isLoaded, deleteEntry } = useJournal()
    const containerRef = useRef<HTMLDivElement>(null)
    const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null)

    useJournalListAnimations(containerRef)

    if (!isLoaded) return null

    // Group entries by month-year
    const groupedEntries = entries.reduce((acc, entry) => {
        const dateKey = format(new Date(`${entry.date}T00:00:00`), 'MMMM yyyy')
        if (!acc[dateKey]) acc[dateKey] = []
        acc[dateKey].push(entry)
        return acc
    }, {} as Record<string, typeof entries>)

    return (
        <div ref={containerRef} className="min-h-screen bg-background text-foreground selection:bg-primary/25 selection:text-foreground p-4 sm:p-8 md:p-12 pt-28 sm:pt-32 md:pt-40 relative">
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

            <main className="max-w-6xl mx-auto space-y-16 relative z-10 w-full">

                {/* Editorial page header */}
                <div className="anim-list-header space-y-3">
                    <p className="label-mono text-primary">Archive</p>
                    <h1 className="display-serif text-5xl sm:text-6xl md:text-7xl text-foreground">
                        Your{' '}
                        <em className="not-italic font-normal text-muted-foreground/60 italic">
                            Journals
                        </em>
                    </h1>
                    <div className="rule-x mt-3" />
                </div>

                {entries.length === 0 ? (
                    <div className="anim-list-header flex flex-col items-center justify-center py-32 text-center space-y-6">
                        <div className="h-20 w-20 rounded-full bg-primary/8 border border-primary/20 flex items-center justify-center">
                            <FileText className="h-8 w-8 text-primary/40" />
                        </div>
                        <div className="space-y-2">
                            <h2 className="text-2xl font-serif font-semibold text-foreground/80">The page is blank.</h2>
                            <p className="text-muted-foreground font-sans text-sm max-w-xs mx-auto leading-relaxed">
                                You haven&apos;t chronicled any thoughts yet. Start your journey of self-reflection today.
                            </p>
                        </div>
                        <Link href="/journal/create">
                            <Button className="mt-2 px-8 py-5 rounded-full font-semibold shadow-lg shadow-primary/20 transition-all duration-300 hover:scale-105">
                                <Plus className="mr-2 h-4 w-4" /> Write First Entry
                            </Button>
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-20">
                        {Object.entries(groupedEntries).map(([monthYear, monthEntries]) => {
                            const [month, year] = monthYear.split(' ')
                            return (
                                <section key={monthYear} className="space-y-8">
                                    {/* Full editorial month header */}
                                    <div className="anim-list-header flex items-end gap-4 pb-4 border-b border-border/30">
                                        <h2 className="display-serif text-4xl sm:text-5xl text-foreground leading-none">
                                            {month}
                                        </h2>
                                        <span className="font-mono text-lg text-muted-foreground/40 mb-1 tracking-wide">{year}</span>
                                        <span className="font-mono text-xs text-muted-foreground/40 mb-1.5 tracking-widest ml-auto">
                                            {monthEntries.length} {monthEntries.length === 1 ? 'entry' : 'entries'}
                                        </span>
                                    </div>

                                    {/* Masonry column layout — cards breathe to natural height */}
                                    <div className="columns-1 md:columns-2 lg:columns-3 gap-6 sm:gap-8 space-y-6">
                                        {monthEntries.map((entry) => (
                                            <div key={entry.id} className="anim-list-card break-inside-avoid mb-6">
                                                <JournalCard
                                                    entry={entry}
                                                    onClick={() => setSelectedEntry(entry)}
                                                    onDelete={() => deleteEntry(entry.id)}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            )
                        })}
                    </div>
                )}
            </main>

            {/* FAB */}
            {entries.length > 0 && (
                <div className="anim-list-fab fixed bottom-8 right-8 z-40">
                    <Link href="/journal/create">
                        <Button
                            size="icon"
                            className="h-14 w-14 rounded-full shadow-[0_8px_30px_-5px_hsl(var(--primary)/0.5)] hover:shadow-[0_12px_40px_-5px_hsl(var(--primary)/0.7)] transition-all duration-300 hover:scale-110 active:scale-95 bg-primary text-primary-foreground"
                        >
                            <Plus className="h-5 w-5" />
                        </Button>
                    </Link>
                </div>
            )}

            {/* Reading Dialog */}
            <Dialog open={!!selectedEntry} onOpenChange={(open) => !open && setSelectedEntry(null)}>
                <DialogContent className="sm:max-w-2xl lg:max-w-3xl max-h-[90vh] p-0 overflow-hidden bg-background/98 backdrop-blur-2xl border-border/50">
                    <div className="p-6 sm:p-10 border-b border-border/15 bg-muted/5 relative overflow-hidden">
                        {/* Large decorative quotation mark */}
                        <div className="absolute -top-6 -left-4 font-serif text-[9rem] text-primary/5 pointer-events-none select-none leading-none">&ldquo;</div>

                        <DialogHeader className="relative z-10">
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
                            <DialogTitle className="display-serif text-3xl sm:text-4xl md:text-5xl text-foreground leading-[1.1]">
                                {selectedEntry?.title || "Untitled Session"}
                            </DialogTitle>
                        </DialogHeader>
                    </div>
                    <ScrollArea className="max-h-[60vh]">
                        <div className="p-6 sm:p-10 border-l-4 border-primary/15 ml-6 sm:ml-10 mr-6 sm:mr-10 my-6">
                            <p className="font-serif text-base sm:text-lg leading-[1.9] text-foreground/85 whitespace-pre-wrap">
                                {selectedEntry?.content || <span className="italic opacity-40">This entry has no content.</span>}
                            </p>
                        </div>
                    </ScrollArea>
                </DialogContent>
            </Dialog>
        </div>
    )
}

/* ─── Journal Card sub-component ─── */
interface JournalCardProps {
    entry: JournalEntry
    onClick: () => void
    onDelete: () => void
}

const JournalCard = ({ entry, onClick, onDelete }: JournalCardProps) => (
    <div className="group relative text-left bg-card hover:bg-card/90 backdrop-blur-xl border border-border/50 rounded-2xl transition-all duration-500 ease-out hover:-translate-y-1 hover:shadow-lg hover:border-primary/30 overflow-hidden">
        {/* Hover gradient glow */}
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-primary/10 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

        {/* Card header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3 text-muted-foreground relative z-10">
            <span className="font-mono text-[10px] tracking-widest uppercase group-hover:text-primary transition-colors duration-300">
                {format(new Date(entry.createdAt), 'MMM do')}
            </span>

            <div className="flex items-center gap-2">
                {/* Delete with AlertDialog */}
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <button
                            onClick={(e) => e.stopPropagation()}
                            className="p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-destructive/10 text-muted-foreground/50 hover:text-destructive focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-destructive/50"
                            title="Delete Entry"
                        >
                            <Trash2 className="h-3.5 w-3.5" />
                        </button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle className="font-serif">Delete this journal entry?</AlertDialogTitle>
                            <AlertDialogDescription className="font-sans text-sm text-muted-foreground">
                                This action cannot be undone. The entry <strong>&ldquo;{entry.title || 'Untitled Session'}&rdquo;</strong> will be permanently removed.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel className="font-sans text-sm">Cancel</AlertDialogCancel>
                            <AlertDialogAction
                                onClick={onDelete}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90 font-sans text-sm"
                            >
                                Delete
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>

                <button
                    className="flex items-center gap-1 opacity-0 group-hover:opacity-100 -translate-x-1 group-hover:translate-x-0 transition-all duration-300 focus:opacity-100 focus:outline-none text-muted-foreground hover:text-primary"
                    onClick={onClick}
                >
                    <span className="font-mono text-[10px] tracking-wider uppercase">Read</span>
                    <ChevronRight className="h-3 w-3" />
                </button>
            </div>
        </div>

        {/* Card body — clickable */}
        <div
            className="px-5 pb-5 cursor-pointer flex flex-col gap-3"
            onClick={onClick}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onClick() }}
        >
            <h3 className="font-serif font-semibold text-xl leading-snug text-foreground line-clamp-2">
                {entry.title || "Untitled Session"}
            </h3>

            {entry.content && (
                <p className="text-muted-foreground font-sans text-sm leading-relaxed line-clamp-3">
                    {entry.content}
                </p>
            )}

            <div className="flex items-center justify-between pt-2 border-t border-border/20 text-[10px] font-mono text-muted-foreground/50 tracking-wider">
                <span className="flex items-center gap-1.5">
                    <History className="h-3 w-3" />
                    {format(new Date(entry.createdAt), 'h:mm a')}
                </span>
                <span className="uppercase">{entry.id.split('-')[0]}</span>
            </div>
        </div>
    </div>
)
