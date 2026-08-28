# Project: Modulab Portfolio
## Tech Stack
- Next.js 16 (App Router)
- TypeScript
- Tailwind CSS
- MongoDB with Mongoose
- NextAuth.js v5 (Auth.js)
- Cloudinary

## Coding Rules
- Always use Functional Components.
- Use 'lucide-react' for general icons and Devicon CDN for tech stack icons.
- Use 'clsx' and 'tailwind-merge' (`cn()`) for class management.
- All API routes must use the standard response format: `{ success: boolean, data?: any, error?: string }`.
- Cross-repository links must use environment variables (`NEXT_PUBLIC_PLATFORM_URL`, `NEXT_PUBLIC_PORTFOLIO_URL`) rather than hardcoded domain strings.
- Respect domain boundaries in `src/lib/domains/` — adhere to the Single-Writer rule for Mongoose models.