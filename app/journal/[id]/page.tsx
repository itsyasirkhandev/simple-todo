import { JournalDetailView } from '@/features/journal';

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
