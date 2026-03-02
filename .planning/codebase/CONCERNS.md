# Codebase Concerns

**Analysis Date:** 2026-03-02

## Tech Debt

**Oversized dashboard component (1373 lines):**
- Issue: `app/dashboard/page.tsx` has grown to 1373 lines, mixing state management, event handling, and rendering
- Files: `app/dashboard/page.tsx`
- Impact: Difficult to maintain, test, and reason about; potential prop-drilling issues; slow re-renders when any state changes
- Fix approach: Extract tab components (CoursesTab, AITab, CustomTab) into separate files; move state hooks into custom hooks (useCourseNavigation, useAIScenario, useCustomLesson); separate progress management logic into a dedicated hook

**Unideal speech synthesis fallback:**
- Issue: Native language (Turkish) is never spoken via TTS, only displayed as text with estimated reading time (1500ms + 60ms per character). This hardcoded estimate may not match actual user reading ability
- Files: `lib/speechEngine.ts` (lines 189-204)
- Impact: Poor UX for learners with dyslexia or reading difficulties; pause duration doesn't scale with actual comprehension
- Fix approach: Add optional per-learner reading speed setting (WPM-based); detect language support earlier and gracefully skip TTS-less languages

**Gemini API rate-limit handling is brittle:**
- Issue: When all models are rate-limited (429), error message doesn't distinguish between "quota exhausted" vs "temporary spike". UI shows generic "wait a few minutes" for both
- Files: `lib/gemini.ts` (lines 103-107)
- Impact: Users may give up too early; no guidance on checking quota or trying tomorrow
- Fix approach: Add rate-limit headers parsing (Retry-After); track per-model rate-limit windows; queue requests when approaching quota

**TopicHash collision risk for AI lessons:**
- Issue: `topicHash = "${userId}:${topic}:${Date.now()}"` assumes Date.now() uniqueness, but rapid successive requests could collide
- Files: `app/api/ai-lessons/route.ts` (line 52)
- Impact: Duplicate topics within seconds could overwrite each other in cache/deduplication logic
- Fix approach: Use UUID v4 or cryptographic nonce instead of Date.now(); add uniqueness constraint at DB level

**Mobile app unfinished (TODO marker):**
- Issue: `mobile/app/index.tsx` has `// TODO: Navigate to courses or AI generation` with no implementation
- Files: `mobile/app/index.tsx` (line 17)
- Impact: Mobile app is non-functional; button press does nothing; not suitable for release
- Fix approach: Implement navigation to course browser and AI generation screens; sync authentication with web app

## Known Bugs

**iOS 17+ speech synthesis queue not clearing on double-cancel:**
- Symptoms: User stops playback, but utterance continues speaking in background; pause/resume doesn't sync with actual speech state
- Files: `lib/speechEngine.ts` (lines 100-105)
- Trigger: On iOS 17+, call cancelSpeech() once; speech may still play; second cancel() needed
- Workaround: Code includes 50ms setTimeout workaround (lines 102-104), but this is not guaranteed to work on all iOS versions

**Speech synthesis doesn't resume when app returns from background (iOS):**
- Symptoms: Playback pauses when user switches apps; visibilitychange listener calls resume(), but speech may have been cancelled
- Files: `lib/speechEngine.ts` (lines 144-150)
- Trigger: On iOS, press home while lesson playing; speech stops; return to app
- Workaround: None; app returns to pause state

**Progress display shows incomplete data when DB is not configured:**
- Symptoms: If DATABASE_URL is not set, GET /api/progress returns empty array; UI shows 0 completions for all lessons
- Files: `app/api/progress/route.ts` (line 16), `app/api/ai-lessons/route.ts` (line 10)
- Trigger: Run without DATABASE_URL env var
- Workaround: Lessons fall back to localStorage for AI/custom, but course progress is lost

