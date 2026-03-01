/*
 * File Name:     UnauthorizedView.tsx
 * Description:   View component for the 401 Unauthorized page.
 * Author:        Antigravity
 * Created Date:  2026-02-27
 */

'use client';

import Link from 'next/link';
import { ShieldX, LogIn, ArrowLeft } from 'lucide-react';

import { ROUTES } from '@/constants/routes';
import { Button } from '@/components/ui/button';

export function UnauthorizedView() {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 text-center">
            <div className="relative mb-8 flex items-center justify-center">
                <div className="absolute h-32 w-32 animate-pulse rounded-full bg-destructive/20 blur-3xl"></div>
                <ShieldX className="text-destructive relative z-10 h-24 w-24 drop-shadow-md" strokeWidth={1.5} />
            </div>

            <h1 className="text-foreground mb-4 text-5xl font-semibold tracking-tight sm:text-6xl">
                401
            </h1>

            <h2 className="text-foreground mb-6 text-2xl font-semibold tracking-tight sm:text-3xl">
                Unauthorized Access
            </h2>

            <p className="text-muted-foreground mb-10 max-w-md text-base leading-relaxed">
                You must be logged in to access this page. Please sign in with your credentials to continue.
            </p>

            <div className="flex flex-col gap-4 sm:flex-row">
                <Button asChild size="lg" className="gap-2 shadow-lg transition-transform hover:scale-105">
                    <Link href={ROUTES.AUTH?.LOGIN || ROUTES.HOME}>
                        <LogIn className="h-4 w-4" />
                        Sign In
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
