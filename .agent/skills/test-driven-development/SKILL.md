---
name: test-driven-development
description: RED-GREEN-REFACTOR cycle for ShadowDrive AI. Covers API route testing, speech engine unit tests, component rendering, and iOS-specific E2E validation.
---

# Test-Driven Development — ShadowDrive AI

Adapted from the Superpowers framework's TDD skill. Enforces the RED-GREEN-REFACTOR cycle for all new features and bug fixes.

## When to Use This Skill
- Adding a new API route or modifying `route.ts`
- Changing the speech engine loop logic
- Building new UI components (course cards, forms)
- Fixing any bug (write the failing test FIRST)
- Before any iOS migration step

## The Cycle

### 1. RED — Write a Failing Test
- Write a test that describes the **expected behavior**
- Run it and confirm it **fails** (proves the test works)
- Test must be specific: one assertion per behavior

### 2. GREEN — Write Minimal Code
- Write the **minimum code** to make the test pass
- No premature optimization, no extra features
- Run the test and confirm it passes

### 3. REFACTOR — Clean Up
- Improve code quality without changing behavior
- All tests must still pass after refactoring
- Commit after each successful refactor

## Test Categories for ShadowDrive AI

### API Route Tests (`__tests__/api/`)
```ts
// Example: Test that the generate route returns valid Scenario JSON
test('POST /api/generate returns valid scenario', async () => {
  const res = await POST(new NextRequest('http://localhost:3000/api/generate', {
    method: 'POST',
    body: JSON.stringify({ topic: 'Koffie bestellen', difficulty: 'beginner' }),
  }));
  expect(res.status).toBe(200);
  const data = await res.json();
  expect(data.title).toBeDefined();
  expect(data.lines.length).toBeGreaterThanOrEqual(4);
});
```

### Speech Engine Tests (`__tests__/lib/`)
- Test `waitMs` resolves after the correct duration (±50ms)
- Test `waitMs` rejects on AbortSignal
- Test `playScenario` yields correct phase sequence: target → pause → native → repeat

### Component Tests (`__tests__/components/`)
- Test `ScenarioForm` disables GO button when `isLoading=true`
- Test `AudioPlayer` renders START button in idle state
- Test `Toast` auto-dismisses after 4 seconds

### iOS E2E Tests (Browser Tool)
- Test at 390×844 viewport (iPhone 14)
- Verify no horizontal scroll
- Verify touch target sizes ≥ 48px
- Verify `standalone` display mode works
- Verify audio starts only after user gesture

## Tools
- **Unit/Integration**: Jest + React Testing Library (or Vitest)
- **E2E**: Browser tool (built-in) at mobile viewports
- **API**: Direct `Invoke-WebRequest` calls with timing

## Anti-Patterns
- ❌ Writing code before the test
- ❌ Testing implementation details (internal state) instead of behavior
- ❌ Skipping the RED phase (test must fail first)
- ❌ Large test files with many assertions per test
