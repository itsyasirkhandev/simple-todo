/*
 * File Name:     useLandingAnimation.ts
 * Description:   GSAP animation hook for the landing page.
 * Author:        Antigravity
 * Created Date:  2026-02-27
 */

import { RefObject } from "react";
import { gsap, useGSAP } from "@/lib/gsapConfig";
import { DURATION, EASE, STAGGER, BREAKPOINTS } from "@/constants/animationTokens";

/**
 * Hook to manage GSAP animations for the landing page hero section.
 * Implements responsive matchMedia breakpoints and accessibility checks.
 * 
 * @param {RefObject<HTMLElement | null>} scope - The container ref for GSAP scoping.
 * @returns {void}
 */
export function useLandingAnimation(scope: RefObject<HTMLElement | null>) {
    useGSAP(() => {
        if (!scope.current) return;

        const mm = gsap.matchMedia();

        // 1. Reduced motion FIRST (Mandatory)
        mm.add(BREAKPOINTS.reduced, () => {
            gsap.set(".anim-hero-title, .anim-hero-subtitle, .anim-tech-badge, .anim-hero-ctas, .anim-hero-blob, .anim-features-card", {
                clearProps: "all",
                autoAlpha: 1,
            });
            // Return cleanup for reduced motion
            return () => gsap.set(".anim-hero-title, .anim-hero-subtitle, .anim-tech-badge, .anim-hero-ctas, .anim-hero-blob", { clearProps: "all" });
        });

        // 2. Standard Desktop Animations
        mm.add(BREAKPOINTS.desktop, () => {
            const heroTl = gsap.timeline({
                defaults: {
                    ease: EASE.strong,
                    duration: DURATION.normal,
                }
            });

            heroTl
                .from(".anim-hero-title", {
                    y: 40,
                    autoAlpha: 0,
                    duration: DURATION.slow,
                })
                .from(".anim-hero-subtitle", {
                    y: 20,
                    autoAlpha: 0,
                }, "-=0.4")
                .from(".anim-tech-badge", {
                    scale: 0.9,
                    autoAlpha: 0,
                    stagger: STAGGER.fast,
                    duration: DURATION.normal,
                }, "-=0.2")
                .from(".anim-hero-ctas", {
                    y: 10,
                    autoAlpha: 0,
                }, "-=0.2")
                .from(".anim-hero-blob", {
                    scale: 0.8,
                    autoAlpha: 0,
                    duration: DURATION.xslow,
                    stagger: 0.2,
                }, 0);

            // Return mandatory clearProps cleanup
            return () => gsap.set(".anim-hero-title, .anim-hero-subtitle, .anim-tech-badge, .anim-hero-ctas, .anim-hero-blob", { clearProps: "all" });
        });

        // 3. Mobile specific or simpler animations
        mm.add(BREAKPOINTS.mobile, () => {
            gsap.from(".anim-hero-content > *", {
                y: 30,
                autoAlpha: 0,
                stagger: STAGGER.normal,
                duration: DURATION.normal,
            });

            // Return mandatory clearProps cleanup
            return () => gsap.set(".anim-hero-content > *", { clearProps: "all" });
        });

    }, { scope });
}
