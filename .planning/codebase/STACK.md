# Technology Stack

**Analysis Date:** 2026-03-02

## Languages

**Primary:**
- TypeScript 5.0.0 - Frontend and backend code, strict mode enabled
- JavaScript - Build config, scripts

**Secondary:**
- SQL - PostgreSQL database operations via Prisma ORM

## Runtime

**Environment:**
- Node.js 20 (Alpine) - Docker image: `node:20-alpine`
- Browser APIs - Web Speech API, IndexedDB (via localStorage fallback)

**Package Manager:**
- npm - Lockfile: `package-lock.json` present
- Postinstall script: `prisma generate` (generates database client)

## Frameworks

**Core:**
- Next.js 14.2.0 - Full-stack web framework, App Router, API routes
- React 18.3.0 - UI library

**Authentication & Database:**
- NextAuth.js 5.0.0-beta.25 - Auth framework with JWT sessions
- @auth/prisma-adapter 2.11.1 - NextAuth ↔ Prisma integration
- Prisma 6.19.2 - ORM for PostgreSQL
- @prisma/client 6.19.2 - Prisma runtime client

**AI & LLM:**
- @google/generative-ai 0.24.1 - Google Gemini API (fallback AI provider)

**Validation & Types:**
- Zod 3.23.0 - Runtime TypeScript schema validation

**Styling & CSS:**
- Tailwind CSS 3.4.0 - Utility-first CSS framework
- PostCSS 8.4.0 - CSS processor (required for Tailwind)
- Autoprefixer 10.4.0 - Browser vendor prefix auto-generation

**Testing:**
- Vitest 4.0.18 - Fast unit test framework (Jest-compatible)
- @testing-library/react 16.3.2 - React component testing
- @testing-library/jest-dom 6.9.1 - DOM matcher assertions
- jsdom 28.1.0 - DOM implementation for Node.js (test environment)

**Build & Dev:**
- tsx 4.21.0 - TypeScript executor (used for Prisma seed scripts)
- ESLint 8.0.0 - Linting
- eslint-config-next 14.2.0 - Next.js linting rules

**Security:**
- bcryptjs 3.0.3 - Password hashing for email/password auth

## Key Dependencies

**Critical:**
- next-auth 5.0.0-beta.25 - Core authentication infrastructure; jwt strategy with optional Prisma adapter
- @prisma/client 6.19.2 - Database client; optional (app degrades gracefully if DATABASE_URL absent)
- @google/generative-ai 0.24.1 - AI lesson generation (free tier with rate-limit fallback chain)

**Infrastructure:**
- Prisma 6.19.2 - Schema definition and migrations; runs `prisma migrate deploy` on app startup
- bcryptjs 3.0.3 - Credential provider password hashing
- Zod 3.23.0 - Request/response validation (API routes)

## Configuration

**Environment:**
- `.env.local` - Local development variables (not committed)
- `.env.local.example` - Template for env vars
- `.env.example` - Full configuration example for Docker/production

**Build:**
- `next.config.js` - Standalone output mode for Docker; PWA service worker headers
- `tsconfig.json` - Strict TypeScript, path alias `@/*` → root, excludes `backend`, `mobile`, `packages`
- `package.json` - Scripts: `dev` (Next.js dev), `build`, `start` (production), `test`, `lint`

**Docker:**
- `Dockerfile` - Multi-stage: Node 20 builder (esbuild), runner (standalone output)
- `docker-compose.yml` - PostgreSQL 15, MySQL 8.0 (legacy, not used), Nginx reverse proxy
- `docker-entrypoint.sh` - Runs migrations and seed on container start

## Platform Requirements

**Development:**
- Node.js v20 (recommended)
- npm 10+
- TypeScript 5.0+
- Next.js 14.2.0 setup

**Production:**
- Docker (Node 20 Alpine base)
- PostgreSQL 15+ (via docker-compose or external service)
- 512MB+ RAM minimum (Next.js standalone)
- HTTPS with valid SSL (production domains)

**Client/Browser:**
- Modern browser with Web Speech API support (for TTS)
- Service Worker support (PWA capabilities)
- IndexedDB or localStorage (progress caching)

## API Keys & Secrets

**Required for features:**
- `GEMINI_API_KEY` - Google AI (free tier, aistudio.google.com)
- `OPENROUTER_API_KEY` - Optional; OpenRouter cloud AI (takes priority over Gemini if set)

**Authentication:**
- `NEXTAUTH_SECRET` - JWT signing secret (generate: `openssl rand -base64 32`)
- `NEXTAUTH_URL` - Callback URL for auth

**Optional social auth:**
- `GOOGLE_CLIENT_ID` - OAuth app credential
- `GOOGLE_CLIENT_SECRET` - OAuth app credential

**Database:**
- `DATABASE_URL` - PostgreSQL connection string (optional; app runs without if absent)

---

*Stack analysis: 2026-03-02*
