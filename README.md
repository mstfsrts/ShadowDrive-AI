# 🚗 ShadowDrive AI

**Learn Dutch while you drive** — a mobile-first, hands-free language learning PWA for Turkish professionals living in the Netherlands.

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js" alt="Next.js 14" />
  <img src="https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-3.4-06B6D4?style=flat-square&logo=tailwindcss" alt="Tailwind" />
  <img src="https://img.shields.io/badge/Gemini_AI-2.5-4285F4?style=flat-square&logo=google" alt="Gemini" />
  <img src="https://img.shields.io/badge/PWA-Ready-10b981?style=flat-square" alt="PWA" />
</p>

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🎧 **Shadow Learning Loop** | Dutch → Pause → Turkish → Repeat — fully hands-free audio cycle |
| 📚 **Offline Courses** | 3 structured Delftse Methode courses, no internet required |
| 🤖 **AI Scenario Generator** | Create custom lessons on any topic using Google Gemini |
| ✍️ **Custom Text Input** | Paste your own sentences and practice instantly |
| 📱 **iOS PWA** | Add to home screen, full-screen, works offline |
| 🌙 **Driving Safety** | Ultra-dark theme, giant buttons, scroll lock during playback |
| 🔄 **Smart Fallback** | Automatic offline lesson when API is unavailable |

---

## 🏗 Architecture

```
shadowdrive-ai/
├── app/
│   ├── layout.tsx           # iOS viewport-fit, safe areas, PWA meta
│   ├── page.tsx             # Dual-engine: Courses | AI | Custom Text
│   ├── globals.css          # iOS standalone mode, playback-active lock
│   └── api/generate/        # Gemini API route (4-model fallback chain)
├── components/
│   ├── AudioPlayer.tsx      # 6-phase playback with driving-safe controls
│   ├── ScenarioForm.tsx     # Localized input form with quick-topic chips
│   ├── CustomTextForm.tsx   # Manual text input with instant preview
│   ├── StatusBar.tsx        # Phase indicator with emoji labels
│   └── Toast.tsx            # Auto-dismissing notification system
├── lib/
│   ├── speechEngine.ts      # Web Speech API engine, iOS voice preload
│   ├── gemini.ts            # Model fallback: 2.0-flash-lite → 2.5-flash
│   ├── scenarioCache.ts     # LocalStorage caching layer
│   ├── offlineScenarios.ts  # 5 pre-built Turkish offline scenarios
│   └── offline-courses.ts   # Structured Delftse Methode course data
├── types/dialogue.ts        # TypeScript interfaces
├── public/
│   ├── manifest.json        # PWA manifest
│   └── sw.js                # Service worker
├── __tests__/               # Vitest test suites (16 tests)
└── .agent/skills/           # AI development skills (3 skills)
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** 18+
- **Gemini API Key** — [get one free](https://aistudio.google.com/apikey)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/YOUR_USERNAME/shadowdrive-ai.git
cd shadowdrive-ai

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.local.example .env.local
# Edit .env.local and add your GEMINI_API_KEY

# 4. Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📱 iOS Installation (PWA)

1. Open `http://YOUR_IP:3000` in Safari on your iPhone
2. Tap the **Share** button
3. Select **Add to Home Screen**
4. The app runs full-screen and works offline

---

## 🧪 Testing

```bash
# Run all tests
npm test

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage
```

**16/16 tests passing**: speechEngine (7), scenarioCache (5), offlineScenarios (4)

---

## 🔊 How the Speech Engine Works

```
For each phrase, a 6-phase loop:

1. 🗣 TARGET   → Dutch phrase is spoken aloud
2. ⏸ PAUSE    → User repeats (calculated duration)
3. 🌍 NATIVE   → Turkish translation displayed (TTS skipped)
4. ⋯ GAP      → Short pause (800ms)
5. 🔁 REPEAT   → Dutch phrase spoken again
6. ⏸ PAUSE    → User repeats one final time
```

---

## 🤖 AI Model Fallback Chain

API calls are capped at **15 seconds** (drivers can't wait):

```
gemini-2.0-flash-lite → gemini-2.0-flash → gemini-2.5-flash → gemini-2.5-pro
```

If all models fail → an offline lesson loads seamlessly.

---

## 🛣 Roadmap

- [x] **Phase 0–4**: Core app (Next.js, Gemini, TTS, PWA)
- [x] **Phase 5**: AI development skills integration
- [x] **Phase 6**: QA & test infrastructure (Vitest)
- [x] **Phase 7**: iOS adaptation (safe areas, WebKit fixes)
- [ ] **Phase 8**: Self-hosted backend (PostgreSQL, NextAuth, user profiles)
- [ ] **Phase 9**: Performance optimization & haptic feedback

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS 3.4 |
| AI | Google Gemini API (free tier) |
| Audio | Web Speech API |
| Testing | Vitest + Testing Library |
| PWA | Service Worker + Web App Manifest |

---

## 🤝 Contributing

Contributions are welcome! Please open an issue or submit a pull request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
