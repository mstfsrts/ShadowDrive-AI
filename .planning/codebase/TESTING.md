# Testing Patterns

**Analysis Date:** 2026-03-02

## Test Framework

**Runner:**
- Vitest 4.0.18
- Config: `vitest.config.ts`
- Test environment: jsdom (browser simulation)
- Global test utilities enabled

**Assertion Library:**
- `@testing-library/jest-dom` (6.9.1) — for DOM matchers
- `@testing-library/react` (16.3.2) — for component rendering
- Native Vitest assertions: `expect()`

**Run Commands:**
```bash
npm test              # Run all tests (vitest run)
npm run test:watch   # Watch mode (vitest)
npm run test:coverage # Coverage report (vitest run --coverage)
```

**Test Summary (last run):**
- 16 passing tests across 5 files
- Files: `speechEngine.test.ts`, `scenarioCache.test.ts`, `offlineScenarios.test.ts`, `ScenarioForm.test.tsx`, `generate.test.ts`

## Test File Organization

**Location:**
- Tests co-located in `__tests__/` directory at project root (not spread across source)
- Structure mirrors source: `__tests__/lib/` mirrors `lib/`, `__tests__/components/` mirrors `components/`, `__tests__/api/` mirrors `app/api/`

**Naming:**
- Pattern: `{source}.test.ts` or `{source}.test.tsx`
- Examples: `speechEngine.test.ts`, `ScenarioForm.test.tsx`, `generate.test.ts`

**Directory Structure:**
```
__tests__/
├── setup.ts              # Global test setup (mocks Web Speech API, SpeechSynthesisUtterance)
├── lib/
│   ├── speechEngine.test.ts
│   ├── scenarioCache.test.ts
│   └── offlineScenarios.test.ts
├── components/
│   └── ScenarioForm.test.tsx
└── api/
    └── generate.test.ts
```

## Test Structure

**Suite Organization:**
```typescript
describe('functionName or ComponentName', () => {
    beforeEach(() => {
        // Setup before each test
    });

    afterEach(() => {
        // Cleanup after each test
    });

    it('does something specific', () => {
        // Test implementation
    });
});
```

**Patterns:**

**1. Async Function Testing (with fake timers):**
```typescript
// From: __tests__/lib/speechEngine.test.ts
describe('waitMs', () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('resolves after the specified duration', async () => {
        const promise = waitMs(1000);
        vi.advanceTimersByTime(1000);
        await expect(promise).resolves.toBeUndefined();
    });

    it('rejects when signal is aborted during wait', async () => {
        const controller = new AbortController();
        const promise = waitMs(5000, controller.signal);

        vi.advanceTimersByTime(100);
        controller.abort();

        await expect(promise).rejects.toThrow('Aborted');
    });
});
```

**2. Component Testing (with React Testing Library):**
```typescript
// From: __tests__/components/ScenarioForm.test.tsx
it('calls onSubmit with topic and level when form is submitted', () => {
    const onSubmit = vi.fn();
    render(<ScenarioForm onSubmit={onSubmit} isLoading={false} />);

    const topicInput = screen.getByLabelText(/senaryo konusu/i);
    fireEvent.change(topicInput, { target: { value: '  Bij de huisarts  ' } });

    fireEvent.click(getGoButton());

    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit).toHaveBeenCalledWith('Bij de huisarts', 'A0-A1');
});
```

**3. API Route Testing (NextRequest/NextResponse mocking):**
```typescript
// From: __tests__/api/generate.test.ts
it('returns 200 and valid scenario JSON for valid request', async () => {
    const { POST } = await import('@/app/api/generate/route');
    const req = new NextRequest('http://localhost:3000/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: 'Koffie bestellen', difficulty: 'A0-A1' }),
    });

    const res = await POST(req);

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.title).toBe('Koffie bestellen');
});
```

**4. Cache Testing (localStorage mocking):**
```typescript
// From: __tests__/lib/scenarioCache.test.ts
describe('scenarioCache', () => {
    beforeEach(() => {
        localStorage.clear();
    });

    it('caches and retrieves a scenario', () => {
        cacheScenario('test topic', 'beginner', mockScenario);
        const cached = getCachedScenario('test topic', 'beginner');

        expect(cached).not.toBeNull();
        expect(cached!.title).toBe('Test Lesson');
    });
});
```

## Mocking

