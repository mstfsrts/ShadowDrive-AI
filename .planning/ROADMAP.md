# Roadmap: ShadowDrive AI — Milestone 3: Major Restructuring & Feature Expansion

**Milestone goal:** Clean 3-folder architecture (frontend/backend/mobile), URL-based routing, natural TTS for offline lessons, speech recognition with error tracking, user progress panel, and cross-platform React Native mobile app.

**Requirements coverage:** 28/28 requirements mapped ✓

---

## Phase 9: Project Restructuring

**Goal:** Reorganize codebase into frontend/backend/mobile folder structure with npm workspaces.

**Requirements:** ARCH-01, ARCH-02, ARCH-03

**Success criteria:**
1. Root directory has only frontend/, backend/, mobile/, packages/shared/
2. `npm run build` (frontend) succeeds
3. `npm test` (frontend) all tests pass
4. Backend compiles without errors

**Plans:**
1. `workspace setup` — Root package.json → npm workspaces manager
2. `frontend migration` — Move app/, components/, lib/, types/ into frontend/
3. `prisma migration` — Move prisma/ into backend/prisma/
4. `config updates` — tsconfig, Docker, scripts

---

## Phase 10: URL-Based Routing + Resume Fix

**Goal:** Browser back/forward navigation works. Pause/resume continues from current position. "Dersin Başına Dön" button with confirmation.

**Requirements:** NAV-01, NAV-02, NAV-03, BUG-01

**Success criteria:**
1. Browser back/forward navigates between dashboard tabs and course levels
2. Each view has a unique URL (e.g., /dashboard/courses/delftse-methode)
3. Pause → Resume continues from current sentence (not from beginning)
4. "Dersin Başına Dön" button appears on pause, requires confirmation
5. All existing tests pass

**Plans:**
1. `dashboard layout` — Shared layout with tab navigation using Next.js Links
2. `route pages` — Convert _components/ views to route pages
3. `play page` — Dedicated /play/[type]/[id] playback page
4. `resume fix` — AudioPlayer.tsx uses currentLineIndexRef for resume
5. `restart button` — "Dersin Başına Dön" with ConfirmModal

---

## Phase 11: Natural TTS (ElevenLabs)

**Goal:** Offline lessons play with natural Dutch voice (ElevenLabs). Automatic detection of new/changed/deleted lessons.

**Requirements:** TTS-01, TTS-02, TTS-03

**Success criteria:**
1. Offline lesson plays with pre-recorded audio (not Web Speech API)
2. `npm run audio:check` reports missing/orphaned audio files
3. `npm run audio:generate` only generates new/changed files (incremental)
4. AI/Custom lessons still use Web Speech API as fallback

**Plans:**
1. `audio generator` — ElevenLabs script with hash-based incremental generation
2. `audio manifest` — manifest.json with path, duration, textHash per sentence
3. `speech engine update` — speakFromAudio() + playScenario() audio manifest support
4. `orphan detection` — Report/clean up audio files for deleted/changed lessons

---

## Phase 12: Speech Recognition + Error Tracking

**Goal:** User's pronunciation is checked during pause phases. Incorrect sentences tracked for later practice.

**Requirements:** SR-01, SR-02, SR-03, SR-04

**Success criteria:**
1. Chrome/Safari: mic activates during pause, shows correct/incorrect feedback
2. Firefox/unsupported: falls back to timed pause (no degradation)
3. Incorrect sentences saved to database (SpeechAttempt model)
4. 8 correct repetitions = sentence learned
5. Max 1 second additional wait for recognition startup

**Plans:**
1. `speech recognition module` — Web Speech Recognition API wrapper with browser detection
2. `text comparison` — Levenshtein-based fuzzy matching (threshold 0.7)
3. `engine integration` — playScenario() recognition during pause phases
4. `error tracking API` — POST /api/speech-attempts + GET mistakes/stats
5. `UI feedback` — Mic icon, green/red result display in AudioPlayer

---

## Phase 13: User Progress Panel

**Goal:** /dashboard/profile page showing study statistics, failed sentences, and practice lesson creation.

**Requirements:** PROF-01, PROF-02, PROF-03, PROF-04

**Success criteria:**
1. Overview cards show total lessons studied/completed/success rate
2. Per-course progress bars visible
3. Failed sentences table with sorting/filtering
4. "Create practice lesson" groups 8 sentences (configurable 4-16)

**Plans:**
1. `stats API` — Backend endpoints for overview, course-progress, mistakes
2. `profile page` — /dashboard/profile with overview cards
3. `course progress` — Expandable course list with progress bars
4. `mistake lessons` — Failed sentence grouping + practice lesson creation

---

## Phase 14: React Native Mobile App

**Goal:** iOS + Android app with same UI/colors as web, all features working.

**Requirements:** MOB-01 through MOB-07, MOB-SR-01

**Success criteria:**
1. Login with email/password on iOS + Android
2. Course playback with pre-recorded audio (offline) and expo-speech (AI/Custom)
3. Speech recognition via @react-native-voice/voice
4. Progress syncs across web and mobile
5. "Dersin Başına Dön" button works on mobile

**Plans:**
1. `expo setup` — Create Expo app with NativeWind, same color tokens
2. `mobile auth` — Login screen, expo-secure-store for JWT
3. `mobile screens` — Tabs (Courses/AI/Custom/Profile) mirroring web
4. `mobile playback` — AudioPlayer with pre-recorded audio + expo-speech fallback
5. `mobile recognition` — @react-native-voice/voice integration

---

## Phase 15: Infrastructure & Production Deployment

**Goal:** Full stack deployable on Dokploy with docker-compose.

**Requirements:** INFRA-01 through INFRA-05, INT-01 through INT-04

**Success criteria:**
1. `docker-compose up` starts all services
2. Nginx routes correctly
3. End-to-end: login → generate → play → check progress
4. Rate limiting works for both web and mobile

**Plans:**
1. `docker-compose update` — All services (frontend, backend, Redis, nginx)
2. `nginx config` — Routing rules
3. `env documentation` — .env.example
4. `integration test` — E2E flow verification

---
*Roadmap created: 2026-03-09*
*Milestone: 3 — Major Restructuring & Feature Expansion*
*Phases: 9-15*
