/*
 * File Name:     error.tsx
 * Description:   Global error page for Next.js App Router handling runtime errors.
 * Author:        Antigravity
 * Created Date:  2026-02-27
 */

'use client';

import { useEffect } from 'react';
import { AlertCircle, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ErrorPage({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log error to console, or to observability service in production
        console.error('Global application error:', error);
    }, [error]);

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 text-center">
            <div className="relative mb-8 flex items-center justify-center">
                <div className="absolute h-32 w-32 animate-pulse rounded-full bg-destructive/20 blur-3xl"></div>
                <AlertCircle className="text-destructive relative z-10 h-24 w-24 drop-shadow-md" strokeWidth={1.5} />
            </div>

            <h1 className="text-foreground mb-4 text-4xl font-extrabold tracking-tight sm:text-5xl">
                Something went wrong!
            </h1>

            <p className="text-muted-foreground mb-10 max-w-md text-base leading-relaxed sm:text-lg">
                An unexpected error occurred. We have been notified and are looking into it. Please try again or return later.
            </p>

            <Button onClick={() => reset()} size="lg" className="gap-2 transition-transform hover:scale-105">
                <RotateCcw className="h-4 w-4" />
                Try Again
            </Button>
        </div>
    );
}
