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
2. Apply automatic optimization (`f_auto,q_auto,w_...`) via [`getOptimizedImageUrl`](file:///home/harish/Harish/Git/Modulab/src/lib/domains/media/transform.ts#L20-L60).
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

---

## ADR-009: Presigned Direct Browser Uploads and Server Action Payload Decoupling

### Status
**Accepted**

### Context
Previous implementations transported multi-megabyte Base64 data strings through Next.js Server Actions for project thumbnails, profile avatars, and resumes. This created memory spikes on the application server, increased server action latency, and tightly coupled business actions to provider upload routines.

### Decision
1. **Presigned Upload Authorization (`POST /api/v1/media/presign`)**: The browser requests an upload signature specifying an authorized purpose (`project-thumbnail`, `profile-avatar`, `resume`). The server derives the target folder (`Modulab/{username}/{category}`) strictly from authenticated session state and returns a short-lived HMAC signature without exposing `CLOUDINARY_API_SECRET`.
2. **Direct Browser Upload**: The browser uploads the binary directly to Cloudinary via multipart POST (`uploadDirectToMediaProvider`) and receives the resulting `secure_url`.
3. **Asset Reference Validation**: Server Actions receive only the sanitized URL string and validate it against the authenticated user namespace via `validateAssetReference()` before persisting to MongoDB.
4. **Legacy Upload Cleanup**: Removed all Base64 / `FileReader` routines and server-side upload functions (`uploadProfilePhoto`, `uploadProjectThumbnail`, `uploadResumeDocument`).

### Consequences
* **Positive**:
  - Server Action payloads reduced from multi-megabyte Base64 strings to lightweight (<1KB) text references.
  - Eliminates image buffering on application servers.
  - Enforces strict multi-tenant namespace isolation at both signature generation and action validation stages.
* **Negative**:
  - If a user uploads an image but abandons the form before saving, the asset exists in Cloudinary without a referencing MongoDB record (reconcilable via periodic cleanup).

---

## ADR-010: Public Portfolio Query Boundary

### Status
**Accepted**

### Context
The Public Portfolio Delivery domain (`src/app/[username]/`) was initially allowed to perform direct Mongoose read queries across models owned by Identity (`User`), Developer Profile (`Profile`), and Portfolio CMS (`Project`, `Skill`, `SkillCategory`, `Category`). Although these operations were strictly read-only and did not violate single-writer rules, direct Mongoose coupling in the presentation layer blurred domain ownership, leaked BSON query mechanics into App Router rendering components, and weakened extraction readiness.

### Decision
Establish a dedicated in-process Public Portfolio query/read boundary under [`src/lib/domains/public-portfolio/`](file:///home/harish/Harish/Git/Modulab/src/lib/domains/public-portfolio/). The public renderer (`src/app/[username]/page.tsx`) consumes the boundary's canonical read contract `getPublicPortfolioData(username)` instead of directly importing or querying domain-owned persistence models.

Key architectural invariants:
1. **Strict Read-Only Delivery**: Public Delivery owns zero persistence models and performs zero mutations.
2. **Persistence Ownership Preserved**: Model ownership remains strictly with Identity (`User`), Developer Profile (`Profile`), and Portfolio CMS (`Project`, `Skill`, `Category`, `SkillCategory`).
3. **In-Process Modular Monolith Boundary**: The boundary coordinates database queries in-process within the modular monolith with zero network overhead. It is not an external microservice or HTTP endpoint.
4. **Clean Serialization**: The query helper returns plain, sanitized JavaScript objects safe for Server-to-Client component boundaries.
5. **Extraction Readiness**: Isolates the public renderer from Mongoose schemas, indexes, and connection pooling. In Phase 2/3, replacing the in-process helper with an HTTP client (`GET /api/v1/public/portfolios/:username`) will require zero changes to the public presentation layer.

### Consequences
* **Positive**:
  - Eliminates direct persistence coupling from the public presentation layer (`src/app/[username]/page.tsx`).
  - Enforces domain ownership boundaries for reads as well as writes.
  - Guarantees clean object serialization and isolates Mongoose document mechanics from React Server Components.
  - Provides a single canonical read contract for tenant portfolio projections.
* **Negative**:
  - Introduces an additional domain helper abstraction layer in the modular monolith.
  - Aggregation types and query contracts must be maintained as public presentation requirements evolve.

---

## ADR-011: Repository Separation — Platform and Portfolio

### Status
**Accepted**

### Context
Modulab is designed as an ecosystem of developer products with `modulab.online` as the platform brand and `dev.modulab.online` as the portfolio product. In Phase 1 & 1.5, both surfaces lived in a single Next.js modular monolith repository.

As the platform moves toward independent product deployment and lifecycle separation, hosting the static marketing site (`modulab-platform`) and the full-stack Portfolio CMS (`modulab-portfolio`) in independent repositories allows decoupled deployments, dedicated CI/CD pipelines, and simplified infrastructure without premature microservice overhead.

### Decision
1. **Separate Repositories**:
   - `modulab-platform`: Standalone static marketing site deployed at `modulab.online`.
   - `modulab-portfolio`: Full-stack modular monolith deployed at `dev.modulab.online`.
2. **Preserve Portfolio Architecture**:
   - Portfolio retains MongoDB connection, all 6 Mongoose models, NextAuth v5 credentials auth, Cloudinary media pipeline, and all 5 domain boundaries.
3. **Simplify Routing & Auth**:
   - `src/proxy.ts` removes root/dev domain branching; retains auth-gated redirects and static asset passthrough.
   - `src/auth.config.ts` removes hostname checks.
   - `src/app/page.tsx` directly serves the portfolio product landing page.
4. **Decouple Cross-Repository URLs**:
   - Replace hardcoded domain references with environment variables (`NEXT_PUBLIC_PLATFORM_URL`, `NEXT_PUBLIC_PORTFOLIO_URL`).

### Consequences
* **Positive**:
  - Independent deployment cycles and zero blast-radius between platform marketing updates and Portfolio CMS.
  - Significantly reduced complexity in `proxy.ts` and `auth.config.ts`.
  - Avoids premature microservice or monorepo tooling overhead.
* **Negative**:
  - Small branding assets (logos, favicons) are duplicated across repositories until shared package extraction is justified.

---

## ADR-012: Production Portfolio Domain Migration to `portfolio.modulab.online`

### Status
**Accepted**

### Context
Following the repository separation, the Portfolio product was initially deployed at `dev.modulab.online`. However, naming conventions dictate that the `dev.` subdomain is better suited for future staging/development environments, while product-specific subdomains (`portfolio.modulab.online`, `docs.modulab.online`) should represent production services.

### Decision
1. **Target Production Domain**: Migrate the canonical Portfolio production domain to `portfolio.modulab.online`.
2. **Reserve `dev.` Subdomain**: Reserve `dev.modulab.online` for future staging / development branch preview deployments.
3. **Seamless Backward Compatibility**: Configure a 308 permanent domain redirect from `dev.modulab.online` to `portfolio.modulab.online` during the transition period to ensure existing public developer portfolios (e.g. `dev.modulab.online/:username`) and bookmarks continue functioning.
4. **Environment-Driven URLs**: Continue managing cross-product URLs via `NEXT_PUBLIC_PORTFOLIO_URL` across both repositories without hardcoded domain couplings.

### Consequences
* **Positive**:
  - Clear product-centric domain taxonomy (`portfolio.modulab.online`).
  - Frees `dev.modulab.online` to serve as the unified development/staging environment for the Modulab ecosystem.
  - Zero downtime and full link preservation via Vercel 308 domain redirection.
* **Negative**:
  - Requires updating documentation, environment variables, and DNS records.
