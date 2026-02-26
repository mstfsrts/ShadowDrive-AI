# ShadowDrive AI — Master Task List

## Phase 0: Project Scaffolding ✅
- [x] Next.js 14+ with App Router & Tailwind CSS
- [x] Project folder structure
- [x] `.env.local` with `GEMINI_API_KEY`
- [x] PWA manifest + service worker

## Phase 1: Backend & AI Integration ✅
- [x] Gemini API route with Dutch-Turkish prompt
- [x] Model fallback: `gemini-2.0-flash-lite → 2.0-flash → 2.5-flash → 2.5-pro`
- [x] 15s timeout, Zod validation, LocalStorage caching
- [x] Offline scenario bank (5 Turkish scenarios)

## Phase 2: Audio Engine ✅
- [x] `speechEngine.ts` — 6-phase loop with AbortSignal
- [x] Turkish TTS skip (reading pause instead of robotic voice)
- [x] `AudioPlayer.tsx` with giant driving-safe controls

## Phase 3: Frontend / UI ✅
- [x] Dual-engine dashboard: Courses | AI | Custom Text
- [x] Offline courses, AI generation, custom text input
- [x] UI localized to Turkish for end users

## Phase 4: PWA & Mobile ✅
- [x] manifest.json, sw.js, Apple touch icons

## Phase 5: Skills Integration ✅
- [x] `frontend-design` skill
- [x] `systematic-debugging` skill
- [x] `test-driven-development` skill

## Phase 6: QA & Testing ✅
- [x] Vitest test runner setup
- [x] Speech engine tests (7/7)
- [x] Scenario cache tests (5/5)
- [x] Offline scenario tests (4/4)
- [x] E2E: Mobile viewport (390×844)
- [x] E2E: Full flow — topic → generate → play → complete

## Phase 7: iOS Adaptation ✅
- [x] Safe area insets (notch + home indicator)
- [x] `viewport-fit: cover`, standalone mode CSS
- [x] Touch optimization (88px buttons, 44px chips)
- [x] iOS WebKit speech fixes (voice preload, double-cancel, visibility resume)
- [x] Body scroll lock during playback
- [ ] Performance: bundle optimization, lazy loading
- [ ] Haptic feedback via `navigator.vibrate()`

## Phase 8: Self-Hosted Backend (Planned)
- [ ] Docker + PostgreSQL setup
- [ ] Prisma ORM schema & migrations
- [ ] NextAuth.js v5 (Google OAuth + credentials)
- [ ] API routes: progress, favorites
- [ ] User profile page
- [ ] Progress tracking on lesson cards

## Phase 9: Polish & Optimization
- [ ] Bundle size optimization
- [ ] Lazy loading for non-critical components
- [ ] Haptic feedback
