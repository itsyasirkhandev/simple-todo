import { useGSAP, gsap } from "@/lib/gsapConfig";
import { RefObject } from "react";

export const useJournalListAnimations = (containerRef: RefObject<HTMLDivElement | null>) => {
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
                gsap.set(".anim-list-header, .anim-list-card, .anim-list-fab", {
                    autoAlpha: 1,
                    y: 0,
                    scale: 1,
                });
                return () => {
                    gsap.set(".anim-list-header, .anim-list-card, .anim-list-fab", { clearProps: "all" });
                };
            }

            const tl = gsap.timeline();

            tl.from(".anim-list-header", {
                autoAlpha: 0,
                y: 30,
                duration: 1,
                ease: "expo.out"
            })
                .from(".anim-list-card", {
                    autoAlpha: 0,
                    y: 40,
                    stagger: 0.05,
                    duration: 0.8,
                    ease: "power3.out"
                }, "-=0.6")
                .from(".anim-list-fab", {
                    autoAlpha: 0,
                    scale: 0.8,
                    duration: 0.6,
                    ease: "back.out(1.5)"
                }, "-=0.4");

            return () => {
                tl.kill();
                gsap.set(".anim-list-header, .anim-list-card, .anim-list-fab", { clearProps: "all" });
            };
        });
    }, { scope: containerRef });
};
