# Architecture

**Analysis Date:** 2026-03-02

## Pattern Overview

**Overall:** Hybrid Monolith with API-Ready Separation

This is a Next.js 14 full-stack application with future backend separation design. Currently, all logic (client + server) runs in the monolith. The architecture cleanly separates concerns into:
- Pure logic (speech engine, scenarios) independent of framework
- Server routes (API handlers) that will migrate to Express backend
- Client UI components with minimal state management
- Centralized data access through `lib/` utilities

**Key Characteristics:**
- Server components handle auth/redirect logic; client components handle interaction
- Generator-based async streaming for playback (6-phase lesson loop)
- Content-agnostic progress tracking (localStorage for unsaved, database for persisted)
- Graceful degradation: app runs offline without database or Gemini API
- Database optional: features degrade to guest-only mode if `DATABASE_URL` not set

## Layers

**Presentation Layer (UI):**
- Purpose: Render dashboard tabs (Courses | AI | Custom), control playback, display progress
- Location: `components/` and `app/dashboard/page.tsx`
- Contains: React components (AudioPlayer, ScenarioForm, LessonPreview, SavedLessonCard, etc.)
- Depends on: `lib/` utilities, `types/dialogue`, TailwindCSS styling
- Used by: Browser user interactions

**Logic Layer (Pure Functions):**
- Purpose: Core algorithms decoupled from framework
- Location: `lib/speechEngine.ts`, `lib/resumablePlayback.ts`, `lib/voiceSelector.ts`
- Contains: Speech synthesis, pause calculations, playback phase generators
- Depends on: Web APIs (SpeechSynthesis), TypeScript types
- Used by: AudioPlayer component, playback orchestration

**Content Generation Layer:**
- Purpose: Create language learning scenarios via AI or offline data
- Location: `lib/gemini.ts`, `lib/openrouter.ts`, `lib/offlineScenarios.ts`
- Contains: LLM API calls with fallback chain, offline scenario library
- Depends on: Gemini/OpenRouter SDKs, JSON course data
- Used by: API routes (`/api/generate`), dashboard form handlers

**Data Access Layer:**
- Purpose: Abstract database and localStorage access
- Location: `lib/prisma.ts` (Prisma singleton), `lib/api.ts` (HTTP client for future backend)
- Contains: Prisma client instance, auth token storage
- Depends on: Prisma, browser localStorage
- Used by: API routes for persistence, authentication

**API Layer (Server Routes):**
- Purpose: Handle HTTP requests, enforce auth, coordinate data access
- Location: `app/api/`
- Contains: Route handlers for generate, progress, courses, lessons, health
- Depends on: NextAuth for auth, Prisma for persistence, logic layer for generation
- Used by: Client fetch calls, external integrations

**Authentication Layer:**
- Purpose: Session management and credential validation
- Location: `auth.ts` (NextAuth v5 config), `app/api/auth/[...nextauth]/route.ts`
- Contains: JWT strategy, Google OAuth provider, email/password credentials
- Depends on: NextAuth, bcryptjs, Prisma
- Used by: Protected API routes, page redirects

## Data Flow

**Lesson Playback Flow (Course/AI/Custom):**

1. User navigates to lesson (tap in dashboard)
2. Component retrieves scenario (from database, localStorage cache, or generates fresh)
3. AudioPlayer mounts → calls `playScenario()` generator with AbortSignal
4. Generator yields PlaybackStatus on each phase (target → pause → native → gap → repeat → pause)
5. UI updates phase display, progress badge
6. When lesson completes: status is persisted to database (if authenticated) or localStorage (if guest)

**AI Scenario Generation Flow:**

1. User fills ScenarioForm (topic, difficulty level)
2. Form POSTs to `/api/generate` with { topic, difficulty }
3. Route checks for OpenRouter (priority) → Gemini (fallback)
4. LLM returns JSON scenario matching ScenarioSchema
5. Scenario cached in sessionStorage + saved to database (if auth) or localStorage
6. Component receives scenario, mounts AudioPlayer, playback begins

**Progress Tracking Flow:**

1. Unsaved playback: progress stored in localStorage with key `sd_resume_*`
2. On completion: if authenticated, POST to `/api/progress` with courseId, lessonId, completed=true
3. Database increments completionCount, checks if completed (completionCount >= targetCount)
4. Progress badge updates (shows "Öğrenildi" when completed, "X/Y" for in-progress)
5. If user resumes: stored lastLineIndex retrieved, playback starts from that line

**State Management:**

- **Server state:** Persisted to PostgreSQL via Prisma (Progress, GeneratedScenario, CustomLesson tables)
- **Client state:** React component state (isPlaying, currentStatus, phase)
- **Ephemeral state:** localStorage for resume position and offline caches (scenarios, voice preferences)
- **Session state:** JWT in secure cookie (NextAuth)

