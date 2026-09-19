<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# AGENTS.md — Modulab Portfolio

Actionable rules and invariants for AI coding agents working on `modulab-portfolio`.

---

## 1. Project Context
- **Repository:** `modulab-portfolio` (Product Module for `portfolio.modulab.online`).
- **Companion Repository:** `modulab-platform` (Marketing Gateway for `modulab.online`).
- **Core Purpose:** Multi-tenant portfolio engine featuring a product landing page, authenticated CMS studio (`/admin`), dynamic SSR public developer portfolios (`/[username]`), and a presigned Cloudinary media pipeline.

---

## 2. Next.js Instructions (Next.js 16 App Router)
- **Dynamic Route Parameters:** `params` and `searchParams` in Page/Route Handlers are `Promise` types. Always `await` them before reading properties:
  ```ts
  export default async function Page({ params }: { params: Promise<{ username: string }> }) {
    const { username } = await params;
  }
  ```
- **Server Actions:** Mark server action files with `'use server'` at the top. Never expose database mutation logic directly to client components.
- **Root Layout Scroll Behavior:** Use `data-scroll-behavior="smooth"` attribute on `<html>` in `src/app/layout.tsx`. Do NOT apply `scroll-smooth` as a Tailwind class on root `<html>` to avoid Next.js route transition warnings.

---

## 3. Architecture Invariants
- **Domain Boundaries (`src/lib/domains/`):** Code is partitioned by domain (`identity`, `profile`, `portfolio`, `media`, `public-portfolio`).
- **Single-Writer Rule:** Only the owning domain service may mutate its associated Mongoose model. Other domains must consume public domain functions or cross-domain query boundaries.
- **Cross-Repo URL Resolution:** Never hardcode platform or portfolio hostnames. Always use `siteConfig` (`@/config/site`) or `process.env.NEXT_PUBLIC_PLATFORM_URL` / `process.env.NEXT_PUBLIC_PORTFOLIO_URL`.

---

## 4. Domain Ownership Rules
| Domain | Path | Model Ownership | Responsibilities |
| :--- | :--- | :--- | :--- |
| **Identity** | `@/lib/domains/identity` | `User` | Exclusive mutator of `User` model, password hashing (bcrypt 12 rounds), user registration. |
| **Profile** | `@/lib/domains/profile` | `Profile` | Profile mutations (bio, headline, avatar, social links, resume). |
| **Portfolio** | `@/lib/domains/portfolio` | `Project`, `Skill`, `Category`, `SkillCategory` | Admin CMS CRUD operations, project ordering, skill grouping, dashboard metrics. |
| **Media** | `@/lib/domains/media` | None (Cloudinary) | Direct-to-Cloudinary upload signatures, tenant folder hierarchy (`Modulab/users/{userId}/...`), download URLs, transforms. |
| **Public Portfolio** | `@/lib/domains/public-portfolio` | None (Read-only Boundary) | Canonical read-only query boundary for `/[username]` rendering. |

---

## 5. Dependency & Import Rules
- **DO NOT** import Mongoose models directly inside Client Components (`'use client'`).
- **DO NOT** bypass domain services in Server Actions (e.g., do not run direct `User.updateOne` from a route handler; invoke `@/lib/domains/identity` instead).
- **DO NOT** perform password hashing outside the Identity domain.
- **UI Components** must only consume Server Actions, API routes, or typed domain response contracts.

---

## 6. Authentication & Security Rules
- **Auth Provider:** Auth.js (NextAuth v5 beta) with credentials provider (`src/auth.ts`, `src/auth.config.ts`).
- **Session Verification:** Protected admin routes and server actions must verify the active session using `auth()`:
  ```ts
  const session = await auth();
  if (!session?.user?.id) throw new Error('Unauthorized');
  ```
- **Passwords:** Minimum 8 characters, hashed with `bcryptjs` using 12 salt rounds.
- **Environment Secrets:** Never expose `AUTH_SECRET`, `MONGODB_URI`, or `CLOUDINARY_API_SECRET` to the client bundle (no `NEXT_PUBLIC_` prefix for secrets).

---

## 7. Media & Cloudinary Rules
- **Direct Upload Flow:** Client requests presigned signature via `/api/v1/media/presign`, then uploads directly to Cloudinary.
- **Tenant Isolation:** Cloudinary assets must be namespaced: `Modulab/users/{userId}/{projects|resumes|avatars}`.
- **Optimization:** Use `getOptimizedImageUrl(url, { width })` from `@/lib/utils` for responsive CDN delivery.
- **Resume Downloads:** Use `getDownloadUrl(url)` with Cloudinary `fl_attachment` flag or proxy download route.

---

## 8. Public Portfolio Rules
- **CMS as Single Source of Truth:** All content displayed on `/[username]` must originate from the database.
- **NO Fabricated Metrics:** Do not hardcode metrics (e.g., "99.9% uptime", "<80ms latency"). Only display authentically derived metrics (e.g., `projects.length`, `skills.length`, `featuredCount`).
- **Dynamic Category Filters:** Derive project filters dynamically from `project.category` array.
- **Accessible Project Actions:** Conditional `View Live →` and `GitHub ↗` buttons must be accessible on mobile without requiring hover.
- **Browser Mockup Header:** Scale proportionally on mobile (`<640px`) to fit dots, lock, truncated URL, and status pill on a single line with zero horizontal overflow.

---

## 9. Database & Model Rules
- **Connection:** Always call `await connectDB()` from `@/lib/db` before Mongoose queries.
- **Model Compilation:** Cache models on `mongoose.models[ModelName]` to prevent recompilation errors in serverless environments.
- **Timestamps:** Maintain `createdAt` and `updatedAt` timestamps across all domain models.

---

## 10. Testing & Validation Requirements
Before completing any task, execute and pass all three checks:
1. `npm run lint` — Must exit with 0 errors and 0 warnings.
2. `git diff --check` — Must exit cleanly with 0 trailing whitespace issues.
3. `npm run build` — Must compile successfully without errors or type mismatches across all routes with Turbopack.

---

## 11. Common Commands
```bash
npm run dev        # Start development server with Turbopack (default port 3000)
npm run build      # Build production bundle with Next.js Turbopack compiler
npm run start      # Start production server
npm run lint       # Run ESLint validation
git diff --check   # Check for trailing whitespace or formatting conflicts
```

---

## 12. Critical "DO NOT" Rules
- **DO NOT** hardcode domain names (`modulab.online`, `portfolio.modulab.online`). Use site config / environment variables.
- **DO NOT** mutate Mongoose models outside their owning domain.
- **DO NOT** invent static placeholder claims or hardcoded project statistics on public pages.
- **DO NOT** break mobile responsiveness across admin dashboard (`/admin/*`), landing page (`/`), or public portfolio (`/[username]`).
- **DO NOT** commit temporary files or secrets to source control.
