/*
 * File Name:     not-found.tsx
 * Description:   Global 404 Not Found page for Next.js App Router.
 * Author:        Antigravity
 * Created Date:  2026-02-27
 */

import dynamic from 'next/dynamic';

const NotFoundView = dynamic(() =>
    import('@/features/core').then((mod) => mod.NotFoundView)
);

export const metadata = {
    title: 'Page Not Found',
    description: 'The requested page could not be found.',
};

export default function NotFoundPage() {
    return <NotFoundView />;
}
