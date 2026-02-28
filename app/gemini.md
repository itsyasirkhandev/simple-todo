# app/GEMINI.md — Next.js App Router

> **Package Identity**: Next.js 16 frontend application using App Router.
> Contains pages, layouts, API routes, and global styles.
>
> **Classification**: ✅ Animation-facing — references `rules.md` + `design-system.md` + `animations-guide.md`

---

## Rules Reference

> **Code conventions**: see [`rules.md`](../rules.md).
> **UI & design conventions**: see [`design-system.md`](../design-system.md).
> **Animation conventions**: see [`animations-guide.md`](../animations-guide.md).
> **Routing conventions**: see [`routing-guide.md`](../routing-guide.md).
> Do not deviate. Do not duplicate rules here.

---

## Setup & Run

```bash
# Development server
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start

# Lint
pnpm lint

# Verify GSAP is installed
Select-String -Path "package.json" -Pattern "gsap"

# Check animation token file exists
Get-ChildItem -Path "constants" -Filter "animationTokens.ts"

# Check gsapConfig central registration
Get-ChildItem -Path "lib" -Filter "gsapConfig.ts"
```

---

## Patterns & Conventions

### File Organization

```
app/
├── favicon.ico           # Site favicon
├── globals.css           # Tailwind v4 + OKLCH color variables
├── layout.tsx            # Root layout (Server Component)
├── page.tsx              # Home page (thin orchestrator)
├── error.tsx             # Global runtime & lazy-load fallback
├── not-found.tsx         # Global 404 page
├── unauthorized.tsx      # Global 401 page (optional)
├── forbidden.tsx         # Global 403 page (optional)
├── (auth)/               # Route group — auth pages
│   ├── login/page.tsx
│   └── register/page.tsx
├── dashboard/            # Dashboard section
│   ├── layout.tsx
│   └── page.tsx
└── api/                  # API route handlers
    └── users/route.ts
```

### Page Rules (from `rules.md § 3`)

