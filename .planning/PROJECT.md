# ShadowDrive AI

## What This Is

ShadowDrive AI is a mobile-first language learning app for Dutch-Turkish learners. Users shadow native Dutch speech through a 6-phase playback loop (hear → pause → translate → gap → repeat → rest) with CEFR-calibrated pacing. Lessons come from pre-built courses, AI-generated scenarios, or user-provided text.

## Core Value

The 6-phase shadowing loop must work seamlessly on all platforms — web, PWA, and native mobile — with progress synced to the cloud. Natural TTS, speech recognition, and user progress tracking enhance the learning experience.

## Requirements

### Validated

- ✓ Course playback with Web Speech API (TTS) — Phase 1-4
- ✓ AI lesson generation via Gemini/OpenRouter — Phase 2-3
- ✓ Custom lesson input and playback — Phase 3
- ✓ User authentication (NextAuth email/password + JWT) — Phase 5
- ✓ Saved AI/custom lessons (CRUD) — Phase 5-6
- ✓ Progress tracking with resume capability — Phase 5-7
- ✓ Dashboard modularization (7 view components + orchestration hook) — Phase 7
- ✓ packages/shared canonical types across all layers — Phase 8.1
- ✓ Unified PostgreSQL schema (UserProgress model) — Phase 8.2
- ✓ Express backend modernization (Redis, all CRUD routes) — Phase 8.3
- ✓ Frontend decoupled from DB (lib/api.ts → Express) — Phase 8.4
- ✓ Resume fix: pause/resume from current sentence + "Dersin Başına Dön" button

### Active

- [ ] Project restructuring: frontend/, backend/, mobile/ folder architecture
- [ ] URL-based routing with browser back/forward support
- [ ] Natural TTS: ElevenLabs pre-recorded audio for offline lessons
- [ ] Speech recognition: pronunciation checking + error tracking
- [ ] User progress panel: statistics, failed sentences, practice lesson creation
- [ ] React Native mobile app (iOS + Android) — all web features
- [ ] Infrastructure: Docker Compose, nginx, Redis, Dokploy deployment
- [ ] End-to-end integration across frontend + backend + mobile

### Out of Scope

- Real-time features (WebSocket/live sync) — complexity not justified at 100 users
- App Store publication — after user feedback loop
- Social features (following, sharing) — v3+
- Video content — storage/bandwidth cost

## Context

Monorepo structure (target — Phase 9):
- `frontend/` — Next.js 14 frontend (SSR + PWA)
- `backend/` — Express 4 REST API (port 4000) + Prisma + PostgreSQL
- `mobile/` — React Native Expo (iOS + Android)
- `packages/shared/` — canonical types, validators, constants

Backend uses PostgreSQL (Neon.tech for dev, Dokploy for prod) with Prisma ORM.
Auth: NextAuth JWT forwarded to Express via `Authorization: Bearer` header.
Redis: rate limiting + scenario caching (24h TTL).

## Constraints

- **Stack**: React Native Expo — not Flutter or native
- **Deployment**: Dokploy with docker-compose — must work as single stack
- **Database**: PostgreSQL only
- **Auth**: NextAuth JWT forwarding to backend — no separate mobile auth service
- **Scale**: 100 concurrent users — Docker Compose + 1 VPS is sufficient
- **TTS**: ElevenLabs for offline lessons, Web Speech API for AI/Custom lessons
- **Speech Recognition**: Web Speech API (web), @react-native-voice/voice (mobile)

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| 3-folder architecture | Clean separation, each app independent | Phase 9 |
| URL-based routing | Browser nav works, proper web app behavior | Phase 10 |
| ElevenLabs TTS | Natural Dutch voice, incremental generation | Phase 11 |
| Web Speech Recognition | Free, browser-native, graceful fallback | Phase 12 |
| Resume from line start | User always hears sentence before repeating | ✓ Implemented |

---
*Last updated: 2026-03-09*
