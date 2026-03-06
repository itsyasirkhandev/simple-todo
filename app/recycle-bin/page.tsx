import dynamic from "next/dynamic";
import { Suspense } from "react";
import type { Metadata } from "next";

const RecycleBin = dynamic(
    () =>
        import("@/features/todos/views/RecycleBin.view").then(
            (mod) => mod.RecycleBin
        ),
    { ssr: true }
);

export const metadata: Metadata = {
    title: "Recycle Bin — Deleted Tasks",
    description:
        "View, restore, or permanently delete your removed tasks from the recycle bin.",
};

export default function RecycleBinPage() {
    return (
        <Suspense fallback={null}>
            <RecycleBin />
        </Suspense>
    );
}
