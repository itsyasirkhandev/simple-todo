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

/**
 * Editor sub-component for the Journal.
 * Uses a key from parent to reset state on date change without useEffect.
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
        <div className="space-y-6">
            <Card className="bg-background/40 backdrop-blur-xl border-border/50 shadow-sm overflow-hidden group">
                <CardContent className="p-0 flex flex-col">
                    <Input
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Journal Title (Optional)"
                        className="border-0 border-b border-border/50 rounded-none focus-visible:ring-0 focus-visible:border-primary/50 bg-transparent px-6 sm:px-10 py-6 sm:py-8 text-xl sm:text-2xl font-serif font-semibold transition-all duration-300 placeholder:text-muted-foreground/40"
                    />
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
                    onClick={handleSave}
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
                            Journal <span className="text-muted-foreground font-sans text-base sm:text-2xl md:text-3xl">/ {format(new Date(), 'MMMM do')}</span>
                        </h1>
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <CalendarIcon className="h-4 w-4" />
                            <span className="text-sm font-sans">{format(new Date(), 'yyyy-MM-dd')}</span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Editor Section */}
                    <div className="lg:col-span-2 anim-journal-editor">
                        <JournalEditor
                            onSave={(title, content) => saveEntry(title, content)}
                        />
                    </div>

                    {/* Sidebar / History Section */}
                    <aside className="space-y-6">
                        <div className="anim-journal-header flex items-center gap-2 px-2">
                            <History className="h-4 w-4 text-primary" />
                            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">All Entries</h2>
                        </div>

                        <div className="space-y-6 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                            {Object.keys(groupedEntries).length === 0 ? (
                                <p className="text-sm text-muted-foreground px-2 italic">No entries yet. Start writing your story today.</p>
                            ) : (
                                Object.entries(groupedEntries).map(([date, dayEntries]) => (
                                    <div key={date} className="space-y-3">
                                        <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground px-2 sticky top-0 bg-background/80 backdrop-blur-sm py-1 z-10">
                                            {format(new Date(`${date}T00:00:00`), 'MMMM do, yyyy')}
                                        </h3>
                                        <div className="space-y-2">
                                            {dayEntries.map((entry) => (
                                                <button
                                                    key={entry.id}
                                                    onClick={() => setSelectedEntry(entry)}
                                                    className="anim-journal-item w-full text-left p-4 rounded-2xl border transition-all duration-300 bg-background/40 border-border/50 hover:border-primary/50 text-foreground group hover:shadow-md block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                                                >
                                                    <div className="flex items-center justify-between mb-2">
                                                        <span className="text-xs font-semibold uppercase tracking-tighter opacity-70">
                                                            {format(new Date(entry.createdAt), 'h:mm a')}
                                                        </span>
                                                        <Book className="h-3 w-3 text-muted-foreground opacity-50 transition-opacity group-hover:opacity-100 group-hover:text-primary" />
                                                    </div>
                                                    <h4 className="font-serif font-semibold text-base mb-1 truncate">{entry.title || "Untitled Session"}</h4>
                                                    <p className="text-sm opacity-70 font-sans line-clamp-2">
                                                        {entry.content || "Empty entry"}
                                                    </p>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </aside>
                </div>
            </main>

            <Dialog open={!!selectedEntry} onOpenChange={(open) => !open && setSelectedEntry(null)}>
                <DialogContent className="sm:max-w-2xl lg:max-w-3xl max-h-[85vh] p-0 overflow-hidden bg-background/95 backdrop-blur-xl border-border/50">
                    <div className="p-6 sm:p-8 border-b border-border/10 bg-muted/20">
                        <DialogHeader>
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-muted-foreground mb-4">
                                <div className="flex items-center gap-2">
                                    <CalendarIcon className="h-4 w-4 text-primary" />
                                    <span className="text-sm font-sans tracking-tight">
                                        {selectedEntry && format(new Date(selectedEntry.createdAt), 'MMMM do, yyyy')}
                                    </span>
                                </div>
                                <div className="hidden sm:block text-muted-foreground/30">•</div>
                                <div className="flex items-center gap-2">
                                    <History className="h-4 w-4 text-primary" />
                                    <span className="text-sm font-sans tracking-tight">
                                        {selectedEntry && format(new Date(selectedEntry.createdAt), 'h:mm a')}
                                    </span>
                                </div>
                            </div>
                            <DialogTitle className="text-2xl sm:text-3xl md:text-4xl font-serif font-semibold tracking-tight text-foreground leading-tight">
                                {selectedEntry?.title || "Untitled Session"}
                            </DialogTitle>
                        </DialogHeader>
                    </div>
                    <ScrollArea className="p-6 sm:p-8 md:p-10 max-h-[60vh]">
                        <div className="font-serif text-base sm:text-lg leading-relaxed text-foreground/90 whitespace-pre-wrap">
                            {selectedEntry?.content || <span className="italic opacity-50">This entry has no content.</span>}
                        </div>
                    </ScrollArea>
                </DialogContent>
            </Dialog>
        </div>
    )
}
