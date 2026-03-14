# ShadowDrive AI - 3 Improvement Plan

## Context
ShadowDrive AI is a Dutch language learning PWA for Turkish professionals. Currently at Phase 8 (backend + auth complete). User wants 3 key improvements: profile settings, fixed header, and speech recognition with recording storage. Also wants to leverage Dokploy templates for infrastructure (MinIO for recordings).

## Implementation Order
Build in this sequence - each builds on the previous:

1. **Phase A: Fixed Header/Navbar** - prerequisite for good UX
2. **Phase B: Profile Settings** - builds on new header navigation
3. **Phase C: Speech Recognition & Recording** - most complex, needs MinIO

---

## Phase A: Fixed Header/Navbar

### Problem
Header only shows on main tab pages (/dashboard/courses, ai, custom). Disappears on profile, play, and drill-down pages.

### Solution
Move header to root layout so it appears on ALL pages. Keep tab bar only on main dashboard pages.

### New Files
- `frontend/components/AppHeader.tsx` - Global fixed header (h-14, glass effect, z-40)
  - Left: User avatar (click -> /dashboard/profile, or AuthModal if guest)
  - Center: Compact logo "ShadowDrive" (click -> /dashboard/courses)
  - Right: LanguageSwitcher + ThemeToggle

### Modified Files
- `frontend/app/layout.tsx` - Add AppHeader above children, add pt-14 to body
- `frontend/app/dashboard/layout.tsx` - Remove DashboardHeader function, keep TabSwitcher
- `frontend/components/AuthButton.tsx` - Simplify: click navigates to profile (no dropdown)
- `frontend/app/dashboard/profile/page.tsx` - Remove ProfileHeader back button
- `frontend/app/play/[type]/[id]/page.tsx` - Ensure pt-14 offset works with AudioPlayer

### Design
- Height: 56px fixed top
- Glass effect: `bg-card/80 backdrop-blur-lg border-b border-border/50`
- Logo: emerald gradient text, compact
- All buttons: 44x44px touch targets
- Z-index: 40

---

## Phase B: Profile Settings

### Problem
Users can see their name/email but cannot edit anything. No password change, no avatar change, no account deletion.

### New API Endpoints
- `PATCH /api/profile/update` - Update name, image (avatar)
- `POST /api/profile/change-password` - Current password + new password (bcrypt)
- `DELETE /api/profile/delete-account` - With email confirmation, cascading delete

### New Files
- `frontend/app/dashboard/profile/settings/page.tsx` - Settings page with sections:
  - Display name editor
  - Avatar selector (predefined emoji/icon grid)
  - Password change form (current + new + confirm)
  - Danger zone: delete account with email confirmation
- `frontend/app/api/profile/update/route.ts`
- `frontend/app/api/profile/change-password/route.ts`
- `frontend/app/api/profile/delete-account/route.ts`

### Modified Files
- `frontend/app/dashboard/profile/page.tsx` - Make name clickable -> settings, add gear icon
- `frontend/auth.ts` - Add update callback for session refresh after name/avatar change
- `frontend/messages/en.json` + `tr.json` - Add settings translations

### No DB Migration Needed
User model already has: name, image, passwordHash fields.

---

## Phase C: Speech Recognition & Recording

### Pronunciation Flow (Karar Verildi)
Her cumle icin akis:
1. Hollandaca cumle okunur (TTS)
2. Mikrofon otomatik acilir, kullanici tekrar eder
3. Skor hesaplanir (Levenshtein):
   - **%70+**: Dogru -> sonraki cumleye gec
   - **%40-%69**: Tekrar gerekli -> cumle bir kez daha okunur, kullanici tekrar dener
   - **%0-%39**: Hatali -> cumle bir kez daha okunur, kullanici tekrar dener
4. Ikinci denemede de %70 altiysa -> sonraki cumleye gec (takilma yok)
5. Her iki fazda da (Phase 2 ve Phase 6) mikrofon acilir

### Hatali Telaffuz Takibi (Profil Karti)
Profil sayfasina yeni kart: "Telaffuz Durumum"
- **Hatali Telaffuzlar (Kirmizi)**: %0-%40 skor alan cumleler listesi
- **Tekrar Gerekli (Turuncu)**: %41-%69 skor alan cumleler listesi
- **Tek cumle pratigi**: Listedeki cumleye tiklaninca sadece o cumle icin dinle+tekrar et
- **Dogru telaffuz edildiginde**: Cumle listeden silinir
- **Genel basari istatistikleri**: Gunluk, haftalik, aylik telaffuz basari yuzdesi
- **Motivasyon gostergesi**: Ilerleme trendi (iyilesiyor/ayni/kotuluyor)

