# Architecture Decision Records (ADRs)

This document records the foundational architectural decisions, rationale, context, and consequences for the Modulab platform and the Modulab Portfolio product.

---

## ADR-001: Subdomain-Based Multi-Tenancy via Next.js 16 `proxy.ts`

### Status
**Accepted**

### Context
Modulab serves two distinct web surfaces:
1. **The Modulab Platform Gateway**: Brand landing page and ecosystem overview (`modulab.online`).
2. **Modulab Portfolio**: The portfolio product landing page, admin studio, and public tenant portfolios (`dev.modulab.online`).

We needed a clean routing boundary that keeps the apex domain free from user-generated username collisions (e.g. `modulab.online/harish` vs `modulab.online/admin`) while allowing clean vanity URLs (`dev.modulab.online/harish`) for public developer portfolios.

### Decision
Implement edge-level request rewriting in [`src/proxy.ts`](file:///home/harish/Harish/Git/Modulab/src/proxy.ts):
* Host header `modulab.online` rewrites `/` to `/platform`, permits system routes (`/admin`, `/api/*`, `/login`), and rewrites any other path to `/404`.
* Host header `dev.modulab.online` rewrites `/` to `/portfolio`, and routes all other top-level paths directly to dynamic user portfolios (`src/app/[username]/page.tsx`).

### Consequences
* **Positive**: Enforces strict brand and security isolation between the platform landing surface and user portfolios without needing separate server deployments.
* **Negative**: Requires local `/etc/hosts` mapping (`dev.localhost`) for local development testing.

---

## ADR-002: Retention of Modular Monolith (Deferral of Monorepo and Microservices)

### Status
**Accepted**

### Context
Modulab is planned as an ecosystem of multiple developer products. However, today there is only **one active product** (Modulab Portfolio) alongside the platform gateway landing page. We evaluated whether to split the codebase immediately into a Turborepo monorepo (`apps/platform`, `apps/portfolio`, `packages/*`) or distributed microservices.

### Decision
**Keep the current Modular Monolith architecture in Phase 1**. Defer monorepo migration until **Product #2** is introduced, and defer microservices until independent scaling or organizational boundaries require them.

### Rationale
1. **Premature Complexity**: A monorepo workspace introduces multiple `package.json` files, package build pipelines, inter-package linking, and separate deployment orchestration without delivering tangible benefits for a single active product.
2. **Shared Data & Auth**: Modulab Portfolio and the platform gateway share the exact same MongoDB database, user identity model, and session mechanisms.
3. **Operational Efficiency**: A single Next.js build (`next build`) compiles all pages, API endpoints, proxy routing, and static assets in under 12 seconds with Turbopack.
4. **Clear Upgrade Path**: The internal module boundaries (`src/app/platform`, `src/app/portfolio`, `src/app/[username]`, `src/app/admin`, `src/models`, `src/lib`) are already cleanly separated. Extracting these into workspace packages during Phase 2 will be a straightforward structural refactor when warranted.

### Trigger for Evolution
* **Phase 2 (Monorepo)**: Triggered when development begins on a **second standalone product** (e.g. `docs.modulab.online` or `resume.modulab.online`).
* **Phase 3 (Microservices)**: Triggered if specific modules (e.g. media processing or global auth) require distinct deployment frequencies, independent autoscaling, or dedicated persistent datastores.

---

## ADR-003: Migration from Next.js Middleware to Next.js 16 `proxy.ts`

### Status
**Accepted**

### Context
Next.js 16 formally deprecated the `middleware.ts` file convention and renamed it to `proxy.ts` (with an exported `proxy` function) to better reflect its network-boundary role and prevent confusion with Express.js middleware.

### Decision
Migrate `src/middleware.ts` to [`src/proxy.ts`](file:///home/harish/Harish/Git/Modulab/src/proxy.ts), export the wrapped function as `proxy`, and preserve all matcher, authentication, and rewrite behaviors.

### Consequences
* **Positive**: Fully complies with Next.js 16 standards, eliminates deprecation warnings, and ensures future compatibility with Next.js Turbopack pipelines.
* **Negative**: None.

---

## ADR-004: JWT Session Management via Auth.js (NextAuth v5 Beta)

### Status
**Accepted**

### Context
The application requires session authentication that works seamlessly across edge routing (`src/proxy.ts`), server components, and Server Actions without database round-trips on every request.

### Decision
Use Auth.js (NextAuth v5 beta) with JSON Web Tokens (`strategy: "jwt"`).
* Configure lightweight edge-compatible checks in [`src/auth.config.ts`](file:///home/harish/Harish/Git/Modulab/src/auth.config.ts).
* Configure full Node.js database authorization and password comparison in [`src/auth.ts`](file:///home/harish/Harish/Git/Modulab/src/auth.ts).

### Consequences
* **Positive**: Edge proxy can verify authentication status without opening MongoDB connections. User credentials (`id`, `username`, `firstName`) are encoded in the signed JWT.
* **Negative**: Session revocation before token expiry requires token invalidation strategies.

---

## ADR-005: Single MongoDB Database with Tenant-Scoped Document Ownership

### Status
**Accepted**

### Context
We evaluated multi-tenant data storage strategies: separate databases per tenant, separate collections, or a single database with row-level/document-level tenant keys.

### Decision
Use a single MongoDB database (`portfolio`) with Mongoose schemas. Every entity ([`Project`](file:///home/harish/Harish/Git/Modulab/src/models/Project.ts), [`Profile`](file:///home/harish/Harish/Git/Modulab/src/models/Profile.ts), [`Skill`](file:///home/harish/Harish/Git/Modulab/src/models/Skill.ts), [`Category`](file:///home/harish/Harish/Git/Modulab/src/models/Category.ts), [`SkillCategory`](file:///home/harish/Harish/Git/Modulab/src/models/SkillCategory.ts)) contains a required `userId` reference to the [`User`](file:///home/harish/Harish/Git/Modulab/src/models/User.ts) document.

### Consequences
* **Positive**: Simple connection pooling via [`src/lib/db.ts`](file:///home/harish/Harish/Git/Modulab/src/lib/db.ts), straightforward queries, and minimal operational cost.
* **Negative**: Requires strict enforcement in all Server Actions and queries to scope by `session.user.id`.

---

## ADR-006: Hierarchical Cloudinary Storage with Signed Proxy Streaming

### Status
**Accepted**

### Context
Users upload project screenshots, profile pictures, and PDF/DOCX resumes. Raw public URLs for non-image assets (such as resumes) can trigger security blocks or CORS issues during client downloads.

### Decision
1. Organize Cloudinary media hierarchically: `Modulab/{username}/{category}` where category is `Profile_Photos`, `Resumes`, or `Project_Images`.
2. Apply automatic optimization (`f_auto,q_auto,w_...`) via [`getOptimizedImageUrl`](file:///home/harish/Harish/Git/Modulab/src/lib/cloudinary.ts#L38-L81).
3. Deliver downloadable files via [`/api/download`](file:///home/harish/Harish/Git/Modulab/src/app/api/download/route.ts), which signs Cloudinary URLs server-side and streams the binary buffer with proper `Content-Disposition` attachment headers.

### Consequences
* **Positive**: Prevents hotlinking/CORS failures, standardizes download file naming, and optimizes bandwidth.
* **Negative**: Streaming resumes through the Next.js server consumes a small amount of server compute and memory.

---

## ADR-007: Deterministic UTC Date Formatting for SSR/Hydration Stability

### Status
**Accepted**

### Context
Table views (such as `ProjectsTable.tsx`) format ISO timestamp strings (e.g. `project.createdAt`). Formatting timestamps using `toLocaleDateString()` without an explicit timezone caused server-rendered HTML (formatted in the server's UTC timezone) to mismatch client-rendered DOM (formatted in the client's local timezone), triggering React Hydration Error #418 for dates created near midnight boundaries.

### Decision
Created a centralized formatting utility [`formatDate`](file:///home/harish/Harish/Git/Modulab/src/lib/utils.ts#L28-L37) in `src/lib/utils.ts` configured with `timeZone: 'UTC'`. All date displays in tables and lists must use this deterministic helper.

### Consequences
* **Positive**: Completely eliminates hydration mismatches across all geographical timezones without resorting to `suppressHydrationWarning` or client-only mounting workarounds.
* **Negative**: Displayed dates reflect UTC calendar dates rather than the user's localized midnight offset.

---

## ADR-008: Formalization of Logical Business Domain Boundaries

### Status
**Accepted**

### Context
In Phase 1.5, we conducted a domain boundary audit to prepare Modulab for eventual multi-product expansion. We identified that although the application operates as a single modular monolith, code in some modules (such as Profile management) was directly mutating models owned by other domains (such as Identity's `User` model).

If left undisciplined, cross-domain direct imports create spaghetti dependencies that make future extraction into monorepo packages or microservices difficult and error-prone.

### Core Principle
> **"Ownership precedes extraction."**  
> A future microservice or package may only own data and mutations that already have a clearly established, isolated owner in the modular monolith. We do not extract code to fix broken boundaries; we establish clean boundaries first, and extract only when scale or business drivers demand it.

### Decision
1. **Establish Strict Domain Boundaries**: Formally categorize the codebase into 6 distinct logical domains:
   - Platform Gateway
   - Identity & Authentication
   - Developer Profile
   - Portfolio Content Management (CMS)
   - Public Portfolio Delivery Engine
   - Media & Asset Pipeline
2. **Enforce Single-Writer Rule**: Every Mongoose model has exactly one owning domain. Direct write operations (`findByIdAndUpdate`, `save`, `deleteOne`) on a model from outside its owning domain are strictly prohibited.
3. **Introduce In-Process Domain Boundary Helpers**: Cross-domain mutations must be executed through explicit domain helper functions located under `src/lib/domains/<domain>/` (e.g., [`src/lib/domains/identity/updateUserIdentity.ts`](file:///home/harish/Harish/Git/Modulab/src/lib/domains/identity/updateUserIdentity.ts)).
4. **Decouple Profile from User Model**: Refactored [`src/app/admin/profile/actions.ts`](file:///home/harish/Harish/Git/Modulab/src/app/admin/profile/actions.ts) and [`src/app/admin/profile/page.tsx`](file:///home/harish/Harish/Git/Modulab/src/app/admin/profile/page.tsx) so that profile workflows interact with User identity through `updateUserIdentity` and `getUserIdentity` rather than directly importing the `User` Mongoose model.

### Consequences
* **Positive**:
  - Enforces explicit contract boundaries in-process with zero network overhead.
  - Guarantees that replacing an in-process helper with an HTTP/gRPC client in Phase 2 or Phase 3 will require zero changes to the calling domain's business logic.
  - Eliminates accidental side effects across tenant identity and portfolio profile states.
* **Negative**:
  - Requires developers to define and maintain domain helper interfaces rather than writing inline Mongoose queries across modules.