## Key Abstractions

**PlaybackStatus + PlaybackPhase:**
- Purpose: Type-safe representation of current playback moment
- Examples: `{ lineIndex: 2, phase: 'target', text: 'Goedemorgen', nativeText: 'Günaydın' }`
- Pattern: Yielded by generator, consumed by UI to update display

**Scenario:**
- Purpose: Immutable dialogue structure (title, language pair, lines)
- Examples: See `types/dialogue.ts` — DialogueLine[], targetLang, nativeLang
- Pattern: Passed through entire playback pipeline; cached and persisted as JSON

**ResumableIdParams + getResumableId():**
- Purpose: Unified progress key across three content sources (course/ai/custom)
- Examples: `course:courseId:lessonId`, `ai:topic:level`, `custom:hash`
- Pattern: Used for localStorage keys and database unique constraint

**Difficulty (CEFRLevel):**
- Purpose: Language proficiency lever that adjusts speech rate and grammar complexity
- Examples: `A0-A1` (fastest), `A2`, `B1`, `B2`, `C1-C2` (slowest)
- Pattern: Passed to speakAsync() to set utterance.rate; influences LLM prompt guidelines

## Entry Points

**Root Page (`app/page.tsx`):**
- Location: Server component at `/`
- Triggers: Initial pageload
- Responsibilities: Check auth state, redirect authenticated users to `/dashboard`, show LandingPage for guests

**Dashboard Page (`app/dashboard/page.tsx`):**
- Location: Client component at `/dashboard`
- Triggers: Authenticated user navigation
- Responsibilities: Render three tabs (Courses, AI, Custom), manage lesson selection, orchestrate playback

**Generate Route (`app/api/generate/route.ts`):**
- Location: POST `/api/generate`
- Triggers: ScenarioForm submission
- Responsibilities: Validate request, call OpenRouter or Gemini, return Scenario JSON

**Progress Route (`app/api/progress/route.ts`):**
- Location: GET/POST `/api/progress`
- Triggers: Completion of lesson, resume button click
- Responsibilities: Fetch user progress, save progress record with spaced repetition tracking

**Auth Routes (`app/api/auth/[...nextauth]/route.ts`, `app/api/auth/register/route.ts`):**
- Location: NextAuth catch-all + custom register endpoint
- Triggers: User login/signup attempts
- Responsibilities: Credential validation, session creation, token management

## Error Handling

**Strategy:** Graceful degradation with specific error messages

**Patterns:**

1. **Database unavailable:** Return `503 Service Unavailable` from API routes; frontend falls back to guest-only mode
   - Example: `app/api/progress/route.ts` checks `if (!prisma) return 503`
   - User can still use AI and Custom lessons with localStorage persistence

2. **LLM rate-limited (429):** generateWithFallback() tries next model in chain
   - Each Gemini model has independent quota
   - Falls back to offline scenarios if all models exhausted
   - Example: `lib/gemini.ts` catches 429, logs, retries with exponential backoff

3. **Speech synthesis unavailable:** speakAsync() rejects; AudioPlayer catches and continues
   - On iOS, falls back to text display with timed pauses
   - Native language never spoken (by design); always text-only

4. **Missing environment variables:** Explicit error messages guide setup
   - Example: `lib/gemini.ts` throws if GEMINI_API_KEY not set
   - `.env.local.example` provides template

5. **Network errors on fetch:** Client-side fetch errors caught in components, show toast notification
   - Example: ScenarioForm wraps POST in try/catch, displays error toast

## Cross-Cutting Concerns

**Logging:** Console.log with semantic prefixes (e.g., `[SpeechEngine]`, `[Gemini]`, `[GET /api/courses]`)
- Development: All levels (log, warn, error)
- Production: Error/warn only (configured in `lib/prisma.ts`)

**Validation:** Zod schemas at API boundary
- Example: `RequestSchema` and `DialogueLineSchema` in `app/api/generate/route.ts`
- Ensures LLM responses match expected shape before storage

**Authentication:** NextAuth v5 with optional PrismaAdapter
- Supports: Google OAuth (if credentials set), Email/Password (always), Google OAuth + Credentials hybrid
- If DATABASE_URL not set: Adapter returns undefined, app uses JWT-only sessions (no persistence)

**Caching:** Three-layer strategy
- `lib/scenarioCache.ts`: sessionStorage for generation replay
- localStorage: `sd_resume_*` keys for playback position
- Database: Progress and GeneratedScenario tables for authenticated users

**Error tracking:** Console errors logged with semantic context; no external service integrated yet

---

*Architecture analysis: 2026-03-02*
