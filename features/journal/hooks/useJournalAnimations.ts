/*
 * File Name:     useJournalAnimations.ts
 * Description:   Animation logic for the Journal view using GSAP.
 * Author:        Antigravity
 * Created Date:  2026-02-28
 */

"use client"

import { useGSAP, gsap } from "@/lib/gsapConfig";
import { RefObject } from "react";
import { DURATION, EASE, STAGGER, BREAKPOINTS } from "@/constants/animationTokens";

/**
 * Custom hook for Journal view animations.
 * Provides entry animations for the header, editor, and list.
 * 
 * @param {RefObject<HTMLDivElement | null>} containerRef - The ref to the container element.
 * @returns {void}
 */
export const useJournalAnimations = (containerRef: RefObject<HTMLDivElement | null>) => {
    useGSAP(() => {
        if (!containerRef.current) return;

        const mm = gsap.matchMedia();

        // 1. Reduced motion FIRST
        mm.add(BREAKPOINTS.reduced, () => {
            gsap.set(".anim-journal-header, .anim-journal-editor, .anim-journal-item", {
                autoAlpha: 1,
                y: 0
            });
            return () => {
                gsap.set(".anim-journal-header, .anim-journal-editor, .anim-journal-item", { clearProps: "all" });
            };
        });

        // 2. Standard breakpoints (Desktop & Mobile combined as the animation is the same)
        mm.add("(min-width: 0px)", () => {
            // Entry animations
            const tl = gsap.timeline();

            tl.from(".anim-journal-header", {
                autoAlpha: 0,
                y: -20,
                duration: DURATION.normal,
                ease: EASE.strong
            })
                .from(".anim-journal-editor", {
                    autoAlpha: 0,
                    y: 20,
                    duration: DURATION.normal,
                    ease: EASE.strong
                }, "-=0.4")
                .from(".anim-journal-item", {
                    autoAlpha: 0,
                    y: 20,
                    stagger: STAGGER.normal,
                    duration: DURATION.normal,
                    ease: EASE.default
                }, "-=0.2");

            return () => {
                tl.kill();
                gsap.set(".anim-journal-header, .anim-journal-editor, .anim-journal-item", { clearProps: "all" });
            };
        });
    }, { scope: containerRef });
};

