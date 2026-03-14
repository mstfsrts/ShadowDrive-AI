# ShadowDrive AI - Mobile Architecture & Expo Transition Plan

This document outlines the strategy for migrating the Next.js PWA into a fully native Expo (React Native) application, ensuring offline capabilities and massive touch targets for the driving context.

## 1. Authentication Flow Strategy (NextAuth v5 to Expo)

NextAuth v5 (Auth.js) by default uses secure HTTP-only session cookies. In a React Native context, handling browser cookies across `fetch` requests can be brittle.

**The Strategy: Native JWT Bearer Tokens**
1. **Login API:** The mobile app will not use the NextAuth web interface. We will expose a strict REST endpoint (e.g., `POST /api/mobile/login`) that validates credentials (using `bcrypt.compare`) and manually generates a signed JWT using `jose` or the same secret NextAuth uses.
2. **Secure Store:** The generated JWT will be stored on the mobile device using `expo-secure-store`.
3. **API Middleware:** Every request from the Expo app will attach `Authorization: Bearer <token>`. 
4. **Next.js Validation:** The Next.js API routes will be updated to check `auth()` (for web cookies) **OR** validate the incoming Bearer token manually.

## 2. Strict REST/JSON API Standards

Currently, many forms and direct client interactions in the codebase rely on Next.js Server Actions or tightly-coupled route handlers.

For Expo compatibility:
- **No Server Actions Mobile usage:** Expo cannot process generic Next.js Server Actions natively easily. 
- **Standardized Endpoints:** All AI interactions, Progress saves, and Profile updates have been mapped to standardized `pages/api` or `app/api/.../route.ts` handlers relying purely on JSON payloads.
  - `POST /api/progress`
  - `PATCH /api/profile/update`
  - `POST /api/generate`
- **Error Handling:** All API routes must return standard `400 Bad Request`, `401 Unauthorized`, or `500 Internal Server Error` with a consistent JSON shape: `{ error: "Message details" }` instead of raw strings or HTML.

## 3. Hands-Free & "Voice-First" Expo Libraries

To replicate the ShadowDrive "driving loop" in React Native:
- **Speech Synthesis:** We will migrate from Web `window.speechSynthesis` to `expo-speech` for highly reliable native TTS.
- **Audio Recording:** the `expo-av` library will handle microphone recording.
- **Background Audio:** We MUST configure `expo-av` audio modes (`Audio.setAudioModeAsync`) to prevent the phone from sleeping and ensuring background playback continues if the user switches to Apple Maps or Google Maps while driving.

## 4. MinIO Integration (Offline capability)

- Recordings (Phase C) currently saved to MinIO will require the Expo app to cache audio buffers locally (`expo-file-system`) if the lessons are downloaded for absolute offline mode.