### Sub-task C1: Enable Pronunciation + Retry Logic + Feedback
- `frontend/app/play/[type]/[id]/page.tsx` - Add `enablePronunciation={true}`
- `frontend/components/AudioPlayer.tsx` - Fix micGranted bug, default `enablePronunciation = true`
- `frontend/lib/speechEngine.ts` - Modify playScenario loop:
  - After scoring, if < 70%: replay target phrase + listen again (max 1 retry)
  - Track failed pronunciations separately for profile card
  - Both Phase 2 and Phase 6 have active mic
- `frontend/lib/soundEffects.ts` - Mevcut ses efektleri (zaten var, kullanilacak):
  - **Dogru (%70+)**: "ding" sesi (880Hz, 0.3s) + kisa titresim (100ms) -> `cuePronunciationResult(score)`
  - **Orta (%40-%69)**: "hmm" sesi (330Hz, 0.25s) + hafif titresim
  - **Yanlis (%0-%39)**: "error" sesi (220Hz, cift buzz) + guclu titresim [100, 50, 100]ms
  - Bu fonksiyon `cuePronunciationResult(score)` olarak zaten speechEngine.ts icinde her skor sonrasi cagrilyor
  - Ek: Retry basladiginda kullaniciya "tekrar dinle" sinyali icin `cueUserTurn()` (boop sesi + titresim) calacak

### Sub-task C2: MinIO Storage (Dokploy Template, 8GB+ RAM server)
- Deploy MinIO from Dokploy template panel
- Create bucket: `shadowdrive-recordings`
- Env vars: MINIO_ENDPOINT, MINIO_ACCESS_KEY, MINIO_SECRET_KEY, MINIO_BUCKET
- Install: `@aws-sdk/client-s3` + `@aws-sdk/s3-request-presigner`

### Sub-task C3: Recording Upload & Playback
**New Files:**
- `frontend/lib/s3.ts` - S3/MinIO client (upload, getPresignedUrl, delete)
- `frontend/app/api/recordings/upload/route.ts` - POST multipart, max 5MB, saves to MinIO
- `frontend/app/api/recordings/[id]/route.ts` - GET presigned URL (1h expiry)
- `frontend/app/api/recordings/list/route.ts` - GET user recordings (grouped by lesson)
- `frontend/app/dashboard/profile/recordings/page.tsx` - "My Recordings" page
- `frontend/components/RecordingPlayer.tsx` - Inline audio player with play/pause

### Sub-task C4: Hatali Telaffuz Karti + Tek Cumle Pratigi
**New Files:**
- `frontend/app/api/pronunciation/failed/route.ts` - GET failed pronunciations (score < 70%)
- `frontend/app/api/pronunciation/stats/route.ts` - GET daily/weekly/monthly success rates
- `frontend/components/PronunciationCard.tsx` - Profile card with failed/retry lists + stats
- `frontend/components/SinglePhrasePractice.tsx` - Mini player for single phrase retry

**Modified Files:**
- `frontend/app/dashboard/profile/page.tsx` - Add PronunciationCard below stats

### Modified Files (C overall)
- `frontend/components/AudioPlayer.tsx` - Wire uploadRecording, retry logic
- `frontend/lib/speechEngine.ts` - Add retry on fail, save failed phrases
- `frontend/app/dashboard/profile/page.tsx` - Add recordings link + PronunciationCard
- `frontend/components/LessonReport.tsx` - Add play button per line if recording exists

### Storage Strategy
- Key format: `recordings/{userId}/{lessonId}/{lineIndex}_{timestamp}.webm`
- Max 5MB per recording (~30s WebM/Opus)
- Max 500 recordings per user
- 90-day auto-purge (future)
- PronunciationAttempt.recordingUrl already exists in schema (stores S3 key)

### DB Schema Change Needed
`PronunciationAttempt` modeline ek alan:
- `targetText String` - Hatali cumlenin orjinal metni (listelemek icin)
- `nativeText String?` - Turkce cevirisi
- `lessonTitle String?` - Ders basligni (profil kartinda gostermek icin)
- `resolved Boolean @default(false)` - Kullanici dogru telaffuz ettiginde true

---

## Dokploy Template Recommendations (from PDF)

Useful free templates to deploy:
| Template | Purpose | Priority |
|----------|---------|----------|
| **MinIO** | S3-compatible storage for recordings | Required (Phase C) |
| **Uptime Kuma** | Monitor app uptime and health | Recommended |
| **pgAdmin** | PostgreSQL admin GUI | Recommended |
| **Grafana** | Performance dashboards | Optional |
| **Dozzle** | Real-time Docker log viewer | Recommended |

Already deployed: PostgreSQL, Valkey, ShadowDrive app

---

## Complete File Change List

