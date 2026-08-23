# Modulab System Architecture

> **System Overview**: Comprehensive documentation of the Modulab platform, current product boundaries, domain routing, data ownership, authentication boundaries, and the planned evolution strategy.

---

## 1. System Context & Entity Boundaries

```mermaid
graph TD
    subgraph PlatformEcosystem["Modulab Platform Ecosystem (modulab.online)"]
        PlatformGateway["Platform Gateway (/platform)<br/>Brand, Mission, Product Directory"]
        UnifiedAuth["Platform Identity & Registration<br/>(/login, /api/register, NextAuth)"]
    end

    subgraph ProductPortfolio["Product #1: Modulab Portfolio (dev.modulab.online)"]
        PortfolioLanding["Portfolio Showcase (/portfolio)<br/>Product Marketing & Features"]
        PortfolioCMS["Portfolio Studio / CMS (/admin)<br/>Projects, Skills, Categories, Profile"]
        PublicRenderer["Dynamic Portfolio Engine (/[username])<br/>Public Tenant Portfolios"]
    end

    subgraph ExternalServices["External Infrastructure"]
        MongoDB[("MongoDB Database<br/>(Cluster0 / portfolio)")]
        Cloudinary[("Cloudinary Media CDN<br/>(Modulab/{username}/*)")]
    end

    PlatformGateway -.->|Cross-domain link| PortfolioLanding
    UnifiedAuth --> MongoDB
    PortfolioCMS --> MongoDB
    PortfolioCMS --> Cloudinary
    PublicRenderer --> MongoDB
    PublicRenderer --> Cloudinary
```

### Core Terminology & Boundaries

* **Modulab**: The parent brand and umbrella developer platform ("The Operating System for Developers"). It represents the broader ecosystem of developer tooling, modules, and identity.
* **Modulab Portfolio**: The first distinct product application built on top of the Modulab platform. It is a full-featured, multi-tenant Portfolio CMS and public profile generator.
* **Current Implementation**: A unified **Modular Monolith** built on Next.js 16 App Router, serving both the platform marketing surface (`modulab.online`) and the complete portfolio product (`dev.modulab.online`) from a single deployed codebase.

---

## 2. Domain & Subdomain Routing Architecture

