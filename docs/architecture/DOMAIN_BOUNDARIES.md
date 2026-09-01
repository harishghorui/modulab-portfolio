# Modulab Portfolio Domain Boundaries Reference

> **Canonical Developer Guide**: Rules of engagement for module boundaries, data ownership, cross-domain imports, and in-process service helpers within the Modulab Portfolio (`modulab-portfolio`) modular monolith.

---

## 1. Domain Map & Architecture Overview

```mermaid
graph TD
    subgraph Layer1["1. External Platform"]
        PlatformDomain["Platform Gateway<br/>(modulab-platform repo)"]
    end

    subgraph Layer2["2. Core Domain Services"]
        IdentityDomain["Identity & Authentication Domain<br/>(User, /api/register, auth.ts)"]
        ProfileDomain["Developer Profile Domain<br/>(Profile, /admin/profile)"]
        CMSDomain["Portfolio Content CMS Domain<br/>(Project, Category, Skill, SkillCategory, /admin/*)"]
    end

    subgraph Layer3["3. Public Delivery Layer"]
        PublicRenderer["Public Portfolio Delivery Engine<br/>(portfolio.modulab.online/:username)"]
        PublicQueryBoundary["Public Portfolio Query Boundary<br/>(@/lib/domains/public-portfolio)"]
    end

    subgraph Layer4["4. Infrastructure Supporting Domain"]
        MediaDomain["Media & Asset Pipeline<br/>(Cloudinary, /api/download)"]
    end

    PlatformDomain -.->|Cross-repo link| PublicRenderer
    ProfileDomain -->|Calls updateUserIdentity()| IdentityDomain
    ProfileDomain --> MediaDomain
    CMSDomain --> MediaDomain
    PublicRenderer --> PublicQueryBoundary
    PublicQueryBoundary -->|Read Aggregation| IdentityDomain
    PublicQueryBoundary -->|Read Aggregation| ProfileDomain
    PublicQueryBoundary -->|Read Aggregation| CMSDomain
    PublicQueryBoundary -->|Signed Download Stream| MediaDomain
```

---

## 2. Domain Ownership Matrix

