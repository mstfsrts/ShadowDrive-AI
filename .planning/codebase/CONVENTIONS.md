# Coding Conventions

**Analysis Date:** 2026-03-02

## Naming Patterns

**Files:**
- camelCase for utility/library files: `speechEngine.ts`, `scenarioCache.ts`, `voiceSelector.ts`, `gemini.ts`
- PascalCase for React components: `AudioPlayer.tsx`, `ScenarioForm.tsx`, `LessonPreview.tsx`, `AuthModal.tsx`
- Route files: `route.ts` (Next.js convention)
- kebab-case for directories: `/api/ai-lessons`, `/api/custom-lessons`, `/api/auth`

**Functions:**
- camelCase for all function names: `playScenario()`, `getCachedScenario()`, `cancelSpeech()`, `buildPrompt()`
- Async functions use `Async` suffix where clarity needed: `speakAsync()` in `lib/speechEngine.ts`
- Private helper functions prefixed with underscore: Not observed; generally avoid (use file scope)
- Exported functions documented with JSDoc

**Variables:**
- camelCase for local variables and state: `topic`, `isLoading`, `currentStatus`, `hasStarted`
- UPPER_SNAKE_CASE for constants: `CEFR_LEVELS`, `QUICK_TOPICS`, `MODEL_CANDIDATES`, `CACHE_PREFIX`
- Ref variables use `Ref` suffix: `abortControllerRef`, `isPlayingRef`, `currentLineIndexRef` (in `AudioPlayer.tsx`)
- State variables describe what they hold: `isPlaying`, `phase`, `hasStarted`, `currentStatus`

**Types:**
- PascalCase for interface/type names: `Scenario`, `DialogueLine`, `PlaybackStatus`, `PlaybackPhase`, `CEFRLevel`
- Discriminated union types used for variants: `PlaybackPhase = 'target' | 'pause' | 'native' | 'repeat' | 'gap'`
- Request/response types: `GenerateRequest`, `ScenarioSchema` (Zod validation)
- Props interfaces: `{ComponentName}Props` pattern: `AudioPlayerProps`, `ScenarioFormProps`

## Code Style

**Formatting:**
- No explicit Prettier or ESLint config detected (Next.js default: 4 spaces, semicolons enabled)
- Line length: ~100-120 characters based on observed code
- Imports grouped: React/Next → third-party → local imports with `@/` path aliases
- Multiline JSX: attributes on separate lines when className gets long
- Ternary operators: multiline when condition or branches are complex

**Example formatting (from ScenarioForm.tsx):**
```tsx
<input
    id="topic-input"
    type="text"
    value={topic}
    onChange={(e) => setTopic(e.target.value)}
    placeholder="örn. Yeni iş arkadaşlarımla tanışma"
    enterKeyHint="go"
    className="w-full bg-card border border-border rounded-2xl px-5 py-4 text-foreground text-lg
     placeholder-foreground-muted focus:outline-none focus:border-neon-green focus:ring-2
     focus:ring-neon-green/30 transition-all duration-300"
    disabled={isLoading}
    autoComplete="off"
/>
```

**Linting:**
- No custom ESLint rules found (uses Next.js default: `eslint-config-next`)
- `npm run lint` available (from package.json)
- TypeScript strict mode enabled (`"strict": true` in tsconfig.json)
- Type checking on build

## Import Organization

**Order:**
1. React/Next imports: `import { useState, useRef } from 'react'`
2. Next server/client utilities: `import { NextRequest, NextResponse } from 'next/server'`
3. Third-party library imports: `import { GoogleGenerativeAI } from '@google/generative-ai'`
4. Validation/schema imports: `import { z } from 'zod'`
5. Internal type imports: `import type { Scenario, CEFRLevel } from '@/types/dialogue'`
6. Internal function imports: `import { playScenario, cancelSpeech } from '@/lib/speechEngine'`
7. Component imports: `import AudioPlayer from './AudioPlayer'`

**Path Aliases:**
- `@/*` maps to project root (configured in tsconfig.json)
- Used consistently: `@/lib/`, `@/components/`, `@/types/`, `@/app/api/`
- Never use relative paths beyond immediate imports

## Error Handling

**Patterns:**
- Try-catch with null/undefined returns: `getCachedScenario()` returns `null` on parse error
- Logging on errors: `console.warn()` for non-fatal issues (cache failures, parsing errors)
- Promise rejection for synchronous checks: `waitMs()` rejects with `DOMException('Aborted', 'AbortError')`
- API route error responses: structured JSON with `error` field and appropriate HTTP status codes

**Example (from generate/route.ts):**
```typescript
// Validation error
if (!parsed.title || !Array.isArray(parsed.lines) || parsed.lines.length < 4) {
    return NextResponse.json({ error: 'Invalid scenario format' }, { status: 422 });
}

// JSON parse error
try {
    const parsed = ScenarioSchema.parse(JSON.parse(cleanedJson));
} catch {
    return NextResponse.json({ error: 'AI returned invalid JSON' }, { status: 502 });
}

// Zod validation
const validated = RequestSchema.parse(body);
```

- Graceful degradation: no API key → fallback to offline scenarios
- Abort signals: `waitMs()` and `playScenario()` respect AbortController for cancellation

## Logging

