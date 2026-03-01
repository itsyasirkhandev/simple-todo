/*
 * File Name:     page.tsx
 * Description:   Orchestrator for creating new Journal entries.
 * Author:        Antigravity
 * Created Date:  2026-03-01
 */

import dynamic from "next/dynamic";

const JournalView = dynamic(() => import("@/features/journal").then((mod) => mod.JournalView), {
    ssr: true,
});

/**
 * The journal create page route (/journal/create).
 * Uses dynamic loading for better initial bundle performance.
 * @returns {JSX.Element} The rendered journal editor page.
 */
export default function JournalCreatePage() {
    return <JournalView />;
}
