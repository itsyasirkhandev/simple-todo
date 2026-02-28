/*
 * File Name:     useTodoAnimations.ts
 * Description:   GSAP animation logic for the Todo feature, isolated from UI components.
 * Author:        Antigravity
 * Created Date:  2026-02-28
 */

"use client"

import { useGSAP, gsap } from '@/lib/gsapConfig'
import { DURATION, EASE, STAGGER, BREAKPOINTS } from '@/constants/animationTokens'

/**
 * Hook for managing Eisenhower Matrix entrance and staggered animations.
 * Implements View Isolation and accessibility-first motion reduction.
 * 
 * @param {React.RefObject<HTMLElement | null>} scope - The container ref for GSAP scoping.
 * @returns {void}
 */
export const useMatrixAnimations = (scope: React.RefObject<HTMLElement | null>) => {
    useGSAP(() => {
        if (!scope.current) return;
        const mm = gsap.matchMedia()

        // 1. Reduced motion FIRST (Mandatory)
        mm.add(BREAKPOINTS.reduced, () => {
            gsap.set('.anim-matrix-header, .anim-matrix-quadrant', {
                clearProps: "all",
                autoAlpha: 1,
            });
            return () => gsap.set('.anim-matrix-header, .anim-matrix-quadrant', { clearProps: "all" })
        })

        // 2. Standard Animations
        mm.add("(prefers-reduced-motion: no-preference)", () => {
            const tl = gsap.timeline({
                defaults: {
                    ease: EASE.strong,
                    duration: DURATION.normal,
                }
            })

            tl.from('.anim-matrix-header', {
                autoAlpha: 0,
                y: -30,
                duration: DURATION.slow,
            })
                .from('.anim-matrix-quadrant', {
                    autoAlpha: 0,
                    scale: 0.95,
                    stagger: STAGGER.normal,
                    duration: DURATION.slow,
                    ease: EASE.default,
                }, '-=0.4')

            return () => gsap.set('.anim-matrix-header, .anim-matrix-quadrant', { clearProps: "all" })
        })
    }, { scope })
}

/**
 * Hook for managing individual Todo item animations (entrance and deletion).
 * Provides contextSafe controllers for dynamic interactions.
 * 
 * @param {React.RefObject<HTMLElement | null>} scope - The item container ref.
 * @returns {object} { animateDelete: (onComplete: () => void) => void }
 */
export const useTodoItemAnimations = (scope: React.RefObject<HTMLElement | null>) => {
    const { contextSafe } = useGSAP(() => {
        if (!scope.current) return;
        const mm = gsap.matchMedia()

        // 1. Reduced motion FIRST
        mm.add(BREAKPOINTS.reduced, () => {
            gsap.set(scope.current, { clearProps: "all", autoAlpha: 1 });
            return () => gsap.set(scope.current, { clearProps: "all" });
        })

        // 2. Motion-enabled entrance
        mm.add("(prefers-reduced-motion: no-preference)", () => {
            gsap.from(scope.current, {
                autoAlpha: 0,
                y: 20,
                duration: DURATION.fast,
                ease: EASE.strong,
            })

            return () => gsap.set(scope.current, { clearProps: "all" })
        })
    }, { scope })

    /**
     * Triggers the exit animation for a todo item.
     * Uses gsap.matchMedia internally to respect accessibility during the interaction.
     * 
     * @param {Function} onComplete - Callback to execute after animation finishes.
     */
    const animateDelete = contextSafe((onComplete: () => void) => {
        const mm = gsap.matchMedia()

        // Reduced motion exit (immediate)
        mm.add(BREAKPOINTS.reduced, () => {
            onComplete()
            return () => { }
        })

        // Standard exit animation
        mm.add("(prefers-reduced-motion: no-preference)", () => {
            gsap.to(scope.current, {
                autoAlpha: 0,
                x: -50,
                duration: DURATION.fast,
                ease: EASE.default,
                onComplete,
            })

            return () => gsap.set(scope.current, { clearProps: "all" })
        })
    })

    return { animateDelete }
}
