---
name: systematic-debugging
description: 4-phase root cause debugging process for ShadowDrive AI. Covers API errors, TTS failures, iOS WebKit quirks, and Next.js server/client boundary issues.
---

# Systematic Debugging — ShadowDrive AI

Adapted from the Superpowers framework's systematic-debugging skill. This enforces a structured 4-phase process to find and fix the **root cause**, not just the symptom.

## When to Use This Skill
- The app shows a blank screen, crash, or 500 error
- The Gemini API returns unexpected responses (429, truncated JSON, timeout)
- Web Speech API fails silently on iOS Safari
- A component re-renders excessively or causes state loops
- Build passes but runtime crashes (stale `.next` cache)

## The 4-Phase Process

### Phase 1: Observe
- Read terminal logs (`npm run dev` output) for compilation errors
- Check browser console for client-side errors
- Look at the **exact HTTP status code** and response body
- Note the **exact time** the error occurs relative to user action

### Phase 2: Hypothesize
- List all possible causes (minimum 3)
- Rank by probability based on what changed most recently
- Common ShadowDrive causes:
  - Stale `.next` cache after editing `lib/gemini.ts`
  - AbortController/signal API incompatibility with SDK version
  - `useEffect` calling API on mount (infinite loop)
  - `maxOutputTokens` too low → truncated JSON → parse failure
  - Model quota exhaustion across independent model quotas

### Phase 3: Test
- **Isolate**: Test the specific subsystem in isolation (e.g., raw Node.js script for Gemini API)
- **Bisect**: If multiple changes, revert one at a time
- **Clean build**: `Remove-Item -Recurse .next; npx next build` to rule out cache
- **Direct API test**: `Invoke-WebRequest` to `/api/generate` with timing measurement

### Phase 4: Fix & Verify
- Fix the **root cause**, not the symptom
- Run `npx next build` (must exit with code 0)
- Test via browser tool or curl
- Confirm the fix doesn't break the offline fallback path

## ShadowDrive-Specific Debugging Checklist
```
[ ] Is `.env.local` present with a valid GEMINI_API_KEY?
[ ] Is the API key 39 characters long?
[ ] Does `npx next build` complete with 0 errors?
[ ] Is the `.next` cache stale? (Delete and rebuild)
[ ] Are all model candidates tried before giving up? (Check loop logic)
[ ] Is maxOutputTokens high enough for the JSON response? (≥1500)
[ ] Does the offline fallback fire correctly on API failure?
[ ] On iOS: Does Web Speech API have user-gesture gating?
```

## Anti-Patterns to Avoid
- ❌ Catching errors silently and serving fallback without logging
- ❌ Assuming 429 on one model means all models are rate-limited
- ❌ Retrying with exponential backoff in a driving app (user can't wait)
- ❌ Testing only the happy path; ignoring timeout and empty-response cases
