# ShadowDrive AI

## What This Is

ShadowDrive AI is a mobile-first language learning app for Dutch-Turkish learners. Users shadow native Dutch speech through a 6-phase playback loop (hear → pause → translate → gap → repeat → rest) with CEFR-calibrated pacing. Lessons come from pre-built courses, AI-generated scenarios, or user-provided text.

## Core Value

The 6-phase shadowing loop must work seamlessly on all platforms — web, PWA, and native mobile — with progress synced to the cloud.

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

### Active

- [ ] React Native mobile app (iOS + Android) — all web features
- [ ] Infrastructure: Docker Compose, nginx, Redis, Dokploy deployment
- [ ] End-to-end integration across frontend + backend + mobile

### Out of Scope

- Real-time features (WebSocket/live sync) — complexity not justified at 100 users
- App Store publication — after user feedback loop
- Social features (following, sharing) — v3+
- Video content — storage/bandwidth cost

## Context

Monorepo structure:
- `/` — Next.js 14 frontend (SSR + PWA)
- `backend/` — Express 4 REST API (port 4000)
- `mobile/` — React Native Expo (scaffold exists at mobile/)
- `packages/shared/` — canonical types, validators, constants

Backend uses PostgreSQL (Neon.tech for dev, Dokploy for prod) with Prisma ORM.
Auth: NextAuth JWT forwarded to Express via `Authorization: Bearer` header.
Redis: rate limiting + scenario caching (24h TTL).

## Constraints

- **Stack**: React Native Expo (existing scaffold) — not Flutter or native
- **Deployment**: Dokploy with docker-compose — must work as single stack
- **Database**: PostgreSQL only
- **Auth**: NextAuth JWT forwarding to backend — no separate mobile auth service
- **Scale**: 100 concurrent users — Docker Compose + 1 VPS is sufficient

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Express separate from Next.js | DB connection pooling, rate limiting, horizontal scale | — Pending |
| NextAuth JWT forwarded to backend | Single auth source, no dual-token complexity | — Pending |
| Redis for rate limiting | Shared state across replicas | — Pending |
| React Native Expo for mobile | Faster development, JS reuse, both platforms | — Pending |

---
*Last updated: 2026-03-04 after new-project initialization*
