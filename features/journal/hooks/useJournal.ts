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

    const saveEntry = useCallback((date: string, content: string) => {
        setEntries((prev) => {
            const existingIndex = prev.findIndex((e) => e.date === date);
            const now = Date.now();

            if (existingIndex !== -1) {
                const newEntries = [...prev];
                newEntries[existingIndex] = {
                    ...newEntries[existingIndex],
                    content,
                    updatedAt: now,
                };
                return newEntries;
            } else {
                const newEntry: JournalEntry = {
                    id: crypto.randomUUID(),
                    date,
                    content,
                    createdAt: now,
                    updatedAt: now,
                };
                return [newEntry, ...prev];
            }
        });
        toast.success(`Journal saved successfully.`);
    }, []);

    const getEntryByDate = useCallback((date: string) => {
        return entries.find((e) => e.date === date);
    }, [entries]);

    return {
        entries,
        isLoaded: isClient,
        saveEntry,
        getEntryByDate,
    };
};
