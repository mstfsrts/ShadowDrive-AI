# SHADOWDRIVE AI - ANTIGRAVITY AGENT PROTOCOLS

## 1. THE MISSION (SYSTEM CONTEXT)
We are building a Mobile-First, Hands-Free PWA (Progressive Web App) for language learning (Dutch/English) designed strictly for commuters driving a car.
- The user cannot look at the screen or touch buttons while driving.
- The core loop: Target Language Audio -> Calculated Silence (for user to speak) -> Native Language Audio -> Target Language Audio.

## 2. TECH STACK & CONSTRAINTS
- Frontend: Next.js 14+ (App Router), Tailwind CSS.
- Mobile UI: Extreme High-Contrast Dark Mode. Massive touch targets for car mounts. No complex menus.
- Backend/Auth: NextAuth v5 + Prisma (PostgreSQL).
- AI Logic: Gemini API (Generate JSON scenario dialogues).
- Voice: `window.speechSynthesis` (Web Speech API) ONLY. No paid audio APIs.

## 3. MULTI-AGENT ROLE DEFINITIONS
Antigravity Agents, you will divide and conquer based on these roles:

### ROLE: THE ARCHITECT (Planner Agent)
- Task: Write the "Implementation Plan" and "Task List" artifacts before any code is written.
- Constraint: Ensure the architecture supports a clean separation between UI components and the Audio Playback Engine.

### ROLE: THE FRONTEND/UI ENGINEER (UI Agent)
- Task: Build `app/page.tsx` and the Scenario Input Form.
- Constraint: Use Tailwind. Background must be `bg-gray-950`. Primary action button must be huge, neon green (`bg-emerald-500`), and easily tappable without looking. Add PWA manifest so it installs like a native mobile app.

### ROLE: THE AUDIO ENGINE & AI INTEGRATOR (Logic Agent)
- Task: Connect the Gemini API route (`app/api/generate/route.ts`) and build the `AudioPlayer.tsx` core logic.
- Constraint: The audio loop MUST use `Promise` based logic with `setTimeout` to calculate exact pauses based on the length of the synthesized speech. 

### ROLE: THE QA / BROWSER AUTOMATION AGENT (Test Agent)
- Task: Use Antigravity's Browser Control tool to simulate a mobile viewport (iPhone/Android). 
- Constraint: You must test if the audio plays automatically (handling browser autoplay policies) and verify the timing of the pauses without human intervention.