**GeneratedScenario.userId can be null:**
- Symptoms: If user deletes their account, orphaned scenarios remain with userId=null (due to SetNull in schema)
- Files: `prisma/schema.prisma` (line 103)
- Trigger: User account deletion cascades to CustomLesson and Favorite, but leaves GeneratedScenario orphaned
- Workaround: None; manual cleanup query needed: `DELETE FROM "GeneratedScenario" WHERE "userId" IS NULL`

## Security Considerations

**NextAuth adapter disabled if DATABASE_URL missing:**
- Risk: In guest-only mode (no DATABASE_URL), PrismaAdapter is undefined; credentials auth still checks DB. If attacker can forge credentials, they may bypass auth
- Files: `auth.ts` (lines 13-20, 42-59)
- Current mitigation: getPrisma() checks DATABASE_URL and returns null; Credentials.authorize() returns null if prisma is null; all DB-dependent routes check getPrisma()
- Recommendations: Add explicit error on LOGIN if DB is required but not configured; don't silently allow login to fail

**API endpoints check user ownership after data fetch:**
- Risk: If userId/ownership check fails AFTER database operation, data may be partially modified
- Files: `app/api/ai-lessons/[id]/route.ts` (lines 21-24), `app/api/custom-lessons/[id]/route.ts` (lines 21-24)
- Current mitigation: Ownership check happens before DELETE/PATCH operations
- Recommendations: Use database constraints (`UNIQUE (userId, id)` at table level) to prevent accidental data leakage

**Zod validation uses .safeParse() but doesn't log failures:**
- Risk: Malformed requests are silently rejected with 400; no insight into attack patterns
- Files: `app/api/generate/route.ts` (lines 141-146)
- Current mitigation: Details are returned in error response (may expose schema)
- Recommendations: Log failed validations at WARN level; return generic "Invalid request" to client without details

**GEMINI_API_KEY logged during initialization:**
- Risk: Key length is logged (lines 24 in lib/gemini.ts), which is safe, but key presence is logged in production
- Files: `lib/gemini.ts` (lines 22-24)
- Current mitigation: Only length is logged, not the actual key
- Recommendations: Use redacted logging; only log "Key configured" without length in production

## Performance Bottlenecks

**Dashboard re-renders on every playback phase change:**
- Problem: AudioPlayer yields status on every phase transition; parent dashboard re-renders entire tree on currentStatus state change
- Files: `app/dashboard/page.tsx` (renders on phase changes), `components/AudioPlayer.tsx` (yields frequently)
- Cause: StatusBar and phrase display are in same component; both update on phase, even if only one needs update
- Improvement path: Memoize child components (React.memo for StatusBar); separate playback UI into controlled sub-component; consider Context API for playback state

**Speech synthesis picks voice on every utterance:**
- Problem: getBestVoice(lang) called for every line (6-8+ times per lesson)
- Files: `lib/speechEngine.ts` (line 46), `lib/voiceSelector.ts`
- Cause: Voice selection is O(n) search through all available voices
- Improvement path: Cache voice reference at playback start; memoize getBestVoice() with language key

**Prisma schema has no pagination on saved lessons list:**
- Problem: GET /api/ai-lessons and /api/custom-lessons return all records; no cursor-based pagination
- Files: `app/api/ai-lessons/route.ts` (lines 16-20), `app/api/custom-lessons/route.ts` (lines 16-19)
- Cause: User with 1000+ saved lessons will fetch 1MB+ of JSON
- Improvement path: Add `take` and `cursor` parameters; limit to 50 per page by default; implement infinite scroll

**Large Prisma seed file (806 lines):**
- Problem: `prisma/seed.ts` loads 4 JSON course files inline; esbuild bundles them into 500KB+ output
- Files: `prisma/seed.ts`
- Cause: All course data is bundled at container startup
- Improvement path: Move course JSON to separate seeding directory; stream from file instead of inline JSON; consider lazy-loading from S3

## Fragile Areas