The routing topology is managed at the edge through [`src/proxy.ts`](file:///home/harish/Harish/Git/Modulab/src/proxy.ts) and [`src/auth.config.ts`](file:///home/harish/Harish/Git/Modulab/src/auth.config.ts).

```mermaid
flowchart TD
    Req([Incoming HTTP Request]) --> Proxy["Proxy Router (src/proxy.ts)"]

    Proxy --> CheckHost{Hostname Check}

    CheckHost -->|modulab.online<br/>or localhost:3000| RootDomain["Apex / Platform Domain"]
    CheckHost -->|dev.modulab.online<br/>or dev.localhost:3000| DevDomain["Portfolio Product Subdomain"]

    RootDomain --> RRoot{Path}
    RRoot -->|/| RewritePlatform["Rewrite to /platform (Platform Landing)"]
    RRoot -->|/admin, /login, /api/*| AllowSystem["Pass Through to System Routes"]
    RRoot -->|Any other path| BlockRoot["Rewrite to /404 (Protects Apex Namespace)"]

    DevDomain --> SRoot{Path}
    SRoot -->|/| RewritePortfolio["Rewrite to /portfolio (Product Landing)"]
    SRoot -->|/admin, /login, /api/*| AllowSubSystem["Pass Through to CMS & Auth"]
    SRoot -->|/[username]| DynamicPortfolio["Resolve to src/app/[username]/page.tsx"]
```

### Domain Mapping & Responsibilities

| Environment | Host Header | Target Surface | Permitted Routes & Behavior |
| :--- | :--- | :--- | :--- |
| **Production** | `modulab.online` | **Platform Gateway** | • `/` rewrites to `/platform`<br/>• System routes (`/admin`, `/api/*`, `/login`, `/register`) pass through<br/>• Unmatched paths rewrite to `/404` to prevent user portfolio pollution on the apex domain |
| **Production** | `dev.modulab.online` | **Modulab Portfolio** | • `/` rewrites to `/portfolio` (Product landing page)<br/>• `/admin/*` hosts the Portfolio Studio CMS<br/>• `/[username]` serves dynamic user portfolios |
| **Development** | `localhost:3000` | **Local Platform** | Mirrors `modulab.online` behavior |
| **Development** | `dev.localhost:3000` | **Local Portfolio** | Mirrors `dev.modulab.online` behavior |

---

## 3. Major Application Modules

### 3.1 Platform Gateway (`src/app/platform/`)
* **Purpose**: Serves as the landing page for the overarching Modulab ecosystem.
* **Key Components**: Platform vision, multi-tenant node explanations, cross-product links to `https://dev.modulab.online`.
* **State**: Static, client-animated with Framer Motion.

### 3.2 Portfolio Product Landing (`src/app/portfolio/`)
* **Purpose**: Marketing and conversion page for the Modulab Portfolio product.
* **Key Components**: Feature highlights, technology stack overview, dashboard preview mockups, direct call-to-actions to `/login` and registration.

### 3.3 Dynamic Portfolio Engine (`src/app/[username]/`)
* **Purpose**: Server-rendered, highly optimized public portfolio page for any registered developer tenant.
* **Key Components**:
  * [`src/app/[username]/page.tsx`](file:///home/harish/Harish/Git/Modulab/src/app/%5Busername%5D/page.tsx): Server Component fetching user profile, categorized projects, and skills in parallel.
  * [`src/app/[username]/PortfolioClient.tsx`](file:///home/harish/Harish/Git/Modulab/src/app/%5Busername%5D/PortfolioClient.tsx): Client Component rendering hero, project filter tabs, modal dialogs, and responsive navigation.
  * Metadata Generator: Dynamically populates SEO `title` and `description` per tenant.

### 3.4 Portfolio Studio / CMS (`src/app/admin/`)
* **Purpose**: Authenticated dashboard where developers curate their professional identity.
* **Sub-Modules**:
  * **Dashboard (`/admin`)**: Aggregated metrics (total projects, featured count, profile completeness status, quick actions).
  * **Projects Manager (`/admin/projects`, `/admin/projects/new`, `/admin/projects/edit/[id]`)**: Full CRUD for projects, Cloudinary thumbnail uploads, slug validation, tech stack association, and rich-text descriptions.
  * **Categories Manager (`/admin/categories`)**: Dynamic category management for project taxonomy.
  * **Skills Manager (`/admin/skills`)**: Skill catalog management with integrated Devicon SVG search and category grouping.
  * **Profile Settings (`/admin/profile`)**: Bio, headline, social links, profile photo, and resume upload with proxy download capabilities.

### 3.5 Identity & Authentication Engine
* **Purpose**: Shared authentication provider across platform and product surfaces.
* **Implementation**: NextAuth.js v5 (`auth.ts`, `auth.config.ts`) using credentials provider with bcrypt password hashing.

### 3.6 Media & Asset Delivery Pipeline (`src/lib/cloudinary.ts`, `src/app/api/download/`)
* **Purpose**: Hierarchical Cloudinary image transformation and secure resume downloads.
* **Namespace**: `Modulab/{username}/{category}` where category is `Profile_Photos`, `Resumes`, or `Project_Images`.

---

## 4. Data Ownership & Schema Architecture

All persistence is managed in MongoDB via Mongoose schemas under [`src/models/`](file:///home/harish/Harish/Git/Modulab/src/models/).

```mermaid
erDiagram
    USER ||--o| PROFILE : "has one"
    USER ||--o{ PROJECT : "owns"
    USER ||--o{ SKILL : "owns"
    USER ||--o{ SKILL_CATEGORY : "owns"
    USER ||--o{ CATEGORY : "owns"
    
    PROJECT }o--o{ SKILL : "references techStack"
    PROJECT }o--o{ CATEGORY : "references category"
    SKILL }o--|| SKILL_CATEGORY : "grouped in"

    USER {
        ObjectId _id PK
        string username UK
        string email UK
        string firstName
        string lastName
        string password
        Date createdAt
    }

    PROFILE {
        ObjectId _id PK
        ObjectId userId FK,UK
        string headline
        string bio
        string image
        string resumeUrl
        object socialLinks
    }

    PROJECT {
        ObjectId _id PK
        ObjectId userId FK
        string title
        string slug UK
        string summary
        string description
        string image
        boolean featured
        ObjectId[] category FK
        ObjectId[] techStack FK
        Date createdAt
    }

    SKILL {
        ObjectId _id PK
        ObjectId userId FK
        string name
        string icon
        ObjectId category FK
    }

    SKILL_CATEGORY {
        ObjectId _id PK
        ObjectId userId FK
        string name
    }

    CATEGORY {
        ObjectId _id PK
        ObjectId userId FK
        string name
        string slug
    }
```

### Data Isolation & Ownership Rules
1. **User Identity Boundary**: The [`User`](file:///home/harish/Harish/Git/Modulab/src/models/User.ts) model acts as the tenant root. `username` is unique across the entire platform.
2. **Tenant Scoping**: All operational entities (`Project`, `Skill`, `Profile`, `Category`, `SkillCategory`) store a mandatory `userId` foreign key. Every database query in Server Actions and Route Handlers scopes strictly by `session.user.id`.
3. **Reserved Namespaces**: Usernames matching system routes (`admin`, `api`, `login`, `register`, `dashboard`, `portfolio`, `platform`) are strictly rejected during registration to prevent route hijacking on `dev.modulab.online/[username]`.

---

## 5. Authentication & Authorization Boundary

```mermaid
sequenceDiagram
    autonumber
    actor User as Client Browser
    participant Proxy as Edge Proxy (proxy.ts)
    participant AuthConfig as Auth Callback (auth.config.ts)
    participant ServerAction as Admin Action / API Route
    participant DB as MongoDB

    User->>Proxy: GET dev.modulab.online/admin/projects
    Proxy->>AuthConfig: authorized({ auth, request })
    alt Not Logged In
        AuthConfig-->>Proxy: return false (redirect to /login)
        Proxy-->>User: 307 Redirect to /login
    else Logged In on dev.* Subdomain
        AuthConfig-->>Proxy: return true
        Proxy->>ServerAction: Forward Request
        ServerAction->>DB: Query Projects where userId = session.user.id
        DB-->>ServerAction: Return Tenant Data
        ServerAction-->>User: Render HTML / JSON Response
    end
```

### Key Security Protocols
* **Subdomain Restriction**: Admin routes (`/admin/*`) and login routes (`/login`) are restricted exclusively to the `dev.` subdomain via `auth.config.ts`. Requests attempting to access admin functions directly on the root apex domain are blocked.
* **Server Action Authorization**: Every mutation server action ([`src/app/admin/projects/actions.ts`](file:///home/harish/Harish/Git/Modulab/src/app/admin/projects/actions.ts), [`src/app/admin/categories/actions.ts`](file:///home/harish/Harish/Git/Modulab/src/app/admin/categories/actions.ts), [`src/app/admin/skills/actions.ts`](file:///home/harish/Harish/Git/Modulab/src/app/admin/skills/actions.ts), [`src/app/admin/profile/actions.ts`](file:///home/harish/Harish/Git/Modulab/src/app/admin/profile/actions.ts)) invokes `await auth()` internally and rejects unauthenticated callers before executing queries.

---

## 6. Planned Architectural Evolution

```mermaid
flowchart TD
    subgraph Phase1["Phase 1: Modular Monolith (Current Architecture)"]
        MonoApp["Next.js 16 Application<br/>(Single Deployment)"]
        MonoApp --> M1["modulab.online (Platform Gateway)"]
        MonoApp --> M2["dev.modulab.online (Portfolio CMS & Tenant Portfolios)"]
        MonoDB[("Single MongoDB Database")]
        MonoApp --> MonoDB
    end

    subgraph Phase2["Phase 2: Multi-Product Monorepo (Trigger: Product #2 Launch)"]
        Turbo["Turborepo / pnpm Workspace"]
        Turbo --> AppPlatform["apps/platform (modulab.online)"]
        Turbo --> AppPortfolio["apps/portfolio (dev.modulab.online)"]
        Turbo --> AppNewProduct["apps/docs (docs.modulab.online)"]
        Turbo --> PkgDB["packages/database (Shared Mongoose / Prisma)"]
        Turbo --> PkgAuth["packages/auth (Shared Auth.js Config)"]
        Turbo --> PkgUI["packages/ui (Design System)"]
    end

    subgraph Phase3["Phase 3: Microservices Ecosystem (Trigger: High Scale & Domain Specialization)"]
        MicroAuth["Auth & Identity Service (OAuth / SSO)"]
        MicroPortfolio["Portfolio Engine & CMS Service"]
        MicroMedia["Media & Asset Pipeline Service"]
        MicroAnalytics["Ecosystem Analytics Service"]
        APIGateway["Global API Gateway / Edge Routing"]
        
        APIGateway --> MicroAuth
        APIGateway --> MicroPortfolio
        APIGateway --> MicroMedia
        APIGateway --> MicroAnalytics
    end

    Phase1 -->|Product #2 Introduced| Phase2
    Phase2 -->|Scale / Independent Deployment Needs| Phase3
```

### Evolution Stages & Decision Triggers

| Stage | Topology | Operational Model | Trigger Condition |
| :--- | :--- | :--- | :--- |
| **Phase 1 (Current)** | **Modular Monolith** | Single Next.js 16 repo, single database, edge proxy routing | Current baseline (1 platform gateway + 1 product). Minimal operational overhead. |
| **Phase 2 (Planned)** | **Multi-Product Monorepo** | Turborepo workspace separating apps (`platform`, `portfolio`, `docs`) while sharing packages (`db`, `auth`, `ui`) | When a **second distinct product module** is added to the Modulab ecosystem. |
| **Phase 3 (Future)** | **Microservices Ecosystem** | Distributed independently deployable services behind an API Gateway with dedicated databases | When individual services require independent scaling, distinct technology stacks, or separate team deployment lifecycles. |

---

## 7. Architectural Constraints & Invariants

1. **Subdomain Independence**: Public user portfolios must remain served at `dev.modulab.online/[username]` without path prefix collisions.
2. **Deterministic Hydration**: All dates rendered across server and client components must format with explicit `timeZone: 'UTC'` using [`formatDate`](file:///home/harish/Harish/Git/Modulab/src/lib/utils.ts#L28-L37).
3. **Data Integrity**: Database model names (`User`, `Profile`, `Project`, `Skill`, `Category`, `SkillCategory`) and Cloudinary storage paths (`Modulab/...`) must remain stable to prevent breaking existing data.
4. **Standard API Response Format**: All route handlers and server actions must conform to `{ success: boolean, data?: any, error?: string }`.
