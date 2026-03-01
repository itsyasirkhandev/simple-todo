/*
 * File Name:     ForbiddenView.tsx
 * Description:   View component for the 403 Forbidden page.
 * Author:        Antigravity
 * Created Date:  2026-02-27
 */

'use client';

import Link from 'next/link';
import { Ban, Home, ArrowLeft } from 'lucide-react';

import { ROUTES } from '@/constants/routes';
import { Button } from '@/components/ui/button';

export function ForbiddenView() {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 text-center">
            <div className="relative mb-8 flex items-center justify-center">
                <div className="absolute h-32 w-32 animate-pulse rounded-full bg-destructive/20 blur-3xl"></div>
                <Ban className="text-destructive relative z-10 h-24 w-24 drop-shadow-md" strokeWidth={1.5} />
            </div>

            <h1 className="text-foreground mb-4 text-5xl font-semibold tracking-tight sm:text-6xl">
                403
            </h1>

            <h2 className="text-foreground mb-6 text-2xl font-semibold tracking-tight sm:text-3xl">
                Access Denied
            </h2>

            <p className="text-muted-foreground mb-10 max-w-md text-base leading-relaxed">
                You do not have the required permissions to view this content or perform this action.
            </p>

            <div className="flex flex-col gap-4 sm:flex-row">
                <Button asChild size="lg" className="gap-2 shadow-lg transition-transform hover:scale-105">
                    <Link href={ROUTES.HOME}>
                        <Home className="h-4 w-4" />
                        Back to Home
                    </Link>
                </Button>
                <Button onClick={() => window.history.back()} variant="outline" size="lg" className="gap-2 transition-transform hover:scale-105">
                    <ArrowLeft className="h-4 w-4" />
                    Go Back
                </Button>
            </div>
        </div>
    );
}