**AudioPlayer cleanup on unmount:**
- Files: `components/AudioPlayer.tsx` (lines 31-37)
- Why fragile: Try-catch silently ignores cleanup errors; if cancelSpeech() throws, visibility listener isn't removed; app body classList may stay dirty
- Safe modification: Separate cleanup into try-finally block; log errors at DEBUG level; use optional chaining for DOM operations
- Test coverage: No tests for cleanup lifecycle; edge case where cleanup is called multiple times is untested

**Speech synthesis abort signal semantics:**
- Files: `lib/speechEngine.ts` (lines 78-92), `lib/speechEngine.ts` (lines 127-253)
- Why fragile: AbortSignal usage is correct, but speakAsync() resolves immediately on 'interrupted'/'canceled' (line 64), which may hide real errors
- Safe modification: Distinguish between "user canceled" (expected) and "speech synthesis error" (should log); return error code instead of success
- Test coverage: No test for error cases; timeout handling is untested

**Resume prompt modal state synchronization:**
- Files: `app/dashboard/page.tsx` (resumeState handling), `components/ResumePromptModal.tsx`
- Why fragile: If user dismisses modal and navigates away, resumeState is stale; if page is refreshed, resumeState is lost
- Safe modification: Persist resumeState to sessionStorage; add guard in handleBack to validate resumable ID exists
- Test coverage: No tests for modal dismiss flow; race condition if user clicks Back while modal is open

**Prisma singleton global reference:**
- Files: `lib/prisma.ts` (lines 9-25)
- Why fragile: `globalThis.prisma` is never disconnected; in development, module hot-reload creates new instances but old ones remain in memory
- Safe modification: Add explicit disconnect on app shutdown; implement reference counting for dev mode; add health check
- Test coverage: No tests for connection lifecycle; no tests for hot-reload in dev

## Scaling Limits

**localStorage storage for AI/custom lesson progress:**
- Current capacity: localStorage is typically 5-10MB; progress entries are ~500 bytes each; limit is ~10,000 lessons
- Limit: Desktop browsers vary (5-50MB), mobile is smaller; user with 500+ saved lessons may hit quota
- Scaling path: Migrate to IndexedDB for larger capacity; add quota warning when >80% full; implement cleanup of old progress entries

**No index on Progress.completionCount or targetCount:**
- Current capacity: Queries filter by userId (indexed), but spaced repetition reports (lessons with completionCount < targetCount) require full table scan
- Limit: With 1M+ progress records, report generation becomes O(n)
- Scaling path: Add composite index `(userId, completed, completionCount, targetCount)`; add denormalized "masteredCount" to User table

**Gemini API fallback chain blocks on each model failure:**
- Current capacity: 4 models in fallback list; ~15s timeout per model = 60s worst case
- Limit: If all models are rate-limited, user waits 60s for error message
- Scaling path: Use parallel fetch with Promise.race() instead of sequential; implement request queuing with exponential backoff; cache successful model choice for 24h

**No rate limiting on API endpoints:**
- Current capacity: POST /api/generate has no rate limit; user can spam generation requests
- Limit: With 100 users hitting generate simultaneously, Gemini quota exhausts quickly
- Scaling path: Add Redis-based rate limiter (per user, 5 requests/min); queue excess requests with delay; charge against usage quota

## Scaling Limits (continued)

**Dockerfile builds with all source code:**
- Current capacity: Docker image includes Next.js source, node_modules, and prisma migrations; final image ~900MB
- Limit: With many Dokploy deployments, storage costs and pull time increase
- Scaling path: Use multi-stage build with .dockerignore (filter out .next/cache, test files); strip node_modules post-build using prune

## Dependencies at Risk

**NextAuth v5.0.0-beta.25 (unstable release):**
- Risk: Beta software may have breaking API changes; may not be suitable for production
- Impact: Authentication may break on minor updates; missing security patches if beta is abandoned
- Migration plan: Plan upgrade path to v5.0.0-stable when released; consider pinning to v5.0.0-beta.x instead of caret

