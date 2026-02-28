/*
 * File Name:     animationTokens.ts
 * Description:   Shared GSAP animation constants — duration, ease, and
 *                stagger values used across the entire project.
 * Author:        Project Team
 * Created Date:  2026-02-25
 */

export const DURATION = {
  fast: 0.3,
  normal: 0.6,
  slow: 1.0,
  xslow: 1.5,
} as const;

export const EASE = {
  default: "power2.out",
  strong: "power3.out",
  bounce: "back.out(1.7)",
  elastic: "elastic.out(1, 0.3)",
  linear: "none",
  inOut: "power1.inOut",
} as const;

export const STAGGER = {
  fast: 0.06,
  normal: 0.1,
  slow: 0.15,
} as const;

export const BREAKPOINTS = {
  mobile: "(max-width: 767px)",
  tablet: "(min-width: 768px) and (max-width: 1023px)",
  desktop: "(min-width: 1024px)",
  reduced: "(prefers-reduced-motion: reduce)",
} as const;
