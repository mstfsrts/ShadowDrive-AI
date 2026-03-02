# ShadowDrive AI — Feature Roadmap (Phase 4–8)

> Bu dosya aktif geliştirme yol haritasıdır. Her session'da buradan ilerlenecek.
> Son güncelleme: 2026-03-02

---

## Tamamlanan Phases (1–4.5)
- ✅ **Phase 1**: Temel uygulama (speechEngine, AudioPlayer)
- ✅ **Phase 2**: AI entegrasyonu (Gemini/OpenRouter, senaryo üretimi)
- ✅ **Phase 3**: Auth + Landing Page (NextAuth v5, Google OAuth, Email/Password, LandingPage)
- ✅ **Phase 4**: Kursları DB'ye Taşı (Prisma PostgreSQL, API route'ları)
- ✅ **Phase 4.5**: Responsive Mobil Tasarım (flex layout, 44px touch target, dropdown fix)

---

## Aktif Geliştirme (Phase 4.6–7)

### Phase 4.6: Kurs Yapısı Yeniden Düzenleme
**Durum:** ✅ Tamamlandı

Hedef: Düz kurs listesi yerine hiyerarşik kategori yapısı. `data/` klasörü silinip tüm veri `prisma/seed.ts`'de inline.

**Yapılanlar:**
- [x] Course modeline `category` + `subcategory` alanları eklendi
- [x] Migration: `20260301130000_add_course_categories`
- [x] `prisma/seed.ts`: JSON import → inline data (12 kurs, 123+ ders)
- [x] Dashboard: Kategori → Alt Kategori → Kurs → Ders hiyerarşik navigasyon
- [x] `data/` klasörü silindi (DB-only yapı)

**Kurs Hiyerarşisi:**
```
Delftse Methode (kategori)
├── Beginners (3 ders)
├── Halfgevorderden (2 ders)
└── Gevorderden (2 ders)

Goedbezig Youtube Series (kategori)
├── Oude Series (alt kategori)
│   └── Hollandaca Ogreniyoruz (116 ders, 4 aktif + 112 placeholder)
└── Nieuwe Series (alt kategori)
    ├── Atolyesi 1: Ilk Adimlar
    ├── Atolyesi 2: Modal Fiiller
    ├── Atolyesi 3: "Dat" ve Arkadaslari
    ├── Atolyesi 4: Om te ile derinlere
    ├── Atolyesi 5: Zamanlar
    ├── Atolyesi 6: "Die" ve Arkadaslari
    ├── Atolyesi 7: Ayrilabilen Fiiller
    └── Atolyesi 8: Donuslu Fiiller
```

**Kritik Dosyalar:** `prisma/schema.prisma`, `prisma/seed.ts`, `app/dashboard/page.tsx`

---

### Phase 5: Progress Takibi + Kaldığın Yerden Devam
**Durum:** ✅ Tamamlandı

Hedef: Tüm sekmelerde ders tamamlanma sayısı + resume özelliği.

**Yapılanlar:**
- [x] `POST /api/progress` + `GET /api/progress` API route'ları (`app/api/progress/route.ts`)
- [x] Dashboard: `useSession`, `progressMap` state, progress fetch (`session` değişince)
- [x] `handleLessonClick`: `selectedLesson` state güncelleniyor
- [x] `handleComplete`: async → progress POST, `completionCount` artırıyor, toast gösteriyor
- [x] Course detail: ders badge'leri (★ Öğrenildi, X/Y, hiç)
- [x] Kurs kartı: "X/Y tamamlandı" genel ilerleme badge'i
- [x] Prisma upsert: `completionCount` increment, `completedAt`, `targetCount=4` varsayılan

---

### Phase 6: Metin Önizleme
**Durum:** ✅ Tamamlandı

Hedef: Araba kullanmadan diyalog metnini okuyarak gözden geçirme + tek tek cümle dinleme.

