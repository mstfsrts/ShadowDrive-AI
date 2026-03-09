# Requirements: ShadowDrive AI — Milestone 3: Major Restructuring & Feature Expansion

**Defined:** 2026-03-09
**Core Value:** The 6-phase shadowing loop must work seamlessly on all platforms with progress synced to the cloud. Natural TTS, speech recognition, and user progress tracking enhance the learning experience.

## v1 Requirements

### Architecture (Phase 9)

- [ ] **ARCH-01**: Codebase organized into frontend/, backend/, mobile/ folders with npm workspaces
- [ ] **ARCH-02**: Prisma schema lives in backend/prisma/ with frontend referencing it
- [ ] **ARCH-03**: Root package.json is workspace manager only (no app dependencies)

### Navigation (Phase 10)

- [ ] **NAV-01**: Browser back/forward buttons navigate between dashboard views
- [ ] **NAV-02**: Each view (courses, categories, lessons, AI, custom, profile) has a unique URL
- [ ] **NAV-03**: Playback page at /play/[type]/[id] with return navigation

### Bug Fixes (Already Implemented)

- [x] **BUG-01**: Pause → Resume continues from current sentence (not from beginning)
- [x] **BUG-02**: "Dersin Başına Dön" button on pause with confirmation dialog

### Natural TTS (Phase 11)

- [ ] **TTS-01**: Offline lessons play with natural Dutch voice (ElevenLabs pre-recorded audio)
- [ ] **TTS-02**: Incremental audio generation — only new/changed sentences regenerated
- [ ] **TTS-03**: Orphan detection — audio files for deleted/changed lessons reported/cleaned

### Speech Recognition (Phase 12)

- [ ] **SR-01**: User pronunciation checked during pause phases via Web Speech Recognition API
- [ ] **SR-02**: Browser feature detection — unsupported browsers fall back to timed pause
- [ ] **SR-03**: Incorrect sentences saved to database (SpeechAttempt model)
- [ ] **SR-04**: 8 correct repetitions = sentence learned (4 lessons x 2 repetitions)

### User Progress Panel (Phase 13)

- [ ] **PROF-01**: Profile page shows overall statistics (lessons studied, completed, success rate)
- [ ] **PROF-02**: Per-course progress bars with expandable lesson detail
- [ ] **PROF-03**: Failed sentences table with sorting by score and filtering by course
- [ ] **PROF-04**: Practice lesson creation from failed sentences (default 8, configurable 4-16)

### Mobile App (Phase 14)

- [ ] **MOB-01**: User can log in with email/password on mobile
- [ ] **MOB-02**: User can browse and play pre-built courses with pre-recorded audio
- [ ] **MOB-03**: User can generate AI lessons by entering topic and CEFR level
- [ ] **MOB-04**: User can view and play saved AI lessons
- [ ] **MOB-05**: User can view and play saved custom lessons
- [ ] **MOB-06**: User progress is saved to backend and syncs across devices
- [ ] **MOB-07**: App runs on iOS and Android (React Native Expo)
- [ ] **MOB-SR-01**: Speech recognition via @react-native-voice/voice (iOS + Android)

### Infrastructure (Phase 15)

- [ ] **INFRA-01**: All services start with single `docker-compose up`
- [ ] **INFRA-02**: Nginx routes `/api/*` to Express, everything else to Next.js
- [ ] **INFRA-03**: Redis service configured (rate limiting + scenario cache)
- [ ] **INFRA-04**: Backend uses production PostgreSQL (Dokploy env vars)
- [ ] **INFRA-05**: All env variables documented in `.env.example`

### Integration (Phase 15)

- [ ] **INT-01**: Frontend auth token forwarded to backend for all API calls
- [ ] **INT-02**: Mobile uses same backend API endpoints as frontend
- [ ] **INT-03**: Progress saved from mobile reflects in web dashboard
- [ ] **INT-04**: Rate limiting applies to both web and mobile clients

## v2 Requirements

- **MOB-08**: Push notifications for streak reminders
- **MOB-09**: Offline playback for downloaded lessons on mobile
- **INFRA-06**: Health check dashboard (uptime monitoring)
- **INFRA-07**: Error tracking (Sentry or similar)
- **SR-05**: Server-side Whisper API for more accurate recognition (optional upgrade)

## Out of Scope

| Feature | Reason |
|---------|--------|
| App Store submission | After user feedback loop |
| WebSocket real-time sync | Not needed at 100 users |
| Kubernetes | docker-compose + 1 VPS is sufficient |
| GraphQL | REST API is sufficient |
| Social features | v3+ |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| ARCH-01 | Phase 9 | Pending |
| ARCH-02 | Phase 9 | Pending |
| ARCH-03 | Phase 9 | Pending |
| NAV-01 | Phase 10 | Pending |
| NAV-02 | Phase 10 | Pending |
| NAV-03 | Phase 10 | Pending |
| BUG-01 | Pre-Phase 9 | ✓ Complete |
| BUG-02 | Pre-Phase 9 | ✓ Complete |
| TTS-01 | Phase 11 | Pending |
| TTS-02 | Phase 11 | Pending |
| TTS-03 | Phase 11 | Pending |
| SR-01 | Phase 12 | Pending |
| SR-02 | Phase 12 | Pending |
| SR-03 | Phase 12 | Pending |
| SR-04 | Phase 12 | Pending |
| PROF-01 | Phase 13 | Pending |
| PROF-02 | Phase 13 | Pending |
| PROF-03 | Phase 13 | Pending |
| PROF-04 | Phase 13 | Pending |
| MOB-01 | Phase 14 | Pending |
| MOB-02 | Phase 14 | Pending |
| MOB-03 | Phase 14 | Pending |
| MOB-04 | Phase 14 | Pending |
| MOB-05 | Phase 14 | Pending |
| MOB-06 | Phase 14 | Pending |
| MOB-07 | Phase 14 | Pending |
| MOB-SR-01 | Phase 14 | Pending |
| INFRA-01 | Phase 15 | Pending |
| INFRA-02 | Phase 15 | Pending |
| INFRA-03 | Phase 15 | Pending |
| INFRA-04 | Phase 15 | Pending |
| INFRA-05 | Phase 15 | Pending |
| INT-01 | Phase 15 | Pending |
| INT-02 | Phase 15 | Pending |
| INT-03 | Phase 15 | Pending |
| INT-04 | Phase 15 | Pending |

---
*Requirements defined: 2026-03-09*
