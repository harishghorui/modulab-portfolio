# Modulab Portfolio

Modulab Portfolio is a high-performance, multi-tenant Portfolio CMS and dynamic profile platform — the premier product module within the Modulab developer ecosystem.

- **Production Domain:** `dev.modulab.online`
- **Platform Gateway:** `modulab.online` (managed in `modulab-platform` repository)

## 🚀 Architecture

Modulab Portfolio operates as an independently deployable modular monolith with clean logical domain boundaries:

- **Portfolio Landing (`/`):** Showcase and onboarding for the Portfolio CMS product.
- **Admin Studio / CMS (`/admin`):** Authenticated workspace to manage projects, technical skills, taxonomy categories, and developer profile settings.
- **Dynamic Portfolio Engine (`/[username]`):** Server-rendered, SEO-optimized public portfolios for registered developers.
- **Authentication & Identity (`/login`, `/api/auth`, `/api/register`):** Multi-tenant credentials auth and identity management via Auth.js (NextAuth v5).
- **Media & Asset Pipeline (`/api/v1/media/presign`, `/api/download`):** Direct-to-Cloudinary presigned uploads and signed proxy asset downloads.

## 🛠 Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS & Framer Motion
- **Database:** MongoDB with Mongoose
- **Auth:** NextAuth.js v5 (Auth.js)
- **Media:** Cloudinary (Hierarchical tenant media storage)
- **Icons:** Lucide React & Devicon CDN

## 📂 Project Structure

```text
src/
├── app/
│   ├── page.tsx         # Portfolio product landing page
│   ├── [username]/      # Dynamic user portfolio routes
│   ├── admin/           # Admin dashboard & CMS manager
│   ├── login/           # Authentication & registration
│   └── api/             # Backend API routes (auth, media, register, download)
├── components/          # UI, Admin, and Presentation components
├── lib/
│   ├── db.ts            # Mongoose connection pool
│   ├── utils.ts         # Utility helpers & formatting
│   ├── devicon.ts       # Devicon CDN resolver
│   └── domains/         # Formal domain boundaries
│       ├── identity/    # Identity & user mutations
│       ├── profile/     # Developer profile queries
│       ├── portfolio/   # CMS queries & dashboard stats
│       ├── media/       # Upload signatures, transforms & validation
│       └── public-portfolio/ # Canonical public portfolio query boundary
├── models/              # Mongoose schemas (User, Profile, Project, Skill, Category, SkillCategory)
├── auth.ts              # NextAuth full configuration
├── auth.config.ts       # Edge auth callbacks
└── proxy.ts             # Auth routing & normalization proxy
```

## 🛠 Development

### Prerequisites
- Node.js 18+
- MongoDB instance
- Cloudinary account

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/harishghorui/modulab-portfolio.git
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables (`.env.local`):
   ```env
   MONGODB_URI=mongodb://localhost:27017/portfolio
   AUTH_SECRET=your-auth-secret
   CLOUDINARY_CLOUD_NAME=your-cloud-name
   CLOUDINARY_API_KEY=your-api-key
   CLOUDINARY_API_SECRET=your-api-secret
   NEXT_PUBLIC_PORTFOLIO_URL=http://localhost:3000
   NEXT_PUBLIC_PLATFORM_URL=https://modulab.online
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

## 🌐 Modulab Ecosystem

| Repository | Domain | Responsibility |
| :--- | :--- | :--- |
| **`modulab-platform`** | `modulab.online` | Brand landing, ecosystem overview, product discovery |
| **`modulab-portfolio`** | `dev.modulab.online` | Portfolio CMS, admin studio, dynamic public portfolios |

## 📄 License

Internal use only. Part of the Modulab ecosystem.
