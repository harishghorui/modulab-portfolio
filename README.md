# Modulab Portfolio

Modulab Portfolio is a high-performance, multi-tenant developer portfolio CMS and dynamic profile engine — the dedicated product module within the Modulab developer ecosystem.

---

## 🌐 Production URLs

- **Portfolio Product Module:** [`https://portfolio.modulab.online`](https://portfolio.modulab.online)
- **Modulab Platform Gateway:** [`https://modulab.online`](https://modulab.online) (managed in `modulab-platform` repository)

---

## ✨ Features

- **Product Landing Page:** High-converting SaaS landing page with responsive browser mockup previews and feature walkthroughs.
- **Admin Studio CMS (`/admin`):** Full-featured authenticated workspace to manage projects, technical skills, categories, and developer profile settings.
- **Dynamic Portfolio Engine (`/[username]`):** Fast server-side rendered (SSR), SEO-ready public developer portfolios with dynamic category filtering.
- **Rich Case Study Authoring:** TipTap rich-text editor for in-depth engineering documentation and architecture case studies.
- **Skills Taxonomy & Devicons:** Seamless cataloging of technical competencies with official CDN-powered Devicon brand vector icons.
- **Presigned Media Pipeline:** Direct client-side uploads to Cloudinary with tenant-isolated folders and signed resume stream downloads.
- **Light & Dark Theme Parity:** Automatic device system theme detection with zero theme flicker or layout shifts.

---

## 🛠 Tech Stack

- **Framework:** Next.js 16 (App Router with Turbopack)
- **Language:** TypeScript
- **UI & Animation:** React 19, Tailwind CSS v4, Framer Motion, Lucide React, Devicon CDN
- **Rich Text Editor:** TipTap Editor
- **Database:** MongoDB with Mongoose ODM
- **Authentication:** Auth.js (NextAuth v5 beta) with bcryptjs (12 salt rounds)
- **Media Delivery:** Cloudinary CDN

---

## 🏗 Architecture Overview

Modulab Portfolio operates as an independently deployable modular monolith:
- **Presentation Layer:** Next.js App Router with Server Components and dynamic Client Components.
- **Domain Services:** Logical domain boundaries (`identity`, `profile`, `portfolio`, `media`, `public-portfolio`) enforcing encapsulation and the Single-Writer rule.
- **Data Layer:** MongoDB connection pool with cached Mongoose schemas and strict TypeScript contracts.
- **Asset Pipeline:** Presigned client uploads directly to Cloudinary without backend memory buffering.

---

## 📂 Project Structure

```text
src/
├── app/
│   ├── page.tsx               # Portfolio product landing page
│   ├── [username]/            # Dynamic developer public portfolios
│   ├── admin/                 # Authenticated CMS Studio (projects, skills, profile, security)
│   ├── login/                 # Authentication & registration
│   └── api/                   # Backend API routes (auth, media presign, download)
├── components/                # UI, Admin, and Presentation components
├── config/                    # Site configuration and cross-repo URL resolution
├── lib/
│   ├── db.ts                  # Mongoose connection pool
│   ├── utils.ts               # Formatting, Cloudinary URL helpers, classnames
│   ├── devicon.ts             # Devicon CDN icon resolver
│   └── domains/               # Domain service boundaries (identity, profile, portfolio, media, public-portfolio)
├── models/                    # Mongoose schemas (User, Profile, Project, Skill, Category, SkillCategory)
├── auth.ts                    # NextAuth configuration
├── auth.config.ts             # Edge authentication callbacks
└── proxy.ts                   # Domain & authentication routing proxy
```

---

## 🚀 Development Setup

### Prerequisites
- Node.js 18.17+ or Node.js 20+
- MongoDB instance (Local or MongoDB Atlas)
- Cloudinary account

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/harishghorui/modulab-portfolio.git
   cd modulab-portfolio
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables (`.env.local`):**
   ```env
   MONGODB_URI=mongodb://localhost:27017/portfolio
   AUTH_SECRET=your-secure-auth-secret
   CLOUDINARY_CLOUD_NAME=your-cloud-name
   CLOUDINARY_API_KEY=your-api-key
   CLOUDINARY_API_SECRET=your-api-secret
   NEXT_PUBLIC_PORTFOLIO_URL=http://localhost:3000
   NEXT_PUBLIC_PLATFORM_URL=https://modulab.online
   ```

4. **Start the development server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## ⚙️ Commands

| Command | Action |
| :--- | :--- |
| `npm run dev` | Start development server with Turbopack |
| `npm run build` | Compile optimized production build |
| `npm run start` | Launch production HTTP server |
| `npm run lint` | Run ESLint across codebase |
| `git diff --check` | Verify formatting and check for trailing whitespace |

---

## 🚀 Deployment

Modulab Portfolio is optimized for deployment on Vercel or containerized cloud platforms. Ensure all production environment variables (`MONGODB_URI`, `AUTH_SECRET`, `CLOUDINARY_*`, `NEXT_PUBLIC_*`) are configured in your deployment settings.

---

## 🌐 Modulab Ecosystem

| Repository | Domain | Responsibility |
| :--- | :--- | :--- |
| **`modulab-platform`** | `modulab.online` | Brand landing, ecosystem gateway, product discovery |
| **`modulab-portfolio`** | `portfolio.modulab.online` | Portfolio CMS studio, dynamic developer portfolios |

---

## 📄 License

Internal use only. Part of the Modulab developer platform ecosystem.
