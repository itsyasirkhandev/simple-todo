/*
 * File Name:     unauthorized.tsx
 * Description:   Global 401 Unauthorized page for Next.js App Router.
 * Author:        Antigravity
 * Created Date:  2026-02-27
 */

import dynamic from 'next/dynamic';

const UnauthorizedView = dynamic(() =>
    import('@/features/auth').then((mod) => mod.UnauthorizedView)
);

export const metadata = {
    title: 'Unauthorized',
    description: 'You must be logged in to access this page.',
};

export default function UnauthorizedPage() {
    return <UnauthorizedView />;
}
