/*
 * File Name:     forbidden.tsx
 * Description:   Global 403 Forbidden page for Next.js App Router.
 * Author:        Antigravity
 * Created Date:  2026-02-27
 */

import dynamic from 'next/dynamic';

const ForbiddenView = dynamic(() =>
    import('@/features/auth').then((mod) => mod.ForbiddenView)
);

export const metadata = {
    title: 'Forbidden',
    description: 'You do not have permission to access this page.',
};

export default function ForbiddenPage() {
    return <ForbiddenView />;
}
