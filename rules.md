# rules.md — Core Engineering Conventions

> **STRICT COMPLIANCE PROTOCOL**:
> This is the single source of truth for code conventions in this project.
> AI Agents MUST read this before EVERY task. Failure to adhere to these rules is non-negotiable.

---

## 1. Architecture & Folder Structure

- **Hybrid Architecture**: Domain code MUST live in `features/<feature>/`. Shared code lives in `components/`, `hooks/`, `lib/`.
- **Feature Rule**: Start every new piece of logic inside a specific feature. Promote to global ONLY if 2+ features need it.
- **Folder Naming**: `lowercase`, `plural` (`components`), `kebab-case` (`user-settings`).
- **Barrel Exports**: A feature's `index.ts` is its ONLY public API.
  - **AI AGENT RULE (Inter-Feature)**: External consumers MUST NEVER import from sub-directories (e.g., `@/features/auth/components/LoginForm`). Strictly use the `@/features/auth` barrel.
  - **AI AGENT RULE (Intra-Feature)**: Files INSIDE a feature SHOULD use relative imports (`./hooks`) or specific paths. DO NOT use the barrel for files you are already inside of to avoid circular dependencies.
- **Thin Pages**: Next.js pages (`app/`) are ONLY "Thin Orchestrators".
  - **AI AGENT RULE (Page View Isolation)**: Every Next.js page MUST render a "View" from `features/<feature>/views/`. Placing orchestrator logic or complex UI in `features/<feature>/components/` without a dedicated `views/` folder is a VIOLATION.
  - **AI AGENT RULE**: NO business logic or complex state in `page.tsx`. Use `next/dynamic` to lazy-load the feature's main view.

### ✅ Architecture Do's & Don'ts ❌

| Do | Don't |
| :--- | :--- |
| Use `features/` for domain-specific logic | Mix domain logic into `app/` or global `components/` |
| Export only via `index.ts` barrels | Use deep imports like `@/features/x/components/y` |
| Use `next/dynamic` for page layouts | Import heavy feature components directly in pages |
| Use `@/` alias for ALL absolute imports | Use relative imports like `../components` or `./types` |

---

## 2. Naming Conventions

- **Components/Pages**: `PascalCase.tsx` (e.g., `LoginForm.tsx`). The exported function must match the filename.
- **Hooks/Services/Utils**: `camelCase.ts` (e.g., `useAuth.ts`).
- **Schemas**: `camelCase.schema.ts` (e.g., `login.schema.ts`).
- **Types**: `camelCase.types.ts` (e.g., `auth.types.ts`). Interfaces/Enums are `PascalCase`.
- **Variables**: `camelCase`. Booleans MUST prefix with `is`, `has`, `should`, or `can`.
- **Constants**: `UPPER_SNAKE_CASE` (e.g., `ROUTES.HOME`).
- **AI AGENT RULE (No Hardcoding)**: ALL navigation targets (including fragment/ID links like `#matrix-view`) MUST be stored in constant registries. Hardcoding `#hash-links` directly in `href` attributes is a VIOLATION.
- **Functions**: `camelCase`, verb-first (`getUserData`). Handlers: `handle*` or `on*`.

---

## 3. Code Documentation (Mandatory)

**AI AGENT RULE**: EVERY new file and EVERY exported member MUST be documented.

- **File Header**: Required at the top of every new file.
```ts
/*
 * File Name:     exampleService.ts
 * Description:   Brief description of the file's purpose.
 * Author:        [Author]
 * Created Date:  2026-MM-DD (MUST use current year, e.g. 2026. Do NOT use 2024.)
 */
```

- **JSDoc (STRICT MANDATE)**: Use `/** ... */` for all exported functions, interfaces, and props.
  - Explain **WHY**, not just **WHAT**.
  - **AI AGENT RULE**: MUST include `@param` and `@returns` tags (or `@type` for constants). Failure to include these is a documentation violation.

---

## 4. TypeScript & Styling (Tailwind v4)

- **Strict TypeScript**: `no-any` is strictly enforced. Use `unknown` or proper generics.
- **Styling**: Tailwind utility classes only. Rely on `shadcn/ui` and `design-system.md`.
- **AI AGENT RULE**: NEVER use arbitrary Tailwind values (e.g., `text-[10px]`, `w-[15px]`, `p-[7px]`).
  - Use the 8pt grid system (e.g., `p-2`, `m-4`, `gap-8`).
  - **STRICTLY FORBIDDEN (No Exceptions)**: `min-h-[...]`, `grid-cols-[...]`, `grid-rows-[...]`, `scale-[...]`, `grayscale-[...]`, `aspect-[...]`, `text-[...]`.
  - **AI AGENT RULE**: If a shadcn component contains these arbitrary values by default (e.g., `grid-cols-[...]` in Alert), the AI AGENT MUST refactor it to a standard Tailwind class or a CSS variable before submitting.
  - Use typography tokens from `design-system.md`.

### ✅ Styling Do's & Don'ts ❌

| Do | Don't |
| :--- | :--- |
| Use CSS variables from `globals.css` | Hardcode hex/rgb colors in components |
| Use `shadcn/ui` components for all UI | Build custom UI primitives from scratch |
| Follow the 8pt grid (`p-4`, `mt-8`) | Use arbitrary values (`p-[13px]`) |
| Use the `cn()` utility for class merging | Manually concatenate template strings |

---

## 5. Forms & Data Fetching

- **Forms**: MUST use `react-hook-form` + `zod` + `shadcn/ui`.
- **Schema Isolation**: Zod schemas MUST live in `features/*/schemas/`.
- **Fetching**: Use Server Components or Server Actions by default.
  - **AI AGENT RULE**: NEVER use `useEffect` for data fetching. Use `react-query` or server-side patterns.

---

## 6. Mandatory Pre-Commit Verification

Before submitting, AI Agents MUST run:
1. `pnpm lint` — Fix all linting issues.
2. `npx tsc --noEmit` — Ensure zero type errors.
3. Check for documentation headers in all new files.
4. Verify all exports have complete JSDoc blocks.
5. Search for `console.log` and remove them.

> **AI AGENT ACKNOWLEDGMENT**: By modifying any code in this repository, you agree to follow these rules without exception.
