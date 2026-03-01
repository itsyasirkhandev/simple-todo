/*
 * File Name:     Hero.tsx
 * Description:   Premium landing page hero section.
 * Author:        Antigravity
 * Created Date:  2026-02-27
 */

import { Button } from "@/components/ui/button";
import { TechStack } from "./TechStack";

export function Hero() {
    return (
        <section className="anim-hero-container relative flex h-full w-full flex-col items-center justify-center overflow-hidden px-6 text-center">
            <div className="anim-hero-content relative z-10 mx-auto max-w-4xl space-y-10">
                <div className="space-y-4">
                    <h1 className="anim-hero-title text-balance text-6xl font-semibold tracking-tighter text-foreground sm:text-8xl">
                        Streamlined <br />
                        <span className="text-primary">Next.js 16</span> Excellence
                    </h1>

                    <p className="anim-hero-subtitle mx-auto max-w-xl text-balance text-base font-normal text-muted-foreground/80 sm:text-2xl">
                        A minimalist starting point for enterprise-grade applications.
                        React 19 + Tailwind v4 + GSAP.
                    </p>
                </div>

                <TechStack />

                <div className="anim-hero-ctas flex flex-col items-center justify-center gap-4 pt-4 sm:flex-row">
                    <Button size="lg" className="h-12 rounded-full px-8 text-base font-semibold transition-transform hover:scale-105 active:scale-95">
                        Get Started
                    </Button>
                    <Button size="lg" variant="outline" className="h-12 rounded-full px-8 text-base font-semibold backdrop-blur-sm transition-transform hover:scale-105 active:scale-95">
                        Documentation
                    </Button>
                </div>
            </div>

            {/* Decorative Blur Elements */}
            <div className="anim-hero-blob absolute top-[40%] left-1/2 -z-10 h-128 w-128 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/5 blur-3xl" />
            <div className="anim-hero-blob absolute bottom-0 right-0 -z-10 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
        </section>
    );
}
