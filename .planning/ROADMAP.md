# Roadmap: ShadowDrive AI — Milestone 2: Full Modular System

**Milestone goal:** A fully modular production-ready system: Next.js frontend + Express backend + PostgreSQL + React Native mobile (iOS + Android), deployed on Dokploy.

**Requirements coverage:** 16/16 v1 requirements ✓

---

## Phase 9: React Native Mobile App

**Goal:** Users can access all lesson types and features on iOS and Android via React Native Expo.

**Requirements:** MOB-01, MOB-02, MOB-03, MOB-04, MOB-05, MOB-06, MOB-07

**Success criteria:**
1. User can log in with email/password on iOS simulator and Android emulator
2. Course playback with expo-speech TTS works (Dutch + Turkish voices, 6-phase loop)
3. AI lesson generation calls backend API and returns playable scenario
4. Saved AI lessons and custom lessons visible and playable from mobile
5. Progress saved from mobile reflects in web dashboard after refresh

**Plans:**
1. `expo-speech integration` — speechEngine.ts mobile version using expo-speech, Dutch/Turkish voice selection
2. `mobile auth flow` — login screen, JWT storage (SecureStore), API client (lib/api.ts port)
3. `mobile lesson screens` — Courses tab, AI tab, Custom tab mirroring web dashboard
4. `mobile playback screen` — AudioPlayer equivalent with progress sync to backend

---

## Phase 10: Infrastructure & Production Deployment

**Goal:** Full stack deployable on Dokploy with single `docker-compose up`; all services healthy and routing correctly.

**Requirements:** INFRA-01, INFRA-02, INFRA-03, INFRA-04, INFRA-05, INT-01, INT-02, INT-03, INT-04

**Success criteria:**
1. `docker-compose up` starts all services (frontend, backend, Redis, nginx) without errors
2. `GET /api/health` returns `{"status":"ok"}` via nginx (proxied to backend :4000)
3. Frontend can generate an AI lesson end-to-end via backend (login → generate → play)
4. Mobile app connects to production backend URL (same endpoints)
5. Rate limiting blocks >10 requests/15min on `/api/generate`

**Plans:**
1. `docker-compose update` — add Redis service, backend service with health check, update nginx routing
2. `nginx config` — `/api/*` → backend :4000, `/` → Next.js :3000, SSL termination ready
3. `env documentation` — `.env.example` with all required Dokploy vars (DATABASE_URL, REDIS_URL, GEMINI_API_KEY, JWT_SECRET, NEXTAUTH_SECRET, CORS_ORIGIN, NEXT_PUBLIC_API_URL)
4. `integration test` — end-to-end: login → generate lesson → save → check progress on mobile

---
*Roadmap created: 2026-03-04*
*Milestone: 2 — Full Modular System*
*Phases: 9-10*
