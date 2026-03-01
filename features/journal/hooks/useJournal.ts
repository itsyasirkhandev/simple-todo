/*
 * File Name:     useJournal.ts
 * Description:   Hook for managing daily journal entries with LocalStorage persistence.
 * Author:        Antigravity
 * Created Date:  2026-02-28
 */

"use client"

import { useState, useEffect, useCallback, useSyncExternalStore } from 'react';
import { toast } from 'sonner';
import { JournalEntry } from '../types/journal.types';

const STORAGE_KEY = 'daily-journal-entries';

const emptySubscribe = () => () => { };

/**
 * Hook to manage journal entries.
 * Persists data to localStorage and provides methods to get/save daily entries.
 * @returns {object} { entries, isLoaded, saveEntry, getEntryByDate }
 */
export const useJournal = () => {
    const isClient = useSyncExternalStore(
        emptySubscribe,
        () => true,
        () => false
    );

    const [entries, setEntries] = useState<JournalEntry[]>(() => {
        if (typeof window !== 'undefined') {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                try {
                    return JSON.parse(stored);
                } catch (e) {
                    console.error('Failed to parse journal entries', e);
                }
            }
        }
        return [];
    });

    useEffect(() => {
        if (isClient) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
        }
    }, [entries, isClient]);

    const saveEntry = useCallback((title: string, content: string) => {
        if (!title.trim() && !content.trim()) {
            toast.error("Journal entry needs a title or content");
            return;
        }

        setEntries((prev) => {
            const now = Date.now();
            const dateStr = new Date(now).toISOString().split('T')[0];

            const newEntry: JournalEntry = {
                id: crypto.randomUUID(),
                title: title.trim() || 'Untitled Session',
                date: dateStr,
                content,
                createdAt: now,
                updatedAt: now,
            };
            return [newEntry, ...prev];
        });
        toast.success(`Journal entry saved.`);
    }, []);

    return {
        entries,
        isLoaded: isClient,
        saveEntry,
    };
};
