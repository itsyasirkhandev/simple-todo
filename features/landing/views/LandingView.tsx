/*
 * File Name:     LandingView.tsx
 * Description:   The main view component for the landing page.
 * Author:        Antigravity
 * Created Date:  2026-02-27
 */

"use client";

import { useRef } from "react";
import { Hero } from "../components/Hero";
import { useLandingAnimation } from "../hooks/useLandingAnimation";

export default function LandingView() {
    const containerRef = useRef<HTMLDivElement>(null);

    // Initialize landing animations
    useLandingAnimation(containerRef);

    return (
        <div ref={containerRef} className="relative h-screen w-full overflow-hidden bg-background selection:bg-primary/20">
            <main className="h-full w-full">
                <Hero />
            </main>

            <footer className="absolute bottom-6 w-full text-center">
                <p className="text-xs text-muted-foreground/60">
                    © 2026 Next.js Frontend Template • Designed for Excellence
                </p>
            </footer>
        </div>
    );
}