**Framework:** Vitest `vi` module

**Patterns:**

**1. Global Mock Setup (in setup.ts):**
```typescript
// Mock speechSynthesis object and SpeechSynthesisUtterance class
Object.defineProperty(globalThis, 'speechSynthesis', {
    value: {
        speak: mockSpeak,
        cancel: mockCancel,
        getVoices: mockGetVoices,
        // ... other methods
    },
    writable: true,
});

class MockSpeechSynthesisUtterance {
    text = '';
    onend: (() => void) | null = null;
    // ... other properties
}
globalThis.SpeechSynthesisUtterance = MockSpeechSynthesisUtterance as unknown as typeof SpeechSynthesisUtterance;
```

**2. Module Mocking (in test files):**
```typescript
// From: __tests__/api/generate.test.ts
vi.mock('@/lib/openrouter', () => ({
    isOpenRouterConfigured: vi.fn(() => false),
    generateWithOpenRouter: vi.fn(),
}));

vi.mock('@/lib/gemini', () => ({
    generateWithFallback: vi.fn(),
}));

// Later in beforeEach:
const { generateWithFallback } = await import('@/lib/gemini');
vi.mocked(generateWithFallback).mockResolvedValue(validScenarioJson);
```

**3. Function Spying:**
```typescript
// From: __tests__/lib/speechEngine.test.ts
it('clears timeout when aborted (no leaked timers)', async () => {
    const controller = new AbortController();
    const clearTimeoutSpy = vi.spyOn(globalThis, 'clearTimeout');

    const promise = waitMs(5000, controller.signal);
    controller.abort();

    try { await promise; } catch { /* expected */ }

    expect(clearTimeoutSpy).toHaveBeenCalled();
    clearTimeoutSpy.mockRestore();
});
```

**What to Mock:**
- Web APIs not available in jsdom: `window.speechSynthesis`, `SpeechSynthesisUtterance`
- External API calls: `generateWithFallback()`, `generateWithOpenRouter()`
- Browser storage: `localStorage` (auto-available in jsdom via vitest setup)
- Timers when testing timeout behavior: `vi.useFakeTimers()` for `waitMs()` tests

**What NOT to Mock:**
- React hooks (`useState`, `useCallback`, etc.) — used directly
- Component rendering libraries (`@testing-library/react`) — wrapped by vitest
- Type system (`Zod` validation) — test actual validation logic
- localStorage read/write — test actual storage behavior (keep real, clear in beforeEach)
- Actual test data — use real `Scenario` objects with realistic shape

## Fixtures and Factories

**Test Data:**
```typescript
// From: __tests__/lib/scenarioCache.test.ts
const mockScenario: Scenario = {
    title: 'Test Lesson',
    targetLang: 'nl-NL',
    nativeLang: 'tr-TR',
    lines: [
        { id: 1, targetText: 'Hallo', nativeText: 'Merhaba', pauseMultiplier: 1.2 },
        { id: 2, targetText: 'Hoe gaat het?', nativeText: 'Nasılsın?', pauseMultiplier: 1.5 },
    ],
};
```

**Valid Scenario for API Tests:**
```typescript
// From: __tests__/api/generate.test.ts
const validScenarioJson = JSON.stringify({
    title: 'Koffie bestellen',
    targetLang: 'nl-NL',
    nativeLang: 'tr-TR',
    lines: [
        { id: 1, targetText: 'Goedemiddag, mag ik een koffie?', nativeText: '...', pauseMultiplier: 1.0 },
        { id: 2, targetText: 'Natuurlijk, met melk of zonder?', nativeText: '...', pauseMultiplier: 1.2 },
        { id: 3, targetText: 'Met melk, alstublieft.', nativeText: '...', pauseMultiplier: 1.0 },
        { id: 4, targetText: 'Dat is twee euro vijftig.', nativeText: '...', pauseMultiplier: 1.0 },
    ],
});
```

**Location:**
- Test data defined directly in test files (co-located)
- Reused across multiple tests in same file
- No shared fixture library (not needed for current scope)

## Coverage

**Requirements:** Not enforced (no threshold in vitest.config.ts)

**View Coverage:**
```bash
npm run test:coverage
```

**Reporter:** text and text-summary (console output)

