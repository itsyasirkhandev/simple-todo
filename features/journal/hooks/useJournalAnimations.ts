/*
 * File Name:     useJournalAnimations.ts
 * Description:   Animation logic for the Journal view using GSAP.
 * Author:        Antigravity
 * Created Date:  2026-02-28
 */

"use client"

import { useGSAP, gsap } from "@/lib/gsapConfig";
import { RefObject } from "react";

/**
 * Custom hook for Journal view animations.
 * Provides entry animations for the header, editor, and list.
 * 
 * @param {RefObject<HTMLDivElement>} containerRef - The ref to the container element.
 */
export const useJournalAnimations = (containerRef: RefObject<HTMLDivElement | null>) => {
    useGSAP(() => {
        if (!containerRef.current) return;

        const mm = gsap.matchMedia();

        mm.add({
            isReduced: "(prefers-reduced-motion: reduce)",
            isDesktop: "(min-width: 1024px)",
            isMobile: "(max-width: 1023px)"
        }, (context) => {
            const { isReduced } = context.conditions as { isReduced: boolean | undefined };

            if (isReduced) {
                gsap.set(".anim-journal-header, .anim-journal-editor, .anim-journal-item", {
                    autoAlpha: 1,
                    y: 0
                });
                return () => {
                    gsap.set(".anim-journal-header, .anim-journal-editor, .anim-journal-item", { clearProps: "all" });
                };
            }

            // Entry animations
            const tl = gsap.timeline();

            tl.from(".anim-journal-header", {
                autoAlpha: 0,
                y: -20,
                duration: 0.8,
                ease: "power3.out"
            })
                .from(".anim-journal-editor", {
                    autoAlpha: 0,
                    y: 20,
                    duration: 0.8,
                    ease: "power3.out"
                }, "-=0.4")
                .from(".anim-journal-item", {
                    autoAlpha: 0,
                    y: 20,
                    stagger: 0.1,
                    duration: 0.6,
                    ease: "power2.out"
                }, "-=0.2");

            return () => {
                tl.kill();
                gsap.set(".anim-journal-header, .anim-journal-editor, .anim-journal-item", { clearProps: "all" });
            };
        });
    }, { scope: containerRef });
};
