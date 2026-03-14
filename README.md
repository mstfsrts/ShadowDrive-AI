# ShadowDrive AI

[English](#-english) | [Turkce](#-turkce)

---

# English

**Learn Dutch while you drive** — a mobile-first, hands-free language learning PWA for Turkish professionals living in the Netherlands.

## Features

| Feature | Description |
|---------|-------------|
| Shadow Learning Loop | Dutch > Pause > Turkish > Repeat — fully hands-free audio cycle |
| Offline Courses | 3 structured Delftse Methode courses, no internet required |
| AI Scenario Generator | Create custom lessons on any topic using Google Gemini |
| Custom Text Input | Paste your own sentences and practice instantly |
| Authentication | Email/password + Google OAuth with NextAuth v5 |
| Progress Tracking | Lesson completion, pronunciation scores, learning streaks |
| iOS PWA | Add to home screen, full-screen, works offline |
| Driving Safety | Ultra-dark theme, giant buttons, scroll lock during playback |
| Smart Fallback | Automatic offline lesson when API is unavailable |
| Multi-language UI | Turkish and English interface via next-intl |

## Architecture

```
shadowdrive-ai/
├── frontend/                     # Next.js 14 PWA (App Router)
│   ├── app/
│   │   ├── dashboard/            # Protected learning dashboard
│   │   │   ├── courses/          # Structured Delftse Methode courses
│   │   │   ├── ai/               # AI scenario generator
│   │   │   ├── custom/           # Custom text lessons
│   │   │   └── profile/          # User profile & goals
│   │   ├── play/[type]/[id]/     # 6-phase playback engine
│   │   ├── auth/                 # OAuth callbacks
│   │   ├── api/                  # Next.js route handlers
│   │   └── layout.tsx            # PWA meta, iOS safe areas
│   ├── components/               # AudioPlayer, AuthModal, Toast, etc.
│   ├── lib/                      # speechEngine, gemini, cache, etc.
│   ├── messages/                 # i18n translations (en, tr)
│   └── __tests__/                # Vitest test suites
│
├── backend/                      # Express.js REST API
│   └── src/
│       ├── routes/               # auth, courses, generate, progress, etc.
│       ├── middleware/            # JWT auth, rate limiting
│       └── services/             # Prisma, Gemini, OpenRouter
│
├── mobile/                       # React Native / Expo (planned)
│
├── packages/shared/              # Shared TypeScript types
│
├── prisma/
│   ├── schema.prisma             # PostgreSQL schema (14 models)
│   ├── migrations/               # Database migrations
│   └── seed.ts                   # Course data seeding
│
├── Dockerfile                    # Multi-stage build
├── docker-compose.yml            # MySQL + Backend + Frontend + Nginx
├── docker-entrypoint.sh          # Migrate > Seed > Start
└── nginx.conf                    # Reverse proxy (/api > backend)
```

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | Next.js 14 (App Router), TypeScript 5, Tailwind CSS 3.4 |
| **Backend** | Express.js 4, TypeScript, JWT Authentication |
| **Database** | PostgreSQL, Prisma ORM 6.19 |
| **Auth** | NextAuth v5 (Email/Password + Google OAuth) |
| **AI** | Google Gemini API + OpenRouter (fallback chain) |
| **Audio** | Web Speech API (TTS + Speech Recognition) |
| **i18n** | next-intl (Turkish, English) |
| **Email** | Resend |
| **Testing** | Vitest + Testing Library |
| **PWA** | Service Worker + Web App Manifest |
| **Deployment** | Docker, Nginx, Dokploy |
| **Mobile** | React Native / Expo (planned) |

## How the Speech Engine Works

```
For each phrase, a 6-phase loop:

1. TARGET   > Dutch phrase spoken aloud
2. PAUSE    > User repeats
3. NATIVE   > Turkish translation shown
4. GAP      > Short pause (800ms)
5. REPEAT   > Dutch phrase spoken again
6. PAUSE    > User repeats once more
```

## AI Model Fallback Chain

API calls are capped at **15 seconds** (drivers can't wait):

```
gemini-2.0-flash-lite > gemini-2.0-flash > gemini-2.5-flash > OpenRouter fallback
```

If all models fail, an offline lesson loads seamlessly.

## Database Models

| Model | Purpose |
|-------|---------|
| **User** | User accounts with email, password, OAuth |
| **Account / Session** | Auth.js v5 session management |
| **Course / Lesson** | Structured course content |
| **Progress** | Lesson completion tracking |
| **GeneratedScenario** | Cached AI-generated lessons |
| **CustomLesson** | User-created lessons |
| **Favorite** | Bookmarked lessons |
| **PronunciationAttempt** | Speech recognition results |
| **LessonReport** | Performance analytics |
| **DailyActivity** | Daily practice stats |
| **UserGoal** | Learning targets |

## Getting Started

### Prerequisites

- **Node.js** 18+
- **PostgreSQL** (or use Docker)
- **Gemini API Key** — [get one free](https://aistudio.google.com/apikey)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/AhmetFatihSawormo/ShadowDrive-AI.git
cd shadowdrive-ai

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env.local
# Edit .env.local: DATABASE_URL, GEMINI_API_KEY, JWT_SECRET

# 4. Set up database
npm run db:migrate
npm run db:seed

# 5. Start development
npm run dev            # Frontend (port 3000)
npm run dev:backend    # Backend (port 4000)
```

### Docker

```bash
docker-compose up --build
# Services: MySQL (3306) + Backend (4000) + Frontend (3000) + Nginx (80)
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## iOS Installation (PWA)

1. Open the app URL in **Safari** on your iPhone
2. Tap the **Share** button
3. Select **Add to Home Screen**
4. The app runs full-screen and works offline

## Testing

```bash
npm test               # Run all tests
npm run test:watch     # Watch mode
npm run test:coverage  # Coverage report
```

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start frontend dev server (port 3000) |
| `npm run dev:backend` | Start backend dev server (port 4000) |
| `npm run build` | Build frontend for production |
| `npm run build:backend` | Build backend (TypeScript) |
| `npm run test` | Run Vitest test suites |
| `npm run db:migrate` | Run Prisma database migrations |
| `npm run db:seed` | Seed database with course data |
| `npm run db:generate` | Generate Prisma Client |

## Roadmap

- [x] **Phase 0-4**: Core app — Next.js, Gemini AI, TTS, PWA
- [x] **Phase 5**: AI development skills integration
- [x] **Phase 6**: QA & test infrastructure (Vitest)
- [x] **Phase 7**: iOS adaptation (safe areas, WebKit fixes)
- [x] **Phase 8**: Backend & database (Express, PostgreSQL, NextAuth, user profiles)
- [ ] **Phase 9**: Project restructuring & performance optimization
- [ ] **Phase 10**: URL-based routing & browser navigation
- [ ] **Phase 11**: Natural TTS (ElevenLabs pre-recorded audio)
- [ ] **Phase 12**: Speech recognition & pronunciation scoring
- [ ] **Phase 13**: User progress panel & statistics
- [ ] **Phase 14**: React Native mobile app (iOS + Android)

## Contributing

Contributions are welcome!

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

---

# Turkce

**Araba surerken Hollandaca ogrenin** — Hollanda'da yasayan Turk profesyoneller icin mobil oncelikli, eller serbest dil ogrenme uygulamasi.

## Ozellikler

| Ozellik | Aciklama |
|---------|----------|
| Golge Ogrenme Dongusu | Hollandaca > Duraklama > Turkce > Tekrar — tamamen eller serbest ses dongusu |
| Cevrimdisi Kurslar | 3 yapilandirilmis Delftse Methode kursu, internet gerektirmez |
| Yapay Zeka Senaryo Uretici | Google Gemini ile her konuda ozel ders olusturun |
| Ozel Metin Girisi | Kendi cumlelerinizi yapistirin ve aninda pratik yapin |
| Kimlik Dogrulama | E-posta/sifre + Google OAuth, NextAuth v5 ile |
| Ilerleme Takibi | Ders tamamlama, telaffuz puanlari, ogrenme serileri |
| iOS PWA | Ana ekrana ekleyin, tam ekran, cevrimdisi calisir |
| Surucu Guvenligi | Ultra karanlik tema, buyuk butonlar, kaydirma kilidi |
| Akilli Yedekleme | API kullanilamadiginda otomatik cevrimdisi ders |
| Cok Dilli Arayuz | next-intl ile Turkce ve Ingilizce arayuz |

## Mimari

```
shadowdrive-ai/
├── frontend/                     # Next.js 14 PWA (App Router)
│   ├── app/
│   │   ├── dashboard/            # Korumali ogrenme paneli
│   │   │   ├── courses/          # Yapilandirilmis Delftse Methode kurslari
│   │   │   ├── ai/               # Yapay zeka senaryo uretici
│   │   │   ├── custom/           # Ozel metin dersleri
│   │   │   └── profile/          # Kullanici profili ve hedefler
│   │   ├── play/[type]/[id]/     # 6 fazli kaydirma motoru
│   │   ├── auth/                 # OAuth geri donusleri
│   │   ├── api/                  # Next.js route handler'lari
│   │   └── layout.tsx            # PWA meta, iOS guvenli alanlar
│   ├── components/               # AudioPlayer, AuthModal, Toast, vb.
│   ├── lib/                      # speechEngine, gemini, cache, vb.
│   ├── messages/                 # i18n ceviriler (en, tr)
│   └── __tests__/                # Vitest test takimlari
│
├── backend/                      # Express.js REST API
│   └── src/
│       ├── routes/               # auth, courses, generate, progress, vb.
│       ├── middleware/            # JWT dogrulama, hiz sinirlandirma
│       └── services/             # Prisma, Gemini, OpenRouter
│
├── mobile/                       # React Native / Expo (planli)
│
├── packages/shared/              # Paylasilan TypeScript tipleri
│
├── prisma/
│   ├── schema.prisma             # PostgreSQL semasi (14 model)
│   ├── migrations/               # Veritabani migrasyonlari
│   └── seed.ts                   # Kurs verisi tohumlama
│
├── Dockerfile                    # Cok asamali derleme
├── docker-compose.yml            # MySQL + Backend + Frontend + Nginx
├── docker-entrypoint.sh          # Migrasyon > Tohumlama > Baslat
└── nginx.conf                    # Ters vekil (/api > backend)
```

## Teknoloji Yigini

| Katman | Teknoloji |
|--------|-----------|
| **Frontend** | Next.js 14 (App Router), TypeScript 5, Tailwind CSS 3.4 |
| **Backend** | Express.js 4, TypeScript, JWT Dogrulama |
| **Veritabani** | PostgreSQL, Prisma ORM 6.19 |
| **Kimlik Dogrulama** | NextAuth v5 (E-posta/Sifre + Google OAuth) |
| **Yapay Zeka** | Google Gemini API + OpenRouter (yedekleme zinciri) |
| **Ses** | Web Speech API (TTS + Konusma Tanima) |
| **i18n** | next-intl (Turkce, Ingilizce) |
| **E-posta** | Resend |
| **Test** | Vitest + Testing Library |
| **PWA** | Service Worker + Web App Manifest |
| **Dagitim** | Docker, Nginx, Dokploy |
| **Mobil** | React Native / Expo (planli) |

## Ses Motoru Nasil Calisir

```
Her ifade icin 6 fazli dongu:

1. HEDEF     > Hollandaca ifade sesli okunur
2. DURAKLAMA > Kullanici tekrarlar
3. ANA DIL   > Turkce ceviri gosterilir
4. BOSLUK    > Kisa duraklama (800ms)
5. TEKRAR    > Hollandaca ifade tekrar okunur
6. DURAKLAMA > Kullanici son kez tekrarlar
```

## Yapay Zeka Model Yedekleme Zinciri

API cagrilari **15 saniye** ile sinirlidir (surucular bekleyemez):

```
gemini-2.0-flash-lite > gemini-2.0-flash > gemini-2.5-flash > OpenRouter yedekleme
```

Tum modeller basarisiz olursa, cevrimdisi bir ders otomatik olarak yuklenir.

## Veritabani Modelleri

| Model | Amac |
|-------|------|
| **User** | E-posta, sifre, OAuth ile kullanici hesaplari |
| **Account / Session** | Auth.js v5 oturum yonetimi |
| **Course / Lesson** | Yapilandirilmis kurs icerigi |
| **Progress** | Ders tamamlama takibi |
| **GeneratedScenario** | Onbellekteki yapay zeka dersleri |
| **CustomLesson** | Kullanici olusturmus dersler |
| **Favorite** | Isaretlenmis dersler |
| **PronunciationAttempt** | Konusma tanima sonuclari |
| **LessonReport** | Performans analizleri |
| **DailyActivity** | Gunluk pratik istatistikleri |
| **UserGoal** | Ogrenme hedefleri |

## Baslangic

### On Kosullar

- **Node.js** 18+
- **PostgreSQL** (veya Docker kullanin)
- **Gemini API Key** — [ucretsiz alin](https://aistudio.google.com/apikey)

### Kurulum

```bash
# 1. Depoyu klonlayin
git clone https://github.com/AhmetFatihSawormo/ShadowDrive-AI.git
cd shadowdrive-ai

# 2. Bagimliliklari yukleyin
npm install

# 3. Ortam degiskenlerini ayarlayin
cp .env.example .env.local
# .env.local dosyasini duzenleyin: DATABASE_URL, GEMINI_API_KEY, JWT_SECRET

# 4. Veritabanini kurun
npm run db:migrate
npm run db:seed

# 5. Gelistirmeyi baslatin
npm run dev            # Frontend (port 3000)
npm run dev:backend    # Backend (port 4000)
```

### Docker

```bash
docker-compose up --build
# Servisler: MySQL (3306) + Backend (4000) + Frontend (3000) + Nginx (80)
```

Tarayicinizda [http://localhost:3000](http://localhost:3000) adresini acin.

## iOS Kurulumu (PWA)

1. iPhone'da **Safari** ile uygulama URL'sini acin
2. **Paylas** butonuna dokunun
3. **Ana Ekrana Ekle** secin
4. Uygulama tam ekran calisir ve cevrimdisi kullanilabilir

## Testler

```bash
npm test               # Tum testleri calistir
npm run test:watch     # Izleme modu
npm run test:coverage  # Kapsam raporu
```

## Kullanilabilir Komutlar

| Komut | Aciklama |
|-------|----------|
| `npm run dev` | Frontend gelistirme sunucusunu baslat (port 3000) |
| `npm run dev:backend` | Backend gelistirme sunucusunu baslat (port 4000) |
| `npm run build` | Frontend'i uretim icin derle |
| `npm run build:backend` | Backend'i derle (TypeScript) |
| `npm run test` | Vitest test takimlarini calistir |
| `npm run db:migrate` | Prisma veritabani migrasyonlarini calistir |
| `npm run db:seed` | Veritabanini kurs verileriyle tohumla |
| `npm run db:generate` | Prisma Client olustur |

## Yol Haritasi

- [x] **Faz 0-4**: Temel uygulama — Next.js, Gemini AI, TTS, PWA
- [x] **Faz 5**: Yapay zeka gelistirme becerileri entegrasyonu
- [x] **Faz 6**: Kalite kontrol ve test altyapisi (Vitest)
- [x] **Faz 7**: iOS uyarlamasi (guvenli alanlar, WebKit duzeltmeleri)
- [x] **Faz 8**: Backend ve veritabani (Express, PostgreSQL, NextAuth, kullanici profilleri)
- [ ] **Faz 9**: Proje yeniden yapilandirma ve performans optimizasyonu
- [ ] **Faz 10**: URL tabanli yonlendirme ve tarayici navigasyonu
- [ ] **Faz 11**: Dogal TTS (ElevenLabs onceden kaydedilmis ses)
- [ ] **Faz 12**: Konusma tanima ve telaffuz puanlama
- [ ] **Faz 13**: Kullanici ilerleme paneli ve istatistikler
- [ ] **Faz 14**: React Native mobil uygulama (iOS + Android)

## Katki

Katkilar memnuniyetle karsilanir!

1. Depoyu fork'layin
2. Ozellik dalinizi olusturun (`git checkout -b feature/harika-ozellik`)
3. Degisikliklerinizi commit'leyin (`git commit -m 'feat: harika ozellik ekle'`)
4. Dali push'layin (`git push origin feature/harika-ozellik`)
5. Pull Request acin

## Lisans

Bu proje MIT Lisansi ile lisanslanmistir — detaylar icin [LICENSE](LICENSE) dosyasina bakin.
