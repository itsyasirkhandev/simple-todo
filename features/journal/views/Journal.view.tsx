/*
 * File Name:     Journal.view.tsx
 * Description:   Main view for the Daily Journal feature.
 * Author:        Antigravity
 * Created Date:  2026-02-28
 */

"use client"

import React, { useRef, useState } from 'react'
import { Book, Save, History, Calendar as CalendarIcon, Sparkles } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { useJournal } from '../hooks/useJournal'
import { useJournalAnimations } from '../hooks/useJournalAnimations'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'

/**
 * Editor sub-component for the Journal.
 * Uses a key from parent to reset state on date change without useEffect.
 */
const JournalEditor = ({
    initialContent,
    onSave
}: {
    initialContent: string;
    onSave: (content: string) => void;
}) => {
    const [content, setContent] = useState(initialContent);

    return (
        <div className="space-y-6">
            <Card className="bg-background/40 backdrop-blur-xl border-border/50 shadow-sm overflow-hidden group">
                <CardContent className="p-0">
                    <Textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="Write your thoughts..."
                        className="min-h-journal-editor sm:min-h-journal-editor-lg border-none focus-visible:ring-0 bg-transparent resize-none p-6 sm:p-10 text-base font-serif leading-relaxed placeholder:italic placeholder:text-muted-foreground/30 transition-all duration-500"
                    />
                </CardContent>
            </Card>

            <div className="flex justify-end">
                <Button
                    onClick={() => onSave(content)}
                    className="px-8 py-6 rounded-full text-base font-semibold transition-all duration-500 hover:scale-105 active:scale-95 shadow-lg shadow-primary/20"
                >
                    <Save className="mr-2 h-4 w-4" />
                    Save Entry
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
    const { entries, saveEntry, getEntryByDate, isLoaded } = useJournal()
    const containerRef = useRef<HTMLDivElement>(null)
    const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'))

    // Isolated Animation Logic
    useJournalAnimations(containerRef)

    if (!isLoaded) return null

    const currentEntry = getEntryByDate(selectedDate)

    return (
        <div ref={containerRef} className="min-h-screen bg-background text-foreground selection:bg-primary selection:text-primary-foreground p-4 sm:p-8 md:p-12 pt-28 sm:pt-32 md:pt-40 relative">
            {/* Background Texture Overlay */}
            <div className="fixed inset-0 pointer-events-none z-0 bg-background/50" />

            <main className="max-w-4xl mx-auto space-y-12 relative z-10">
                {/* Branding & Header */}
                <div className="anim-journal-header space-y-4 opacity-90">
                    <div className="flex items-center gap-2 text-primary">
                        <span className="text-sm font-semibold font-sans tracking-tight uppercase">Daily Reflection</span>
                        <Sparkles className="h-4 w-4" />
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                        <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif font-semibold tracking-tighter text-foreground">
                            Journal <span className="text-muted-foreground font-sans text-base sm:text-2xl md:text-3xl">/ {format(new Date(`${selectedDate}T00:00:00`), 'MMMM do')}</span>
                        </h1>
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <CalendarIcon className="h-4 w-4" />
                            <span className="text-sm font-sans">{selectedDate}</span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Editor Section - Keyed to reset on date change */}
                    <div className="lg:col-span-2 anim-journal-editor">
                        <JournalEditor
                            key={selectedDate}
                            initialContent={currentEntry?.content || ''}
                            onSave={(content) => saveEntry(selectedDate, content)}
                        />
                    </div>

                    {/* Sidebar / History Section */}
                    <aside className="space-y-6">
                        <div className="anim-journal-header flex items-center gap-2 px-2">
                            <History className="h-4 w-4 text-primary" />
                            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Recent Entries</h2>
                        </div>

                        <div className="space-y-4">
                            {entries.length === 0 ? (
                                <p className="text-sm text-muted-foreground px-2 italic">No entries yet. Start writing your story today.</p>
                            ) : (
                                entries.slice(0, 5).map((entry) => (
                                    <button
                                        key={entry.id}
                                        onClick={() => setSelectedDate(entry.date)}
                                        className={cn(
                                            "anim-journal-item w-full text-left p-4 rounded-2xl border transition-all duration-300 group hover:shadow-md",
                                            selectedDate === entry.date
                                                ? "bg-foreground text-background border-transparent"
                                                : "bg-background/40 border-border/50 hover:border-primary/50 text-foreground"
                                        )}
                                    >
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="text-xs font-semibold uppercase tracking-tighter opacity-70">
                                                {format(new Date(`${entry.date}T00:00:00`), 'EEE, MMM do')}
                                            </span>
                                            {selectedDate === entry.date && <Book className="h-3 w-3 text-primary animate-pulse" />}
                                        </div>
                                        <p className="text-sm line-clamp-2 opacity-80 font-serif">
                                            {entry.content || "Empty entry"}
                                        </p>
                                    </button>
                                ))
                            )}
                        </div>
                    </aside>
                </div>
            </main>
        </div>
    )
}
