<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Modulab Portfolio — Developer Guide

This repository (`modulab-portfolio`) houses the Portfolio product module (`portfolio.modulab.online`). The Platform marketing gateway (`modulab.online`) lives in the separate `modulab-platform` repository.

## Key Invariants
- **Domain Boundaries**: Follow domain encapsulation in `src/lib/domains/`. Only the owning domain may mutate its Mongoose model.
- **Cross-Repo URLs**: Always use `process.env.NEXT_PUBLIC_PLATFORM_URL` or `process.env.NEXT_PUBLIC_PORTFOLIO_URL` rather than hardcoded domain names.
- **Public Portfolios**: Read queries MUST use the public portfolio query boundary (`@/lib/domains/public-portfolio`).
