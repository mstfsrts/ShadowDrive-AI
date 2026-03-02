---
status: testing
phase: 7-kaydedilmis-dersler-crud
source: ["Phase 7 Implementation Summary"]
started: 2026-03-02T00:00:00Z
updated: 2026-03-02T00:00:00Z
---

## Current Test

number: 1
name: "Generate AI Lesson and Verify Save State"
expected: |
  1. AI sekmesine gir
  2. Tema, seviye seç, "Oluştur" tıkla
  3. Senaryo kartı gösterilsin (başlık, satır sayısı, 👁 Önizle / ▶ Dinle / 💾 Kaydet butonları)
  4. Kayıt durumu gösterilsin (pending/saved indicator)
awaiting: user response

## Tests

### 1. Generate AI Lesson and Verify Save State
expected: |
  Generated lesson card appears with title, line count, preview/play buttons.
  Save status indicator shows loading/saved state.
result: pending

### 2. Save AI Lesson to Database
expected: |
  Click 💾 Kaydet on generated lesson.
  Lesson appears in "Kaydedilmiş Senaryolar" list below.
  Card shows: title, progress badges (Öğrenildi/X/Y), 👁 Önizle / ▶ Dinle / ✏ Yeniden Adlandır / 🗑 Sil butonları.
result: pending

### 3. Create Custom Lesson
expected: |
  Metnim sekmesi: başlık, içerik gir, "Oluştur" tıkla.
  Senaryo kartı gösterilsin.
result: pending

### 4. Save Custom Lesson to Database
expected: |
  Click 💾 Kaydet on custom lesson.
  Lesson appears in "Kaydedilmiş Metinlerim" list.
result: pending

### 5. Rename AI Lesson Inline
expected: |
  SavedLessonCard: ✏ butonu tıkla.
  Title input gösterilsin (editlenebilir).
  Enter/blur ile gönder, Escape ile iptal.
  Başarılı: toast gösterilsin, API POST /api/ai-lessons/[id].
result: pending

### 6. Rename Custom Lesson Inline
expected: |
  Custom lesson: ✏ butonu tıkla, inline edit, Enter/blur ile kaydet.
result: pending

### 7. Delete AI Lesson
expected: |
  SavedLessonCard: 🗑 butonu tıkla.
  Confirmation modal gösterilsin.
  Onay: DELETE /api/ai-lessons/[id], lesson listesinden kalksin.
  Hata: toast gösterilsin ("Silinemedi, tekrar deneyin").
result: pending

### 8. Delete Custom Lesson
expected: |
  Custom lesson: 🗑 butonu tıkla, confirmation modal, DELETE /api/custom-lessons/[id].
result: pending

### 9. Preview Saved AI Lesson
expected: |
  SavedLessonCard 👁 Önizle tıkla.
  LessonPreview açılsın, Dutch + Turkish diyalog gösterilsin.
  Her cümlenin ▶ butonuyla tek cümle seslendirilsin.
result: pending

### 10. Play Saved AI Lesson with Resume
expected: |
  SavedLessonCard ▶ Dinle tıkla.
  localStorage'dan "kaldığın yerden devam" kontrolü yap.
  If lastLineIndex > 0: ResumePromptModal gösterilsin.
  Onay: lastLineIndex'ten başla. Red: sıfırdan başla.
result: pending

### 11. Progress Badges on Saved Lessons
expected: |
  SavedLessonCard progress badges gösterilsin (LessonProgressBadges).
  Örn: "★ Öğrenildi" veya "1/4" veya boş.
  Playback'ten complete tıklanınca: completion DB'ye kaydedilsin, badge güncellensin.
result: pending

### 12. IDOR Protection (Ownership Check)
expected: |
  User A'nın dersi User B'nin token'ı ile DELETE/PATCH yapılamaz.
  API: 404 Unauthorized dönmeli veya session check fail.
result: pending

### 13. Input Validation (Max Length)
expected: |
  /api/ai-lessons POST: title > 200 chars → 400 "Başlık veya konu en fazla 200 karakter olabilir"
  /api/custom-lessons POST: content > 200 chars → 400 (aynı mesaj)
result: pending

### 14. Offline Fallback
expected: |
  Login olmadan AI Oluştur tıkla.
  Eğer LLM fail ise: offline course load (cevrimdisi ders yüklendi toast).
  Kaydet butonları görünmemeli (authenticated users only).
result: pending

## Summary

total: 14
passed: 0
issues: 0
pending: 14
skipped: 0

## Gaps

<!-- Fill as issues are reported -->
