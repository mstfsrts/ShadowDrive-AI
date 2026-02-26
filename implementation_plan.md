# ShadowDrive AI — Implementation Plan v2 (iOS Migration + Skills)

Hands-free, mobile-first PWA for **Dutch ↔ Turkish** language learning, now with structured offline courses and AI-generated scenarios. This update adds iOS adaptation and 3 integrated development skills.

---

## User Review Required

> [!IMPORTANT]
> **3 new skill files** have been added to `.agent/skills/`. These skills are **development process guides**, not runtime code. They do NOT add any npm dependencies or change the production bundle.

> [!WARNING]
> **iOS WebKit limitations**: The Web Speech API on iOS Safari has known issues (voice loading delay, `cancel()` bugs on iOS 17+). The systematic-debugging skill includes a checklist for these, but some issues may require user-gesture workarounds that change the UX flow.

---

## Current Architecture (What Exists)

```
1st_Project/
├── .agent/skills/
│   ├── frontend-design/SKILL.md        [NEW — Skill 1]
│   ├── systematic-debugging/SKILL.md   [NEW — Skill 2]
│   └── test-driven-development/SKILL.md [NEW — Skill 3]
├── app/
│   ├── layout.tsx
│   ├── page.tsx              # Dual-engine: Courses + AI + Custom tabs
│   ├── globals.css
│   └── api/generate/route.ts # Gemini API (Dutch-Turkish, model fallback)
├── components/
│   ├── AudioPlayer.tsx       # Playback with nativeText display
│   ├── ScenarioForm.tsx      # Turkish-localized form
│   ├── CustomTextForm.tsx    # Manual text input
│   ├── StatusBar.tsx
│   └── Toast.tsx             # Auto-dismissing notifications
├── lib/
│   ├── speechEngine.ts       # 6-phase loop, Turkish TTS skip
│   ├── gemini.ts             # Model fallback, 15s timeout
│   ├── scenarioCache.ts      # LocalStorage caching
│   ├── offlineScenarios.ts   # 5 Turkish offline scenarios
│   └── offline-courses/      # Structured course data
├── types/dialogue.ts
└── public/ (manifest, sw.js, icons)
```

---

## Skill Integration Map

| Skill | Source Repo | Phase | Purpose |
|-------|-----------|-------|---------|
| **frontend-design** | anthropics/claude-code | Phase 7 (iOS) | iOS safe areas, touch targets, PWA display mode, premium aesthetics |
| **systematic-debugging** | obra/superpowers | Phase 7 (iOS) | WebKit TTS bugs, service worker issues, cache debugging |
| **test-driven-development** | obra/superpowers | Phase 6 (QA) + Phase 7 (iOS) | Unit tests for API/speech/components, iOS E2E validation |

### Stack Compatibility Check ✅

| Skill Requirement | Our Stack | Compatible? |
|-------------------|-----------|-------------|
| HTML/CSS/JS/React | Next.js 14 + React | ✅ |
| Tailwind CSS | Already using Tailwind | ✅ |
| Test runner | Need to add Jest/Vitest | ✅ (no conflict) |
| iOS Safari/WebKit | PWA target platform | ✅ |
| No new runtime deps | Skills are .md guides only | ✅ |

---

## Proposed Changes — Phase 7: iOS Adaptation

### Component A — Safe Areas & Viewport

#### [MODIFY] [layout.tsx](file:///c:/Users/itteam/Desktop/MyPrpjects/1st_Project/app/layout.tsx)
- Add `apple-mobile-web-app-status-bar-style` meta tag
- Add viewport meta with `viewport-fit=cover`

#### [MODIFY] [globals.css](file:///c:/Users/itteam/Desktop/MyPrpjects/1st_Project/app/globals.css)
- Add safe area padding: `padding-top: env(safe-area-inset-top)`
- Add home indicator padding: `padding-bottom: env(safe-area-inset-bottom)`
- Add standalone mode styles: `@media (display-mode: standalone)`
- Add `-webkit-tap-highlight-color: transparent` globally

---

### Component B — Touch & Interaction

#### [MODIFY] [AudioPlayer.tsx](file:///c:/Users/itteam/Desktop/MyPrpjects/1st_Project/components/AudioPlayer.tsx)
- Add `select-none` to all interactive elements
- Disable rubber-band scroll during active playback
- Ensure 88px minimum height on all buttons

#### [MODIFY] [ScenarioForm.tsx](file:///c:/Users/itteam/Desktop/MyPrpjects/1st_Project/components/ScenarioForm.tsx)
- Verify quick-topic chips have ≥48dp touch targets
- Add input `enterKeyHint="go"` for iOS keyboard

---

### Component C — iOS WebKit Speech Fixes

#### [MODIFY] [speechEngine.ts](file:///c:/Users/itteam/Desktop/MyPrpjects/1st_Project/lib/speechEngine.ts)
- Add iOS voice preloading on first user gesture
- Handle `speechSynthesis.cancel()` iOS 17 bug (double-cancel workaround)
- Add `speechSynthesis.resume()` after app returns from background

---

### Component D — Test Infrastructure

#### [NEW] `jest.config.ts` or `vitest.config.ts`
- Configure test runner for Next.js App Router
- Path aliases matching `tsconfig.json`

#### [NEW] `__tests__/api/generate.test.ts`
#### [NEW] `__tests__/lib/speechEngine.test.ts`
#### [NEW] `__tests__/components/ScenarioForm.test.tsx`

---

## Verification Plan

### Automated Tests (Skill: test-driven-development)
| # | Test | Method | Pass Criteria |
|---|------|--------|---------------|
| 1 | API route returns valid scenario | Jest + mocked Gemini | 200 status, valid Scenario JSON |
| 2 | API timeout fires within 15s | Jest + AbortController | Error thrown < 16 seconds |
| 3 | Cache hit skips API call | Jest + localStorage mock | No fetch call on second request |
| 4 | iOS viewport rendering | Browser tool at 390×844 | No horizontal scroll, all targets ≥ 48px |
| 5 | Standalone mode | Browser tool + display-mode | Layout adjusts for safe areas |

### Manual Verification (User)
| # | Test | Steps |
|---|------|-------|
| 1 | iOS PWA install | Safari → Share → Add to Home Screen → verify standalone |
| 2 | Driving usability | Mount phone, start lesson, confirm glanceable state |
| 3 | Turkish TTS skip | Play lesson, confirm no robotic Turkish voice |
