/*
 * File Name:     useJournalListAnimations.ts
 * Description:   GSAP animation logic for the Journal list view.
 * Author:        Antigravity
 * Created Date:  2026-02-28
 */

import { useGSAP, gsap } from "@/lib/gsapConfig";
import { RefObject } from "react";
import { DURATION, EASE, STAGGER, BREAKPOINTS } from "@/constants/animationTokens";

/**
 * Hook for managing Journal list entrance and staggered animations.
 * Implements View Isolation and accessibility-first motion reduction.
 * 
 * @param {RefObject<HTMLDivElement | null>} containerRef - The container ref for GSAP scoping.
 * @returns {void}
 */
export const useJournalListAnimations = (containerRef: RefObject<HTMLDivElement | null>) => {
    useGSAP(() => {
        if (!containerRef.current) return;

        const mm = gsap.matchMedia();

        // 1. Reduced motion FIRST (Mandatory)
        mm.add(BREAKPOINTS.reduced, () => {
            gsap.set(".anim-list-header, .anim-list-card, .anim-list-fab", {
                autoAlpha: 1,
                y: 0,
                scale: 1,
                clearProps: "all"
            });
            return () => gsap.set(".anim-list-header, .anim-list-card, .anim-list-fab", { clearProps: "all" });
        });

        // 2. Standard Animations
        mm.add("(prefers-reduced-motion: no-preference)", () => {
            const tl = gsap.timeline();

            tl.from(".anim-list-header", {
                autoAlpha: 0,
                y: 30,
                duration: DURATION.slow,
                ease: EASE.strong
            })
                .from(".anim-list-card", {
                    autoAlpha: 0,
                    y: 40,
                    stagger: STAGGER.fast,
                    duration: DURATION.normal,
                    ease: EASE.default
                }, "-=0.6")
                .from(".anim-list-fab", {
                    autoAlpha: 0,
                    scale: 0.8,
                    duration: DURATION.normal,
                    ease: EASE.default
                }, "-=0.4");

            return () => {
                tl.kill();
                gsap.set(".anim-list-header, .anim-list-card, .anim-list-fab", { clearProps: "all" });
            };
        });
    }, { scope: containerRef });
};
