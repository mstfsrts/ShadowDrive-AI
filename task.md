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

## Phase 7: iOS Adaptation ✅
- [x] Safe area insets (notch + home indicator)
- [x] `viewport-fit: cover`, standalone mode CSS
- [x] Touch optimization (88px buttons, 44px chips)
- [x] iOS WebKit speech fixes

## Phase 8: Auth + DB ✅
- [x] Prisma ORM schema & migrations (PostgreSQL)
- [x] NextAuth.js v5 (Google OAuth + credentials)
- [x] Kursları DB'ye taşı (Course + Lesson modelleri)
- [x] Responsive mobil tasarım (flex layout, 44px touch targets)
- [x] Kurs yapısı yeniden düzenleme (kategori/alt-kategori hiyerarşisi)
- [x] `data/` klasörü silindi — tüm veri DB-only (`prisma/seed.ts` inline)

## Phase 9: Progress Takibi (Bekliyor)
- [ ] `Progress` modeline `completionCount` + `targetCount` ekle
- [ ] `POST /api/progress` + `GET /api/progress` API route'ları
- [ ] Dashboard: progress yükle, badge göster, resume desteği

## Phase 10: Polish & Optimization
- [ ] Bundle size optimization
- [ ] Lazy loading for non-critical components
