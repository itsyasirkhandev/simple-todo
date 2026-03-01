/*
 * File Name:     page.tsx
 * Description:   Thin orchestrator for the Daily Journal route.
 * Author:        Antigravity
 * Created Date:  2026-02-28
 */

import dynamic from "next/dynamic";

const JournalListView = dynamic(() => import("@/features/journal").then((mod) => mod.JournalListView), {
    ssr: true,
});

/**
 * The journal list page route (/journal).
 * Uses dynamic loading for better initial bundle performance.
 * @returns {JSX.Element} The rendered journal list page.
 */
export default function JournalPage() {
    return <JournalListView />;
}