**next-auth PrismaAdapter dynamic require:**
- Risk: `require('@auth/prisma-adapter')` at runtime is unusual; bundlers may not trace it correctly; fails silently if module is missing
- Files: `auth.ts` (line 19)
- Impact: ESLint warning; potential issues in monorepo/compiled builds
- Migration plan: Use conditional import syntax or move to top-level import with optional chaining

**Prisma v6.19.2 on unstable features:**
- Risk: Prisma v6 is recent; some features (full-text search, json filtering) are still marked "Preview"
- Impact: May break in v6.20.0 if API changes
- Migration plan: Monitor Prisma changelog; avoid using Preview features in high-traffic code paths; test major version upgrades in CI before deploying

## Missing Critical Features

**No offline-first progress sync:**
- Problem: If user loses connection, progress saved to localStorage is not synced when online
- Blocks: Users on spotty mobile networks may lose progress data; sync strategy is all-or-nothing
- Impact: User frustration; data loss on mobile devices

**No email verification for Credentials auth:**
- Problem: Password registration doesn't verify email; user can register with fake email
- Blocks: Account recovery is impossible; email-based notifications can't be implemented
- Impact: Spam accounts; no email channel for notifications

**No password reset flow:**
- Problem: If user forgets password, no way to reset
- Blocks: Users are locked out; admins can't help users
- Impact: Account abandonment; support burden

**No analytics or telemetry:**
- Problem: No tracking of user engagement (lessons started, completed, time spent)
- Blocks: Can't measure feature adoption; can't identify content gaps
- Impact: Product decisions are blind; can't prioritize improvements

## Test Coverage Gaps

**No tests for speech synthesis on different languages:**
- What's not tested: getBestVoice() behavior on locales without voices; fallback when nativeHasVoice is false
- Files: `lib/voiceSelector.ts`, `lib/speechEngine.ts`
- Risk: Browser voice list varies by OS/version; code may work on dev machine but fail on user devices
- Priority: High (affects core playback experience)

**No tests for Prisma singleton in hot-reload scenarios:**
- What's not tested: Module hot-reload creates multiple PrismaClient instances; cleanup behavior
- Files: `lib/prisma.ts`
- Risk: Memory leaks in development; connection pool exhaustion
- Priority: Medium (dev-only, but impacts productivity)

**No tests for API error handling when DATABASE_URL is missing:**
- What's not tested: Fallback behavior when DB is not configured; guest-only mode edge cases
- Files: `app/api/progress/route.ts`, `app/api/ai-lessons/route.ts`
- Risk: Edge case where DB is configured on some endpoints but not others
- Priority: Medium (affects guest mode reliability)

**No tests for resumableId hashing collisions:**
- What's not tested: hashScenario() with similar scenarios; custom lesson with identical title/content
- Files: `lib/resumablePlayback.ts` (lines 43-49)
- Risk: Hash collision could cause progress to be shared between lessons
- Priority: Medium (affects progress tracking)

**No end-to-end tests for complete lesson flow:**
- What's not tested: Generate AI lesson → Save → Playback → Complete → Resume → Verify progress
- Files: Multiple components
- Risk: Integration breakage when components are updated
- Priority: High (affects user-facing feature)

**No tests for OpenRouter thinking model output stripping:**
- What's not tested: Qwen3 thinking tokens are correctly removed; edge cases with nested `<think>` tags
- Files: `lib/openrouter.ts` (line 65)
- Risk: Thinking tokens leak into generated scenarios
- Priority: Medium (affects output quality)

**No integration tests for API endpoints with auth:**
- What's not tested: Unauthorized requests return 401; ownership checks prevent cross-user access
- Files: `app/api/ai-lessons/[id]/route.ts`, `app/api/custom-lessons/[id]/route.ts`
- Risk: Security regression; unauthorized access not caught in development
- Priority: High (affects user data protection)

---

*Concerns audit: 2026-03-02*