| Domain Name | Primary Responsibility | Owned Models | Owned Routes / Pages | Owned Storage / Infrastructure |
| :--- | :--- | :--- | :--- | :--- |
| **1. Identity & Authentication** | User credentials, registration, password hashing, JWT tokens, username reservation | [`User`](file:///home/harish/Harish/Git/Modulab/src/models/User.ts) | `/login`, `/api/register`, `/api/auth/*` | `users` MongoDB collection |
| **2. Developer Profile** | Developer bio, headline, avatar, resume lifecycle, social profiles | [`Profile`](file:///home/harish/Harish/Git/Modulab/src/models/Profile.ts) | `/admin/profile` | `profiles` MongoDB collection |
| **3. Portfolio Content CMS** | Portfolio project authoring, taxonomy categories, technical skill matrix, dashboard metrics | [`Project`](file:///home/harish/Harish/Git/Modulab/src/models/Project.ts), [`Category`](file:///home/harish/Harish/Git/Modulab/src/models/Category.ts), [`Skill`](file:///home/harish/Harish/Git/Modulab/src/models/Skill.ts), [`SkillCategory`](file:///home/harish/Harish/Git/Modulab/src/models/SkillCategory.ts) | `/admin`, `/admin/projects/*`, `/admin/categories`, `/admin/skills` | `projects`, `categories`, `skills`, `skillcategories` MongoDB collections |
| **4. Public Portfolio Delivery** | Read-optimized public rendering, dynamic SEO/OpenGraph tags, HTML sanitization | *None (Read Projection)* | `/[username]` | *None* (Stateless edge rendering) |
| **5. Media & Asset Pipeline** | Image optimization, CDN hierarchization, signed resume download stream | *None* | `/api/download`, `/api/v1/media/presign` | `Modulab/{username}/*` Cloudinary namespace |

---

## 3. Allowed vs. Prohibited Dependency Directions

```mermaid
flowchart LR
    subgraph Allowed["Allowed Dependency Flow"]
        direction TB
        AppRoutes["App Routes (e.g. /[username], /admin)"] --> DomainHelpers["src/lib/domains/* (Query & Mutation Helpers)"]
        DomainHelpers --> OwnedModels["src/models/* (Owned Models Only)"]
        DomainHelpers --> Libs["src/lib/* (dbConnect, utils, devicon)"]
    end

    subgraph Prohibited["Prohibited Dependency Flow (BANNED)"]
        direction TB
        BadAction["Action in Domain A (e.g. Profile)"] -.->|BANNED DIRECT MUTATION| ForeignModel["Model in Domain B (e.g. User)"]
        BadCMS["Action in CMS (e.g. Projects)"] -.->|BANNED DIRECT CLOUDINARY| DirectSDK["Cloudinary SDK in Business Action"]
        BadPublic["Public Page (src/app/[username])"] -.->|BANNED DIRECT PERSISTENCE ACCESS| DirectModels["Direct Mongoose Model Imports"]
    end
```

### Specific Import Rules

| Calling Location | Allowed Imports | Prohibited Imports |
| :--- | :--- | :--- |
| **`src/app/admin/profile/*`** | • `@/models/Profile`<br/>• `@/lib/domains/identity` (`updateUserIdentity`, `getUserIdentity`)<br/>• `@/lib/domains/profile` (`getProfileByUserId`)<br/>• `@/lib/domains/media` / `@/lib/domains/media/client`<br/>• `@/lib/utils` | ❌ `import User from '@/models/User'` *(Prohibited)*<br/>❌ Direct writes to `User` collection |
| **`src/app/admin/projects/*`** | • `@/models/Project`<br/>• `@/models/Category`<br/>• `@/models/Skill`<br/>• `@/lib/domains/media` / `@/lib/domains/media/client`<br/>• `@/lib/utils` | ❌ `@/models/User`<br/>❌ `@/models/Profile`<br/>❌ Direct mutations to non-CMS models |
| **`src/app/admin/skills/*`** | • `@/models/Skill`<br/>• `@/models/SkillCategory`<br/>• `@/lib/devicon`<br/>• `@/lib/utils` | ❌ `@/models/User`<br/>❌ `@/models/Project`<br/>❌ `@/models/Profile` |
| **`src/app/admin/categories/*`** | • `@/models/Category`<br/>• `@/lib/utils` | ❌ `@/models/User`<br/>❌ `@/models/Project` |
| **`src/app/[username]/*`** | • `@/lib/domains/public-portfolio` (`getPublicPortfolioData`)<br/>• `@/lib/utils`<br/>• `DOMPurify`<br/>• Shared UI presentation components | ❌ Direct `@/models/*` imports (`User`, `Profile`, `Project`, `Skill`, `SkillCategory`, `Category`)<br/>❌ `@/lib/db` (`dbConnect`)<br/>❌ Any database mutation (`save`, `update`, `delete`)<br/>❌ Server Actions |
| **`src/app/page.tsx`** | • Shared UI components (`@/components/ui/*`)<br/>• `@/lib/utils` | ❌ Any `@/models/*`<br/>❌ `@/lib/db`<br/>❌ Server Actions |


---

## 4. Cross-Domain Communication Rules

In Phase 1.5 of the Modulab architecture, all components run in the same process. To ensure that future service extraction is frictionless, follow these mandatory communication patterns:

### Rule 1: "Ownership Precedes Extraction"
Never perform a database write (`create`, `save`, `findByIdAndUpdate`, `deleteOne`) on a model from outside its owning domain.

### Rule 2: In-Process Domain Boundary Helpers
If Domain A requires an operation from Domain B:
1. Domain B defines an exported helper function under `src/lib/domains/<domainB>/`.
2. The helper performs validation, executes the database mutation within Domain B's scope, and returns a sanitized result `{ success: boolean, data?: any, error?: string }`.
3. Domain A imports and invokes the helper function.

### Rule 3: Direct Media Uploads & Binary Transport Decoupling
Business domains do not transport binary media or multi-megabyte Base64 strings through Server Actions. Upload authorization is obtained from the Media domain via `POST /api/v1/media/presign` and binary assets are uploaded directly to the configured media provider from the browser. Server Actions receive and validate only the resulting asset reference.

### Rule 4: Read & Query Boundary Isolation
Domain ownership applies to both persistence and access boundaries. A read-only consumer should not bypass the owning domain's published read/query contract merely because the domains are currently in the same process. In Phase 1.5, App Router pages and public delivery renderers must consume dedicated in-process query helpers (`@/lib/domains/public-portfolio`, `@/lib/domains/portfolio`, `@/lib/domains/profile`, `@/lib/domains/identity`) rather than directly importing foreign Mongoose models.

---

## 5. Code Examples: Compliant vs. Non-Compliant

### Example 1: Updating User Identity from the Profile Domain

#### ❌ Non-Compliant (Direct Model Coupling):
```typescript
// src/app/admin/profile/actions.ts
import User from '@/models/User'; // BANNED: Profile domain directly importing Identity model

export async function updateProfile(prevState: any, formData: FormData) {
  // Directly mutating another domain's database collection
  await User.findByIdAndUpdate(session.user.id, {
    firstName: formData.get('firstName'),
    lastName: formData.get('lastName'),
    username: formData.get('username'),
  });
}
```

#### ✅ Compliant (Domain Boundary Helper):
```typescript
// src/app/admin/profile/actions.ts
import { updateUserIdentity } from '@/lib/domains/identity'; // COMPLIANT: Explicit domain helper

export async function updateProfile(prevState: any, formData: FormData) {
  // Calling the Identity domain boundary
  const identityResult = await updateUserIdentity({
    userId: session.user.id,
    firstName: formData.get('firstName') as string,
    lastName: formData.get('lastName') as string,
    username: formData.get('username') as string,
  });

  if (!identityResult.success) {
    return { error: identityResult.error };
  }
  
  // Proceed with Profile model updates...
}
```

---

### Example 2: Checking Username Availability from Profile Form

#### ❌ Non-Compliant:
```typescript
// src/app/admin/profile/actions.ts
import User from '@/models/User';

export async function checkUsername(username: string) {
  const user = await User.findOne({ username }); // BANNED: Direct read query on User model
  return { available: !user };
}
```

#### ✅ Compliant:
```typescript
// src/app/admin/profile/actions.ts
import { checkUsernameAvailability } from '@/lib/domains/identity';

export async function checkUsername(username: string) {
  const isAvailable = await checkUsernameAvailability(username, session.user.id);
  return { available: isAvailable };
}
```

---

### Example 3: Public Portfolio Read Aggregation

#### ❌ Non-Compliant (Direct Mongoose Model Coupling):
```typescript
// src/app/[username]/page.tsx
import User from '@/models/User';
import Profile from '@/models/Profile';
import Project from '@/models/Project';
import Skill from '@/models/Skill';
import SkillCategory from '@/models/SkillCategory';
import Category from '@/models/Category';
import dbConnect from '@/lib/db';

export default async function PortfolioPage({ params }) {
  await dbConnect();
  // BANNED: Presentation layer directly importing 6 persistence models and querying DB
  const user = await User.findOne({ username: params.username });
  const projects = await Project.find({ userId: user._id }).populate('techStack');
  // ...
}
```

#### ✅ Compliant (Public Portfolio Query Boundary):
```typescript
// src/app/[username]/page.tsx
import { getPublicPortfolioData } from '@/lib/domains/public-portfolio'; // COMPLIANT: Canonical query helper
import { notFound } from 'next/navigation';

export default async function PortfolioPage({ params }) {
  const { username } = await params;
  const data = await getPublicPortfolioData(username);

  if (!data) {
    notFound();
  }

  return <PortfolioClient data={data} />;
}
```

---

## 6. Service Extraction Readiness & Target Contracts

| Domain | Extraction Readiness | Primary Blocker to Immediate Extraction | Future Target Service | Future Network Contract |
| :--- | :---: | :--- | :--- | :--- |
| **Platform Gateway** | **✅ Extracted** | None (Extracted to independent `modulab-platform` repository) | `modulab-platform` | Static CDN / Cross-domain links |
| **Identity & Auth** | **9.0 / 10** | In-process NextAuth session sharing | `identity-service` | `POST /api/v1/auth/register`<br/>`POST /api/v1/auth/login`<br/>`PATCH /api/v1/users/:id` |
| **Developer Profile** | **9.5 / 10** | In-process NextAuth session sharing | `profile-service` | `GET /api/v1/profiles/:userId`<br/>`PUT /api/v1/profiles/:userId` |
| **Portfolio CMS** | **9.0 / 10** | In-process NextAuth session sharing | `portfolio-service` | `GET /api/v1/projects`<br/>`POST /api/v1/projects`<br/>`GET /api/v1/skills` |
| **Public Delivery** | **9.5 / 10** | None (Query boundary established behind `getPublicPortfolioData`); ready for transition to `GET /api/v1/public/portfolios/:username` client | `portfolio-renderer` | Consumes `GET /api/v1/public/portfolios/:username` |
| **Media Pipeline** | **9.5 / 10** | In-process NextAuth session sharing | `media-service` | `POST /api/v1/media/presign`<br/>`GET /api/v1/media/download` |