### New Files (15)
| # | File | Phase |
|---|------|-------|
| 1 | `frontend/components/AppHeader.tsx` | A |
| 2 | `frontend/app/dashboard/profile/settings/page.tsx` | B |
| 3 | `frontend/app/api/profile/update/route.ts` | B |
| 4 | `frontend/app/api/profile/change-password/route.ts` | B |
| 5 | `frontend/app/api/profile/delete-account/route.ts` | B |
| 6 | `frontend/lib/s3.ts` | C |
| 7 | `frontend/app/api/recordings/upload/route.ts` | C |
| 8 | `frontend/app/api/recordings/[id]/route.ts` | C |
| 9 | `frontend/app/api/recordings/list/route.ts` | C |
| 10 | `frontend/app/dashboard/profile/recordings/page.tsx` | C |
| 11 | `frontend/components/RecordingPlayer.tsx` | C |
| 12 | `frontend/app/api/pronunciation/failed/route.ts` | C |
| 13 | `frontend/app/api/pronunciation/stats/route.ts` | C |
| 14 | `frontend/components/PronunciationCard.tsx` | C |
| 15 | `frontend/components/SinglePhrasePractice.tsx` | C |

### Modified Files (12)
| # | File | Phase | Change |
|---|------|-------|--------|
| 1 | `frontend/app/layout.tsx` | A | Add AppHeader, pt-14 |
| 2 | `frontend/app/dashboard/layout.tsx` | A | Remove DashboardHeader |
| 3 | `frontend/components/AuthButton.tsx` | A | Simplify to direct nav |
| 4 | `frontend/app/dashboard/profile/page.tsx` | A+B+C | Remove back header, add settings/recordings/pronunciation links |
| 5 | `frontend/app/play/[type]/[id]/page.tsx` | C | enablePronunciation={true} |
| 6 | `frontend/components/AudioPlayer.tsx` | C | Fix micGranted bug, wire upload, retry logic |
| 7 | `frontend/lib/speechEngine.ts` | C | Add retry on fail (<70%), max 1 retry per phrase |
| 8 | `frontend/components/LessonReport.tsx` | C | Add recording playback |
| 9 | `frontend/auth.ts` | B | Session update callback |
| 10 | `frontend/messages/en.json` | B+C | Settings + pronunciation translations |
| 11 | `frontend/messages/tr.json` | B+C | Settings + pronunciation translations |
| 12 | `prisma/schema.prisma` | C | Add targetText, nativeText, lessonTitle, resolved to PronunciationAttempt |

---

## Verification Plan

### Phase A Testing
- Navigate to /dashboard/courses -> header visible
- Navigate to /dashboard/profile -> header still visible
- Navigate to /play/course/123 -> header still visible
- Click logo -> goes to dashboard
- Click user avatar -> goes to profile
- Language switcher works from any page
- Theme toggle works from any page

### Phase B Testing
- Go to profile -> click name -> settings page opens
- Change display name -> save -> verify in profile & header
- Change password -> logout -> login with new password
- Delete account -> confirm with email -> account gone

### Phase C Testing
- Start any lesson -> mic permission requested
- After Dutch phrase plays -> mic opens automatically
- Speak correctly (70%+) -> green badge, next phrase
- Speak incorrectly (<70%) -> phrase replays, user retries once
- Second fail -> moves to next phrase (no blocking)
- Complete lesson -> recordings saved to MinIO
- Go to My Recordings -> see list -> play recordings
- Go to Profile -> Pronunciation Card shows:
  - Red list (0-40%): hatali telaffuzlar
  - Orange list (41-69%): tekrar gerekli
  - Click phrase -> SinglePhrasePractice opens -> practice -> correct -> removed from list
  - Daily/weekly/monthly success percentages visible

## Phase D: Admin Panel, Voice-First Optimization & LLM Abstraction

### Sub-task D1: Voice-First & Hands-Free Constraints
- Update `AudioPlayer` flow: TTS -> Auto-Mic -> Score -> Auto-Next/Retry without screen interaction.
- Maximize touch targets for driving/cycling context.
- Improve high-contrast visibility.

### Sub-task D2: LLM Service Abstraction
- Create generic interface for text generation.
- Decouple OpenRouter from core logic.
- Prepare provider infrastructure for OpenAI, Anthropic, Gemini.

### Sub-task D3: Admin Dashboard Structure
- Add `role` enum to User schema (`USER`, `ADMIN`).
- Implement `/admin` protected route group.
- Create dashboard for platform stats (DAU, total lessons).
- Create User Management view with pagination.

### Sub-task D4: API Preparation for React Native (Expo)
- Standardize all AI interactions as robust REST API endpoints.
- Abstract auth patterns for seamless JWT or Native mapping.
