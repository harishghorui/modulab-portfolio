# Modulab

Modulab is a high-performance, multi-tenant "Operating System for Developers." It serves as a unified platform where developers can manage and showcase their digital presence through various specialized modules, starting with a robust Portfolio CMS.

## 🚀 Architecture

Modulab uses a sophisticated subdomain-based routing strategy to separate the core platform brand from its individual products:

- **Platform (`modulab.online` / `localhost:3000`):** The main landing page and brand identity. Strictly handles platform-wide information and system routes.
- **Portfolio Product (`dev.modulab.online` / `dev.localhost:3000`):** The home for the Portfolio CMS. This is where user portfolios are served (e.g., `dev.modulab.online/username`) and where the landing page for the portfolio product lives.

## 🛠 Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS & Framer Motion (for high-fidelity animations)
- **Database:** MongoDB with Mongoose
- **Auth:** NextAuth.js (Auth.js)
- **Media:** Cloudinary (Image & Video Management)
- **Icons:** Lucide React & React Icons

## 📂 Project Structure

```text
src/
├── app/
│   ├── [username]/      # Dynamic user portfolio routes (Subdomain)
│   ├── admin/           # Admin dashboard for CMS
│   ├── platform/        # Root domain landing page
│   ├── portfolio/       # Subdomain landing page
│   └── api/             # Backend API routes
├── components/          # Shared UI & Admin components
├── lib/                 # Utility functions & DB config
├── models/              # Mongoose schemas
└── proxy.ts        # Advanced multi-tenant routing logic
```

## 🚥 Routing Rules

The `proxy.ts` enforces strict boundaries:
1. **Root Domain:** Only `/` (rewritten to `/platform`) and `/admin`, `/api`, `/login`, etc., are allowed. Other paths (like `/username`) return a 404.
2. **Subdomain (`dev.`):** The root `/` rewrites to `/portfolio`. Usernames are served directly at the root (e.g., `/harishghorui` -> `src/app/[username]/page.tsx`).

## 🛠 Development

### Prerequisites
- Node.js 18+
- MongoDB instance
- Cloudinary account

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/modulab.git
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables (`.env.local`):
   ```env
   MONGODB_URI=
   NEXTAUTH_SECRET=
   NEXTAUTH_URL=http://dev.localhost:3000
   CLOUDINARY_CLOUD_NAME=
   CLOUDINARY_API_KEY=
   CLOUDINARY_API_SECRET=
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

To test subdomains locally, you may need to map `dev.localhost` to `127.0.0.1` in your `/etc/hosts` file.

## 📄 License

Internal use only. Part of the Modulab ecosystem.
