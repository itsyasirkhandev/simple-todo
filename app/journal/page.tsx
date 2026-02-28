/*
 * File Name:     page.tsx
 * Description:   Thin orchestrator for the Daily Journal route.
 * Author:        Antigravity
 * Created Date:  2026-02-28
 */

import dynamic from "next/dynamic";

const JournalView = dynamic(() => import("@/features/journal").then((mod) => mod.JournalView), {
    ssr: true,
});

/**
 * The journal page route (/journal).
 * Uses dynamic loading for better initial bundle performance.
 * @returns {JSX.Element} The rendered journal page.
 */
export default function JournalPage() {
    return <JournalView />;
}
