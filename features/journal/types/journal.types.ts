/*
 * File Name:     journal.types.ts
 * Description:   Type definitions for the Journal feature.
 * Author:        Antigravity
 * Created Date:  2026-02-28
 */

/**
 * Represents a single daily journal entry.
 * @interface JournalEntry
 * @property {string} id - Unique identifier for the entry.
 * @property {string} date - The date of the entry in YYYY-MM-DD format.
 * @property {string} content - The markdown or plain text content of the journal.
 * @property {number} createdAt - Timestamp of when the entry was created.
 * @property {number} updatedAt - Timestamp of the last update.
 */
export interface JournalEntry {
    id: string;
    title: string;
    date: string;
    content: string;
    createdAt: number;
    updatedAt: number;
}