**Current State:**
- High coverage for core modules: `speechEngine.ts`, `scenarioCache.ts`, `offlineScenarios.ts` are well-tested
- Component testing in place: `ScenarioForm.tsx` tests both rendering and interaction
- API route testing: `generate.test.ts` covers validation, error handling, provider fallback
- No explicit coverage threshold (gaps not blocking CI)

## Test Types

**Unit Tests:**
- **Scope:** Single function or hook in isolation
- **Approach:** Mock external dependencies, test input/output behavior
- **Examples:**
  - `waitMs()` with fake timers
  - `getCachedScenario()` with localStorage
  - `getOfflineScenario()` return shape validation

**Integration Tests:**
- **Scope:** Multiple functions working together
- **Approach:** Minimal mocking, test realistic workflows
- **Examples:**
  - Full scenario playback flow in `playScenario()` generator
  - Form submission and callback invocation in `ScenarioForm.test.tsx`
  - API route handling request→validation→response pipeline

**E2E Tests:**
- **Framework:** Not used
- **Rationale:** PWA deployed to web; manual testing sufficient for browser-specific behavior (Web Speech API quirks, offline mode)

## Common Patterns

**Async Testing:**
```typescript
// Pattern 1: Fake timers with Promise resolution
it('resolves after the specified duration', async () => {
    const promise = waitMs(1000);
    vi.advanceTimersByTime(1000);
    await expect(promise).resolves.toBeUndefined();
});

// Pattern 2: Generator iteration (playScenario is a generator)
it('yields target phase first', async () => {
    const controller = new AbortController();
    const gen = playScenario(minimalScenario, controller.signal);
    const first = await gen.next();
    controller.abort();

    expect(first.done).toBe(false);
    expect(first.value.phase).toBe('target');
});

// Pattern 3: Mock resolved values in async handlers
vi.mocked(generateWithFallback).mockResolvedValue(validScenarioJson);
const res = await POST(req);
expect(res.status).toBe(200);
```

**Error Testing:**
```typescript
// Pattern 1: Promise rejection expectation
await expect(waitMs(1000, abortedSignal)).rejects.toThrow('Aborted');

// Pattern 2: HTTP error status codes
it('returns 400 for invalid request body', async () => {
    const res = await POST(invalidRequest);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBeDefined();
});

// Pattern 3: Validation error from Zod
it('returns 422 when schema validation fails', async () => {
    vi.mocked(generateWithFallback).mockResolvedValue(
        JSON.stringify({ title: 'Test', lines: [/* too few */] })
    );
    const res = await POST(req);
    expect(res.status).toBe(422);
});
```

**DOM Testing (React components):**
```typescript
// Pattern 1: Query by accessible label
const input = screen.getByLabelText(/senaryo konusu/i);

// Pattern 2: Fire user events
fireEvent.change(input, { target: { value: 'Topic' } });
fireEvent.click(submitButton);

// Pattern 3: Check callback invocations
const onSubmit = vi.fn();
render(<ScenarioForm onSubmit={onSubmit} isLoading={false} />);
// ... user interactions ...
expect(onSubmit).toHaveBeenCalledWith('Expected Topic', 'A0-A1');

// Pattern 4: Check disabled state
expect(goButton).toBeDisabled();
expect(goButton).toHaveTextContent(/oluşturuluyor/i);
```

## Test Organization Rules

**1. Arrange → Act → Assert:**
All tests follow AAA pattern:
```typescript
// Arrange: set up test data and mocks
const onSubmit = vi.fn();
render(<ScenarioForm onSubmit={onSubmit} isLoading={false} />);

// Act: perform the action
const input = screen.getByLabelText(/senaryo konusu/i);
fireEvent.change(input, { target: { value: 'Koffie' } });
fireEvent.click(getGoButton());

// Assert: verify the result
expect(onSubmit).toHaveBeenCalledWith('Koffie', 'A0-A1');
```

**2. One assertion focus per test:**
Each test verifies a single behavior (though may have multiple expect() calls for that behavior)

**3. Test naming describes behavior, not implementation:**
✅ `'returns null for uncached scenario'`
✅ `'disables GO button when topic is empty'`
❌ `'getCachedScenario test'`

**4. Setup/teardown consistency:**
- Use `beforeEach()` for per-test setup
- Use `afterEach()` for cleanup (vi.useRealTimers(), clearTimeoutSpy.mockRestore())
- Avoid global state pollution between tests

---

*Testing analysis: 2026-03-02*
