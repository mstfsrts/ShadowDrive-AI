# External Integrations

**Analysis Date:** 2026-03-02

## APIs & External Services

**AI/LLM Providers:**
- Google Gemini API - Lesson generation (Dutch dialogue creation with CEFR-specific prompts)
  - SDK/Client: `@google/generative-ai` (v0.24.1)
  - Auth: `GEMINI_API_KEY` environment variable
  - Models: Fallback chain `gemini-2.0-flash-lite → gemini-2.0-flash → gemini-2.5-flash → gemini-2.5-pro`
  - Implementation: `lib/gemini.ts`
  - Endpoint: `app/api/generate/route.ts` (POST /api/generate)

- OpenRouter API - Cloud AI provider (optional, takes priority over Gemini)
  - SDK/Client: Fetch-based OpenAI-compatible API (`https://openrouter.ai/api/v1/chat/completions`)
  - Auth: `OPENROUTER_API_KEY` environment variable
  - Model: Configurable via `OPENROUTER_MODEL` (default: `qwen/qwen3-235b-a22b`)
  - Implementation: `lib/openrouter.ts`
  - Used by: `app/api/generate/route.ts` (primary choice if configured)

## Data Storage

**Databases:**
- PostgreSQL 15+ (production)
  - Provider: Self-hosted or managed (Dokploy, DigitalOcean, AWS RDS)
  - Connection: `DATABASE_URL` environment variable
  - Client: Prisma ORM (v6.19.2)
  - Schema: `prisma/schema.prisma`
  - Models: User, Account, Session (NextAuth), Progress, GeneratedScenario, Favorite, Course, Lesson, CustomLesson
  - Migrations: `prisma migrate deploy` (runs on app startup)
  - Seed: `prisma/seed.ts` (loads JSON course data into database)

**File Storage:**
- Local filesystem only - Dialogue JSON stored in database as JSONB
- Course data files: `data/courses/*.json` (4 JSON files: groene_boek, tweede_ronde, derde_ronde, goedbezig)

**Caching:**
- None - App stateless; progress cached client-side via progress endpoint
- Browser localStorage - Offline progress tracking (if DB unavailable)

## Authentication & Identity

**Auth Provider:**
- NextAuth.js 5.0.0-beta.25 - Custom implementation
  - Strategy: JWT (sessions stored in HttpOnly cookies, no DB session required)
  - Adapter: PrismaAdapter (optional, only if DATABASE_URL set)
  - Implementation: `auth.ts`

**Supported Methods:**
1. Email/Password (Credentials provider)
   - User lookup: Prisma User model by email
   - Password verification: bcryptjs (bcrypt.compare)
   - Password hash storage: `user.passwordHash` in database
   - Registration: `app/api/auth/register/route.ts` (POST /api/auth/register)

2. Google OAuth (if GOOGLE_CLIENT_ID/SECRET configured)
   - Provider: Google Cloud Console OAuth 2.0
   - Client: NextAuth Google provider
   - Account linking: PrismaAdapter Account model

**Session Management:**
- JWT tokens stored in HttpOnly cookies
- Token payload includes user ID for authorization
- Tokens validated on each API request via `auth()` helper

## Monitoring & Observability

**Error Tracking:**
- None - Console logging only for development (`lib/gemini.ts`, `lib/openrouter.ts`, API routes)
- Log levels: `error`, `warn` in production; `error`, `warn` in development

**Logs:**
- Server: Next.js default logging to stdout (Docker container logs)
- Client: Browser console (dev mode)
- No external log aggregation (ELK, Datadog, etc.)

## CI/CD & Deployment

**Hosting:**
- Docker standalone application (Next.js `output: 'standalone'`)
- Compatible with: Dokploy, Railway, DigitalOcean App Platform, AWS ECS, Render
- Reverse proxy: Nginx (optional, in docker-compose.yml)

**CI Pipeline:**
- None detected - Repository has no GitHub Actions, GitLab CI, or similar

**Build Process:**
- Next.js `npm run build` → standalone output (`/.next/standalone`)
- Docker: Multi-stage (deps layer, builder layer, runner layer)
- Entrypoint: `docker-entrypoint.sh` (migrations → seed → next start)

## Environment Configuration

**Required env vars (at minimum):**
- `GEMINI_API_KEY` or `OPENROUTER_API_KEY` - AI provider authentication

**Optional env vars:**
- `DATABASE_URL` - PostgreSQL connection (app degrades gracefully if absent)
- `NEXTAUTH_SECRET` - JWT signing secret (required if using authentication)
- `NEXTAUTH_URL` - Auth callback URL
- `GOOGLE_CLIENT_ID` - Google OAuth credential
- `GOOGLE_CLIENT_SECRET` - Google OAuth credential
- `OPENROUTER_API_KEY` - OpenRouter API key (alternative to Gemini)
- `OPENROUTER_MODEL` - OpenRouter model name (default: `qwen/qwen3-235b-a22b`)
- `NEXT_PUBLIC_API_URL` - Frontend-accessible backend API URL (build-time)
- `NODE_ENV` - `development` or `production`

**Secrets location:**
- `.env.local` - Development (not committed)
- `.env` - Production environment file (Docker env panel or file)
- No `.env` files committed to repository

## Webhooks & Callbacks

**Incoming:**
- None - App is API consumer only

**Outgoing:**
- None - No third-party webhooks or callbacks configured

## TTS & Speech Synthesis

**Web Speech API:**
- Browser native implementation (no external service)
- Voice selection: `lib/voiceSelector.ts` (best available voice per language)
- TTS engine: `lib/speechEngine.ts` (Promise-based async speak)
- Supported languages: Dutch (nl-NL) and Turkish (tr-TR) voices
- Rate adjustment: CEFR level-based playback speed

## Course Data

**Format:**
- JSON dialogue scenarios with metadata
- Structure: Scenario with title, language pair, dialogue lines (text + pause timing)

**Sources:**
- JSON files: `data/courses/groene_boek.json`, `data/courses/tweede_ronde.json`, etc.
- Database: Seeded from JSON via `prisma/seed.ts`
- API: `app/api/courses/route.ts` (GET /api/courses)

## API Routes & Endpoints

**Public (no auth required):**
- `GET /api/courses` - Fetch all courses and lessons
- `POST /api/generate` - Generate AI lesson (with topic + difficulty)
- `GET /api/health` - Health check

**Protected (auth required):**
- `POST /api/progress` - Save lesson progress
- `GET /api/progress` - Fetch user progress
- `GET/POST/DELETE /api/ai-lessons/[id]` - Manage saved AI lessons
- `GET/POST/DELETE /api/custom-lessons/[id]` - Manage custom lessons

**NextAuth:**
- `GET/POST /api/auth/[...nextauth]` - Auth endpoints (signin, signout, callback)
- `POST /api/auth/register` - Email registration

---

*Integration audit: 2026-03-02*