**Framework:** Native `console` methods

**Patterns:**
- **Modules use bracketed scope markers:** `[SpeechEngine]`, `[Cache]`, `[Gemini]`, `[AudioPlayer]`
- **Success logs:** use `console.log()` with emoji indicators
  - Cache hit: `[Cache] ✅ HIT for "${key}" — ${parsed.lines.length} lines`
  - Cache save: `[Cache] 💾 Saved scenario to "${key}"`
  - Voice load: `[SpeechEngine] Voices loaded: ...`
- **Warnings:** use `console.warn()` for recoverable errors
  - Parse failures: `console.warn(\`[Cache] Failed to parse cached scenario for key "${key}"\`)`
  - Fallback to next provider: `console.warn(\`[Gemini] Resolved model failed, falling back to candidates. Error: ...\`)`
- **Informational:** use `console.log()` for tracking execution flow
  - AI provider selection: `console.log(\`[Gemini] Trying model: ${modelName}...\`)`

**When to log:**
- Entry/exit of major operations (AI generation, speech synthesis, cache operations)
- Provider selection and fallback activation
- Parse/validation failures
- Warnings about deprecated code or workarounds (e.g., iOS 17 cancel workaround)

**When NOT to log:**
- Every state change in React components
- Successful parse/cache operations unless debugging (avoid noise)
- Inside tight loops or frequently-called functions

## Comments

**When to Comment:**
- Complex algorithms requiring explanation: `playScenario()` generator logic documented
- Workarounds for browser quirks: iOS 17 cancel behavior, voice loading delays
- Non-obvious intent: CEFR grammar guidelines in prompt building
- Public API documentation: JSDoc for exported functions

**JSDoc/TSDoc:**
- Used for all public exports: `export function speakAsync(...)` has JSDoc
- Format: `/** Explanation */ export function name(...)`
- Includes parameter descriptions and return types when non-obvious
- Example (from speechEngine.ts):
  ```typescript
  /**
   * Speak text aloud using the Web Speech API.
   * Uses the best available voice for the language and adjusts rate by CEFR level.
   * Returns a Promise that resolves with the approximate duration in ms.
   */
  export function speakAsync(text: string, lang: string, level?: CEFRLevel): Promise<number>
  ```

**Comment Style:**
- Section headers use box drawing: `// ─── ShadowDrive AI — {Module Name} ───`
- Subsection separators: `// ─── {Subsection} ───`
- Single-line explanations: `// iOS: lock body scroll during playback`
- Multi-line explanations: Standard JSDoc format

## Function Design

**Size:**
- Target: 15-40 lines for pure functions, 30-60 for async handlers
- Larger functions broken into smaller helpers
- Example: `buildPrompt()` in generate/route.ts is ~150 lines (intentionally long for single responsibility: CEFR prompt assembly)

**Parameters:**
- Positional args for < 3 parameters: `waitMs(ms, signal)`
- Object destructuring for > 3: `ScenarioForm({ onSubmit, isLoading })`
- Props interfaces for React components (always destructured)
- Optional parameters marked with `?`: `startFromIndex?: number`

**Return Values:**
- Explicit types on exported functions: `export function speakAsync(...): Promise<number>`
- Nullable returns use `| null`: `getCachedScenario(...): Scenario | null`
- Union types for discriminated returns: `PlaybackPhase = 'target' | 'pause' | ...`
- Async functions return Promises: `generateWithFallback(prompt: string): Promise<string>`

**Example (from speechEngine.ts):**
```typescript
export function speakAsync(text: string, lang: string, level?: CEFRLevel): Promise<number> {
    return new Promise((resolve, reject) => {
        // ... implementation
    });
}

export function waitMs(ms: number, signal?: AbortSignal): Promise<void> {
    return new Promise((resolve, reject) => {
        // ... implementation
    });
}

export function cancelSpeech(): void {
    // ... void return
}
```

## Module Design

**Exports:**
- One default export per file (for components): `export default function AudioPlayer(...)`
- Named exports for utilities/libraries: `export { speakAsync, waitMs, cancelSpeech }`
- Type exports use `export type { Scenario, CEFRLevel }`

**Barrel Files:**
- Not observed in codebase (imports use specific file paths)
- Avoided in favor of explicit path imports

**Module Cohesion:**
- One responsibility per file: `speechEngine.ts` handles only speech synthesis, not caching
- Related utilities grouped in same file: `voiceSelector.ts` has `getBestVoice()`, `getRateForLevel()`, `clearVoiceCache()`
- UI logic separated from business logic: `AudioPlayer.tsx` uses `playScenario()` from `speechEngine.ts`

## Client vs Server

**Use 'use client' directive:**
- All React components: `AudioPlayer.tsx`, `ScenarioForm.tsx`, `LessonPreview.tsx`
- Client-side hooks required: `useState`, `useCallback`, `useRef`, `useEffect`
- Web APIs needed: `window.speechSynthesis`, `localStorage`, `AbortController`

**Server-only modules:**
- API routes: `app/api/generate/route.ts`
- Prisma operations: `lib/prisma.ts` (database queries)
- Environment secrets: `GEMINI_API_KEY`, `OPENROUTER_API_KEY` accessed in route handlers

---

*Convention analysis: 2026-03-02*