**Yapılanlar:**
- [x] `components/LessonPreview.tsx`: scrollable Hollandaca + Türkçe diyalog listesi
- [x] Her cümle kartında `▶/⏸` butonu — tek cümleyi `speakAsync` ile seslendirir
- [x] Sticky header: geri + "▶ Başla" butonları
- [x] Dashboard: `'preview'` ViewState + `handlePreviewClick/StartFromPreview/BackFromPreview`
- [x] Course-detail: ders kartları → oynat (flex-1) + `👁` yan yana iki buton

---

### Phase 7: Kaydedilmiş Dersler — CRUD
**Durum:** ✅ Tamamlandı

Hedef: AI ve Metnim'deki içeriklerin hesaba kaydedilmesi, listelenmesi, düzenlenmesi, silinmesi.

**Yapılanlar:**
- [x] `POST/GET /api/ai-lessons` + `DELETE/PATCH /api/ai-lessons/[id]`
- [x] `POST/GET /api/custom-lessons` + `DELETE/PATCH /api/custom-lessons/[id]`
- [x] AI sekmesi: oluşturulan senaryo kartı (👁 Önizle / ▶ Dinle / 💾 Kaydet)
- [x] AI sekmesi: "Kaydedilmiş Senaryolar" listesi — `SavedLessonCard`
- [x] Metnim sekmesi: özel ders kartı (👁 Önizle / ▶ Dinle / 💾 Kaydet)
- [x] Metnim sekmesi: "Kaydedilmiş Metinlerim" listesi — `SavedLessonCard`
- [x] Her kayıt: 👁 Önizle / ▶ Dinle / ✏ Yeniden Adlandır (inline) / 🗑 Sil
- [x] `handleBackFromPreview`: kurs olmayan senaryolarda dashboard'a döner

---

### Phase 8: iOS Adaptation & QA
**Durum:** ✅ Tamamlandı

Hedef: iOS Safari PWA uyumu, safe area, dokunma hedefleri, WebKit TTS düzeltmeleri ve test altyapısı (implementation_plan v2 Phase 7).

**Yapılanlar:**
- [x] **Safe areas & viewport:** `layout.tsx` viewport-fit=cover, appleWebApp; `globals.css` env(safe-area-inset-*), @media (display-mode: standalone), .playback-active
- [x] **Touch & interaction:** AudioPlayer ana buton 88px, geri butonu 88px, select-none; ScenarioForm hızlı konu chip’leri 48px, enterKeyHint="go"
- [x] **iOS WebKit speech:** speechEngine preloadVoices(), cancelSpeech() double-cancel (iOS 17), visibilitychange → speechSynthesis.resume()
- [x] **Test altyapısı:** Vitest; `__tests__/api/generate.test.ts` (POST /api/generate); `__tests__/lib/scenarioCache.test.ts` (cache hit); `__tests__/components/ScenarioForm.test.tsx`; `__tests__/lib/speechEngine.test.ts` (waitMs, cancelSpeech, playScenario ilk yield)

**Manuel doğrulama (isteğe bağlı):** iOS PWA “Add to Home Screen”, standalone görünüm, sürüşte kullanılabilirlik, Türkçe TTS atlama.

---

## Prisma Modelleri (Güncel)

```prisma
model Course {
  id          String   @id
  title       String
  description String
  emoji       String
  color       String
  order       Int      @default(0)
  category    String
  subcategory String?
  lessons     Lesson[]
}

model Lesson {
  id       String @id
  courseId String
  title    String
  order    Int    @default(0)
  content  Json
  course   Course @relation(fields: [courseId], references: [id], onDelete: Cascade)
  @@index([courseId])
}

model CustomLesson {
  id        String   @id @default(cuid())
  userId    String
  title     String
  content   Json
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  @@index([userId])
}
```

`Progress` modeline eklenecek alanlar:
```prisma
completionCount Int @default(0)
targetCount     Int @default(4)
```
