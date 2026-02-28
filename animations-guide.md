# animations-guide.md — GSAP Core Rules

> **STRICT COMPLIANCE PROTOCOL**:
> Use GSAP (`gsap` + `@gsap/react`) exclusively.
> AI Agents MUST follow these rules to ensure performant, maintainable, and leak-free animations.

---

## 1. Setup & Absolute Imports

- **Central Config**: All GSAP imports MUST come from `@/lib/gsapConfig`.
  - **AI AGENT RULE**: NEVER import from `"gsap"` or `"@gsap/react"` directly.
- **Tokens**: MUST use `DURATION`, `EASE`, `STAGGER`, and `BREAKPOINTS` from `@/constants/animationTokens.ts`.
  - **AI AGENT RULE**: Hardcoded numbers in `duration` or `stagger` are strictly forbidden.

---

## 2. Logic Isolation (Hooks Pattern)

**AI AGENT RULE**: UI components MUST NOT contain raw GSAP logic.

- **Hook Placement**: Put animation logic in `features/<feature>/hooks/use<Name>Animation.ts`.
- **Component Role**: Components only call the hook and attach the returned `ref` to the container.
- **Naming**: Hooks MUST follow the `use[Feature]Animation` pattern.

### ✅ Animation Do's & Don'ts ❌

| Do | Don't |
| :--- | :--- |
| Isolate logic in custom hooks | Write `gsap.to()` inside a component body |
| Use `useGSAP()` for all animations | Use `useEffect()` for GSAP |
| Pass `{ scope: containerRef }` | Use global selectors that might leak |
| Use `anim-` prefixed classes | Target utility classes like `.p-4` or `.flex` |
| Use `autoAlpha` for visibility | Toggle `opacity` and `display` manually |

---

## 3. The `useGSAP` Pattern

Every animation hook must follow these 5 requirements:
1. **Scope Mandatory**: You MUST pass `{ scope: ref }` as the second argument.
2. **Cleanup**: Return an explicit cleanup function if manually adding event listeners or complex triggers.
3. **Context**: Use `gsap.context()` implicitly via `useGSAP` for automatic cleanup.
4. **Dependencies**: Pass dependency arrays correctly to `useGSAP` to trigger re-animations.
5. **Revert**: Ensure animations are revertible for React 19 Strict Mode compatibility. ANY manually triggered function returned from the hook (e.g., `animateDelete`) MUST be wrapped in the `contextSafe` wrapper provided by `useGSAP()` to prevent memory leaks and orphaned animations.

---

## 4. Performance & Metrics

**AI AGENT RULE**: Animate only "Cheap" properties.

- **Cheap (Good)**: `x`, `y`, `scale`, `rotation`, `autoAlpha`.
- **AI AGENT RULE**: NEVER animate `opacity` or `display` directly. ALWAYS use `autoAlpha` which combines `opacity` and `visibility: inherit/hidden`.
- **Expensive (Bad)**: `width`, `height`, `top`, `left`, `margin`, `padding`.
  - **NEVER** animate anything that triggers layout reflow.

---

## 5. Timelines & Responsive Web

- **Timelines**: Use `gsap.timeline()` for any sequence involving 2+ elements.
- **MatchMedia**: Use `gsap.matchMedia()` within `useGSAP` for responsive logic.
- **AI AGENT RULE (Ordering)**: In every `gsap.matchMedia()` block, the `BREAKPOINTS.reduced` (prefers-reduced-motion) handler MUST be declared FIRST. Failure to do so is a CRITICAL violation.
- **AI AGENT RULE (Mandatory Cleanup)**: EVERY handler inside `gsap.matchMedia()` (Standard and Reduced) MUST return an explicit cleanup function that calls `gsap.set(..., { clearProps: "all" })` on the animated elements.
- **AI AGENT RULE (No Stale Styles)**: NEVER use `gsap.killTweensOf()` as a substitute for `clearProps: "all"`. Killing tweens stops the motion but leaves elements in "dirty" states (e.g., `transform: translate(12px)`) which breaks layout on resize.
- **AI AGENT RULE**: NEVER use `window.matchMedia()` inside GSAP hooks or contexts. Use the `gsap.matchMedia()` object.
- **A11y (MANDATORY)**: Always handle `(prefers-reduced-motion: reduce)` by calling `gsap.set(..., { clearProps: "all" })` to ensure the layout is clean when animations are disabled.

### 🖼️ Example: Compliant Animation Hook
```ts
export const useMyAnimation = (scope: React.RefObject<HTMLElement | null>) => {
  useGSAP(() => {
    const mm = gsap.matchMedia();

    // 1. Reduced motion FIRST
    mm.add(BREAKPOINTS.reduced, () => {
      // Return cleanup for reduced motion too
      return () => gsap.set(".anim-target", { clearProps: "all" });
    });

    // 2. Standard breakpoints
    mm.add(BREAKPOINTS.desktop, () => {
      gsap.from(".anim-target", { autoAlpha: 0, y: 20 });
      // Return cleanup logic
      return () => gsap.set(".anim-target", { clearProps: "all" });
    });
  }, { scope });
};
```

### ✅ Performance Do's & Don'ts ❌

| Do | Don't |
| :--- | :--- |
| Use `gsap.set()` for instant state | Use `gsap.to(..., { duration: 0 })` |
| Use `stagger: { each: STAGGER.normal }` | Use `.map()` to trigger individual tweens |
| Rely on `autoAlpha: 0` for hiding | Use `opacity: 0` (keeps element clickable) |
| Remove `markers: true` before commit | Commit debug ScrollTrigger markers |

---

## 6. Mandatory Audit Checklist

Before submitting animation code, AI Agents MUST verify:
- [ ] NO direct imports from `"gsap"`.
- [ ] ALL selectors use the `anim-` prefix.
- [ ] `useGSAP` has a defined `scope`.
- [ ] No hardcoded durations or eases (use tokens).
- [ ] No layout-wrenching properties (`width`, `margin`, etc.) are animated.
- [ ] `console.log` and `markers: true` are removed.

> **AI AGENT ACKNOWLEDGMENT**: Failure to follow the Animation System rules will result in immediate rejection of the PR.
