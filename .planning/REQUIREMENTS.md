# Requirements: ShadowDrive AI — Milestone 2: Full Modular System

**Defined:** 2026-03-04
**Core Value:** The 6-phase shadowing loop must work seamlessly on all platforms with progress synced to the cloud.

## v1 Requirements

### Mobile App

- [ ] **MOB-01**: User can log in with email and password on mobile
- [ ] **MOB-02**: User can browse and play pre-built courses with native TTS (expo-speech)
- [ ] **MOB-03**: User can generate AI lessons by entering topic and CEFR level
- [ ] **MOB-04**: User can view and play saved AI lessons
- [ ] **MOB-05**: User can view and play saved custom lessons
- [ ] **MOB-06**: User progress is saved to backend and syncs across devices
- [ ] **MOB-07**: App runs on iOS and Android (React Native Expo)

### Infrastructure

- [ ] **INFRA-01**: All services (frontend, backend, Redis, PostgreSQL) start with single `docker-compose up`
- [ ] **INFRA-02**: Nginx routes `/api/*` to Express :4000, everything else to Next.js :3000
- [ ] **INFRA-03**: Redis service configured in docker-compose (rate limiting + scenario cache)
- [ ] **INFRA-04**: Backend uses production PostgreSQL (Dokploy env vars)
- [ ] **INFRA-05**: All env variables documented in `.env.example` for Dokploy setup

### Integration

- [ ] **INT-01**: Frontend auth token forwarded to backend for all API calls
- [ ] **INT-02**: Mobile uses same backend API endpoints as frontend
- [ ] **INT-03**: Progress saved from mobile reflects in web dashboard (shared DB)
- [ ] **INT-04**: Rate limiting applies to both web and mobile clients

## v2 Requirements

### Mobile Enhancement

- **MOB-08**: Push notifications for streak reminders
- **MOB-09**: Offline playback for downloaded lessons
- **MOB-10**: App Store / Play Store submission

### Monitoring

- **INFRA-06**: Health check dashboard (uptime monitoring)
- **INFRA-07**: Error tracking (Sentry or similar)

## Out of Scope

| Feature | Reason |
|---------|--------|
| App Store submission | After user feedback loop |
| WebSocket real-time sync | Not needed at 100 users |
| Separate mobile auth service | NextAuth JWT forwarding is sufficient |
| Kubernetes | docker-compose + 1 VPS is sufficient |
| GraphQL | REST API is sufficient |
| Social features | v3+ |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| MOB-01 | Phase 9 | Pending |
| MOB-02 | Phase 9 | Pending |
| MOB-03 | Phase 9 | Pending |
| MOB-04 | Phase 9 | Pending |
| MOB-05 | Phase 9 | Pending |
| MOB-06 | Phase 9 | Pending |
| MOB-07 | Phase 9 | Pending |
| INFRA-01 | Phase 10 | Pending |
| INFRA-02 | Phase 10 | Pending |
| INFRA-03 | Phase 10 | Pending |
| INFRA-04 | Phase 10 | Pending |
| INFRA-05 | Phase 10 | Pending |
| INT-01 | Phase 10 | Pending |
| INT-02 | Phase 10 | Pending |
| INT-03 | Phase 10 | Pending |
| INT-04 | Phase 10 | Pending |

**Coverage:**
- v1 requirements: 15 total (note: INT-01 through INT-04 = 4 + MOB-01-07 = 7 + INFRA-01-05 = 5, total = 16)
- Mapped to phases: 16
- Unmapped: 0 ✓

---
*Requirements defined: 2026-03-04*
*Last updated: 2026-03-04 after initial definition*
