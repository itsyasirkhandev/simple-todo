# design-system.md — shadcn/ui + Tailwind v4 Core

> **STRICT COMPLIANCE PROTOCOL**:
> This is the single source of truth for all UI, UX, and design conventions.
> AI Agents MUST adhere to these constraints to ensure a premium, consistent, and accessible interface.

---

## 1. Typography Engine

**AI AGENT RULE**: Strictly use **4 sizes only** and **2 weights only**.

- **Sizes**:
  - `text-4xl` to `text-7xl` (Title / Hero)
  - `text-2xl` to `text-3xl` (Subheading / Section)
  - `text-base` (Body / Default)
  - `text-sm` (Small / Caption)
  - **AI AGENT RULE**: `text-lg` and `text-xl` are STRICTLY FORBIDDEN.
- **Weights**: `font-semibold` (600) and `font-normal` (400). `font-bold` (700) is STRICTLY FORBIDDEN.
- **Fonts**: Use `font-serif` for headings and `font-sans` for body/ui elements.

### ✅ Typography Do's & Don'ts ❌

| Do | Don't |
| :--- | :--- |
| Use standard Tailwind scale (`text-sm`, `text-base`) | Use arbitrary sizing (`text-[13px]`, `text-[17px]`) |
| Use `font-semibold` for emphasis | Use `font-bold` (700) or `font-medium` (500) |
| Align text to the 8pt baseline | Mix multiple font weights in one section |

---

## 2. Spacing & The 8pt Grid

**AI AGENT RULE**: EVERY spacing value MUST be divisible by 8 or 4.

- **Scale**: `p-1` (4px), `p-2` (8px), `p-4` (16px), `p-6` (24px), `p-8` (32px), `p-12` (48px). `gap-3` (12px) is FORBIDDEN.
- **Architecture**: Use `gap-*` for flex/grid layouts. Use standard containers (e.g., `max-w-7xl`), NEVER arbitrary values like `max-w-[1600px]`.

### ✅ Spacing Do's & Don'ts ❌

| Do | Don't |
| :--- | :--- |
| Use `p-4`, `m-8`, `gap-6` (divisible by 4/8) | Use `p-3`, `m-5`, `gap-7`, or `grid-cols-[...]` |
| Use `space-y-6` for vertical form flow | Use arbitrary `margin-top` on every element |
| Use `aspect-video` or `aspect-square` | Hardcode `width`, `height`, `min-h-[...]`, `grid-cols-[...]`, or `grid-rows-[...]` |

---

## 3. Color System (60/30/10)

- **60% Neutral**: `bg-background`, `bg-card`, `bg-muted`. (Backgrounds & surfaces)
- **30% Complementary**: `text-foreground`, `text-muted-foreground`, `border-input`. (Text & borders)
- **10% Accent**: `bg-primary`, `text-primary-foreground`, `bg-destructive`. (CTAs & status)

### ✅ Color Do's & Don'ts ❌

| Do | Don't |
| :--- | :--- |
| Use CSS variables (`bg-primary`, `text-foreground`) | Hardcode hex codes or Tailwind colors (`bg-blue-500`) |
| Use `opacity-[0.05]` for subtle background tints | Use arbitrary filters (`grayscale-[0.5]`), custom scale (`scale-[1.02]`), or sizing (`text-[13px]`) |
| Rely on `oklch()` for perceptual consistency | Use `rgb()` or `hsl()` for new global tokens |

---

## 4. Component Standards (shadcn/ui)

- **Source of Truth**: Always check `components/ui/` before building.
- **Micro-interactions**: Use `transition-all duration-300` for all hover/active states.
- **Glassmorphism**: Use `bg-background/60 backdrop-blur-md border-primary/10` for premium cards.

### ✅ Component Do's & Don'ts ❌

| Do | Don't |
| :--- | :--- |
| Modify shadcn components in `components/ui/` | Shadow-copy shadcn code into feature folders |
| Use Radix primitives for complex a11y | Build custom dropdowns or modals from scratch |
| Use `lucide-react` for all iconography | Mix multiple icon libraries (e.g., FontAwesome) |

---

## 5. Mandatory UI Audit Checklist

Before submitting UI code, AI Agents MUST verify:
- [ ] NO arbitrary values (`-[...]`) used for spacing or typography (including `grid-cols-[...]`, `min-h-[...]`, etc.).
- [ ] ALL shadcn components have been AUDITED and refactored if they contained default arbitrary values.
- [ ] ALL colors come from CSS variables (no `text-blue-600`).
- [ ] Hover states are implemented for all interactive elements.
- [ ] Focus rings are preserved and visible for keyboard navigation.
- [ ] Dark mode is verified (no hardcoded white/black).
- [ ] Container widths are capped and centered (`max-w-7xl mx-auto`).

> **AI AGENT ACKNOWLEDGMENT**: Adherence to the Design System is strictly monitored. Non-compliant UI will be rejected.
