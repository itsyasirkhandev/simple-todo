import dynamic from 'next/dynamic';

const JournalDetailView = dynamic(
    () => import('@/features/journal').then((mod) => mod.JournalDetailView),
    { ssr: false } // Client-side rendering since data is in localStorage
);

interface JournalDetailPageProps {
    params: Promise<{
        id: string;
    }>;
}

export default async function JournalDetailPage({ params }: JournalDetailPageProps) {
    // Await params if using Next.js 15+ patterns, though here it might just be sync depending on the exact Next.js version.
    // However in modern Next.js 15 `params` is a Promise. Let's await it.
    const resolvedParams = await params;

    return <JournalDetailView id={resolvedParams.id} />;
}