```
✅ DO: Thin pages — no business logic, no API calls, no complex state
✅ DO: Server Components by default — only use "use client" when needed
✅ DO: Import from feature barrels — import { X } from "@/features/auth"
✅ DO: Route groups with parentheses — (auth), (dashboard)
✅ DO: Lazy load feature views from `features/*/views/*.view.tsx` — see routing-guide.md
✅ DO: Use constants/routes.ts for ALL paths (including fragments)

❌ DON'T: Fat pages with useState, useEffect, fetch calls
❌ DON'T: Direct imports from feature internals — use barrel only
❌ DON'T: Add "use client" to pages/layouts unnecessarily
❌ DON'T: Hardcode routing strings — use ROUTES constants
```

### UI Patterns

```
✅ DO: Use CSS variables — bg-background, text-foreground, bg-primary
✅ DO: Use shadcn/ui components — npx shadcn@latest add <component>
✅ DO: Follow 8pt grid — p-4 (16px), gap-6 (24px), m-8 (32px)
✅ DO: Use CVA for variants in components

❌ DON'T: Hardcode colors — no bg-red-500, text-blue-600
❌ DON'T: Use arbitrary spacing/sizing — no p-[25px], text-[13px], grid-cols-[...]
❌ DON'T: Use inline styles — always Tailwind classes
❌ DON'T: Build custom components when shadcn/ui has it (but AUDIT shadcn for forbidden values)
```

### Animation Patterns

```
✅ DO: Import gsap from central config — see lib/gsapConfig.ts
✅ DO: Use animationTokens for all values — see constants/animationTokens.ts
✅ DO: Isolate animation logic in hooks — features/<name>/hooks/use<X>Animation.ts
✅ DO: Use anim- prefix on all GSAP target classes
✅ DO: Use gsap.matchMedia() for responsive breakpoints
✅ DO: useGSAP with { scope: containerRef }
✅ DO: Declare BREAKPOINTS.reduced handler first in every matchMedia call

❌ DON'T: Import gsap directly from "gsap" — use @/lib/gsapConfig
❌ DON'T: Use useEffect for GSAP code — use useGSAP
❌ DON'T: Omit { scope: containerRef } from useGSAP
❌ DON'T: Target Tailwind classes with GSAP — use anim- prefix only
❌ DON'T: Hardcode duration/ease/stagger — use DURATION/EASE/STAGGER tokens
❌ DON'T: Animate layout properties (top, left, width, height, margin, padding)
❌ DON'T: Animate `opacity` directly — use `autoAlpha` instead
❌ DON'T: Use `gsap.killTweensOf()` as a substitute for `clearProps: "all"`
❌ DON'T: Commit markers: true, timeScale overrides, or console.logs
❌ DON'T: Put raw gsap timelines in component JSX — extract to a hook
❌ DON'T: Use dependencies: [...] without revertOnUpdate: true
```

---

## Touch Points / Key Files

| Concern | File |
|---------|------|
| Global styles | `app/globals.css` |
| Root layout | `app/layout.tsx` |
| Home page | `app/page.tsx` |
| GSAP config | `lib/gsapConfig.ts` |
| Animation tokens | `constants/animationTokens.ts` |
| shadcn config | `components.json` |
| UI primitives | `components/ui/` |

---

## JIT Index Hints

```powershell
# Find all pages
Get-ChildItem -Path "app" -Recurse -Filter "page.tsx"

# Find all layouts
Get-ChildItem -Path "app" -Recurse -Filter "layout.tsx"

# Find all API routes
Get-ChildItem -Path "app\api" -Recurse -Filter "route.ts"

# Find all animation hooks
Get-ChildItem -Recurse -Filter "use*Animation.ts"

# Find anim- prefixed classes (GSAP targets)
Select-String -Path "*.tsx" -Pattern "anim-"

# Find direct gsap imports (violations — should use gsapConfig)
Select-String -Path "*.ts","*.tsx" -Pattern "from ['\"]gsap['\"]"

# Find useEffect used for GSAP (violations)
Select-String -Path "*.tsx" -Pattern "useEffect" | Select-String -Pattern "gsap"

# Find hardcoded animation values (violations — should use tokens)
Select-String -Path "*.ts","*.tsx" -Pattern "duration:\s*[0-9]"

# Find missing scope in useGSAP (violations)
Select-String -Path "*.tsx" -Pattern "useGSAP\(" | Select-String -NotMatch "scope"

# Find markers left in ScrollTrigger (violations — never commit)
Select-String -Path "*.ts","*.tsx" -Pattern "markers:\s*true"

# Find hardcoded colors (violations — should use CSS variables)
Select-String -Path "*.tsx" -Pattern "bg-(red|blue|green|yellow|purple|pink|orange|zinc|gray|slate)-"
```

---

## Common Gotchas

### Animation Gotchas
- Always import gsap from `@/lib/gsapConfig` — never from `"gsap"` directly
- Every animation hook must handle `BREAKPOINTS.reduced` via `gsap.matchMedia()` — **DECLARED FIRST**
- Always return `clearProps: "all"` cleanup inside **EVERY** `matchMedia` handler
- `dependencies: [...]` in `useGSAP` must always be paired with `revertOnUpdate: true`
- `ScrollTrigger.refresh()` must be called after all triggers are registered
- `markers: true` is dev-only — never commit it
- `anim-` classes are animation-only — never style them with Tailwind
- See `animations-guide.md § 7` for the complete performance and cleanup list.

### UI Gotchas
- Use `bg-background` not `bg-white` — breaks dark mode
- Spacing must be 8pt grid — check `design-system.md § 3` before using arbitrary values
- New UI component? Check shadcn/ui docs first: https://ui.shadcn.com/docs/components
- Add new shadcn components via CLI: `npx shadcn@latest add <component>`

---

## Pre-PR Checks

**Code**:
```bash
pnpm lint; if($?) { npx tsc --noEmit }; if($?) { pnpm build }
```

**UI** (manual): Run through the checklist in [`design-system.md § 10`](../design-system.md#10-ui-code-review-checklist)

**Animations** (manual):
- [ ] All GSAP imports come from `@/lib/gsapConfig`
- [ ] All animation hooks use `useGSAP` with `{ scope: containerRef }`
- [ ] All GSAP target classes use the `anim-` prefix
- [ ] All duration/ease/stagger values use tokens from `animationTokens.ts`
- [ ] All `gsap.matchMedia()` calls declare `BREAKPOINTS.reduced` **FIRST**
- [ ] All `matchMedia` handlers return a `clearProps: "all"` cleanup function
- [ ] No `markers: true`, `timeScale`, `killTweensOf`, or `console.log` in committed code
- [ ] No raw `gsap` timelines inside component JSX — logic is in hooks
- [ ] See full checklist in [`animations-guide.md § 7`](../animations-guide.md#7-performance--cleanup)

---

## Animation System

This package uses GSAP for all animations. It must strictly follow every
rule in [`animations-guide.md`](../animations-guide.md).

- Central config: `lib/gsapConfig.ts` — all plugin registration happens here
- Animation tokens: `constants/animationTokens.ts` — all DURATION/EASE/STAGGER/BREAKPOINTS
- Animation hooks: `features/<name>/hooks/use<Name>Animation.ts`
- **Every animation hook must**:
  - Use `useGSAP` (never `useEffect`) with `{ scope: containerRef }`
  - Handle `BREAKPOINTS.reduced` via `gsap.matchMedia()` — declared first
  - Return `clearProps: "all"` cleanup from every `matchMedia` handler
  - Use only tokens from `animationTokens.ts` — no hardcoded values
  - Use `anim-` prefixed classes as GSAP targets — never Tailwind classes
  - **AI AGENT RULE**: Animate ONLY `x`, `y`, `scale`, `rotation`, `autoAlpha`.
  - **AI AGENT RULE**: NEVER animate `opacity`. Use `autoAlpha` instead.

---

*Last updated: 2026-02-25*
