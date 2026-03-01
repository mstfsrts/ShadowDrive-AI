# ShadowDrive AI — Feature Roadmap (Phase 4–7)

> Bu dosya aktif geliştirme yol haritasıdır. Her session'da buradan ilerlenecek.
> Son güncelleme: 2026-03-01

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
**Durum:** ⏳ Bekliyor

Hedef: Tüm sekmelerde ders tamamlanma sayısı + resume özelliği.

**Aralıkli Tekrar Mantığı:**
| Kavram | Değer |
|--------|-------|
| Hedef seans sayısı (varsayılan) | **4** (farklı günlerde) |
| Minimum seans | 4 (değiştirilemez) |
| Maksimum seans | 20 (kullanıcı artırabilir) |
| Her seansta cümle tekrarı | **2x** (speechEngine'de mevcut) |
| "Tam öğrenildi" eşiği | `completionCount >= targetCount` |

**Yapılacaklar:**
- [ ] `Progress` modeline `completionCount` + `targetCount` alanları ekle
- [ ] `POST /api/progress` + `GET /api/progress` API route'ları
- [ ] `AudioPlayer`: `startFromIndex` prop + `onProgress` callback
- [ ] Dashboard: progress yükle, badge göster, resume desteği

**CourseId Kuralları:**
| Sekme | courseId | lessonId |
|-------|----------|----------|
| Kurslar | kursun id'si | dersin id'si |
| AI | `'ai'` | `generatedScenario.id` |
| Metnim | `'custom'` | `customLesson.id` |

---

### Phase 6: Metin Önizleme (Ses Yok)
**Durum:** ⏳ Bekliyor

Hedef: Araba kullanmadan diyalog metnini sessizce okuyarak gözden geçirme.

**Yapılacaklar:**
- [ ] `components/LessonPreview.tsx`: scrollable diyalog listesi (Hollandaca + Türkçe, ses yok)
- [ ] Kurslar / AI / Metnim sekmelerinde "👁 Önizle" butonu
- [ ] "▶ Dinlemeye Başla" butonu ile playback'e geçiş

---

### Phase 7: Kaydedilmiş Dersler — CRUD
**Durum:** ⏳ Bekliyor

Hedef: AI ve Metnim'deki içeriklerin hesaba kaydedilmesi, listelenmesi, düzenlenmesi, silinmesi.

**Yapılacaklar:**
- [ ] `CustomLesson` Prisma modeli ekle
- [ ] `GeneratedScenario`: authenticated kullanıcı için `userId` ile kaydet
- [ ] `GET/DELETE/PATCH /api/ai-lessons` + `GET/POST/PATCH/DELETE /api/custom-lessons`
- [ ] AI sekmesi: "Kaydedilmiş Senaryolar" listesi
- [ ] Metnim sekmesi: "Kaydedilmiş Metinlerim" listesi
- [ ] Her kayıt: Dinle / Önizle / Düzenle / Sil aksiyonları

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
