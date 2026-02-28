# /qa — Senior-Level Quality Assurance Suite

> Act as a Senior QA Engineer with 15+ years of experience across multiple technologies and projects.
> Review every change with the mindset: "If this goes to production, what breaks?"
> Never assume "it probably works" — prove it.

## Instructions

Run all checks in order. Fix any issues found immediately, then proceed to the next phase. Provide a summary report at the end.

---

## PHASE A: Automated Tests (Gate — do NOT proceed if any fail)

```bash
# 1. Unit/Integration tests
npm test

# 2. TypeScript type-check (independent of build)
npx tsc --noEmit

# 3. Production build
npm run build
```

All three must pass before moving to the next phase. Fix failures first.

---

## PHASE B: Static Code Analysis

Identify changed files with `git diff --name-only HEAD`. For each file:

### B1. Security (Critical — commit blocker)
- [ ] **API key leakage**: No hardcoded secrets, tokens, passwords, or `.env` values in code
- [ ] **XSS**: `dangerouslySetInnerHTML` usage — is user input properly sanitized?
- [ ] **Injection**: User input in API routes is not passed directly to DB queries
- [ ] **CORS**: No unnecessary `Access-Control-Allow-Origin: *` in API routes
- [ ] **Exposed endpoints**: Sensitive endpoints are auth-protected

### B2. Data Integrity (Critical)
- [ ] **Type safety**: `as` type assertions are backed by runtime validation (prefer Zod)
- [ ] **Null/undefined**: Optional chaining is not missing, null states are handled
- [ ] **Race conditions**: No stale closure risk in concurrent state updates
- [ ] **Memory leaks**: `useEffect` has cleanup functions (event listeners, timers, abort controllers)
- [ ] **Error handling**: No empty catch blocks (at minimum, log the error)

### B3. Code Quality (High)
- [ ] **Dead code**: No unused imports, functions, or variables
- [ ] **Console.log**: No debug logs left in production code
- [ ] **Duplicate logic**: Same logic isn't repeated > 2 places unnecessarily
- [ ] **Magic numbers**: Unexplained constants are extracted to named variables
- [ ] **Error messages**: Messages tell the user what to do, not just what went wrong

---

## PHASE C: UI/UX Consistency

### C1. Language Consistency (Critical — Turkish UI)
- [ ] **All user-facing text is in Turkish** — buttons, labels, placeholders, toasts, errors, empty states
- [ ] **Target language (Dutch) only in lesson content** — never in UI elements
- [ ] **Error messages are in Turkish and user-friendly** — no technical jargon
- [ ] **Pluralization is correct** — verify Turkish grammar rules are followed

### C2. Theme Consistency
- [ ] **No hardcoded colors** — all colors use CSS variables or Tailwind semantic classes
- [ ] **Tested in both Dark/Light modes** — readability verified in both themes
- [ ] **Contrast ratio** — text/background contrast meets WCAG AA (4.5:1 minimum)
- [ ] **Color semantics are consistent** — emerald=success, amber=warning, red=error, blue=info
- [ ] **Dynamic Tailwind classes** — if `bg-${var}-500` pattern is used, classes are in safelist

### C3. Responsive & Mobile-First
- [ ] **Touch targets minimum 44x44px** — all buttons and interactive elements
- [ ] **No horizontal overflow** — tested at 320px width (minimum mobile)
- [ ] **Font size minimum 14px** — body text; 12px only for secondary/muted text
- [ ] **Safe area padding** — iPhone notch/bottom bar using `dvh`, `env(safe-area-inset-*)`
- [ ] **Keyboard doesn't obscure inputs** — inputs remain visible when focused

### C4. State & Navigation
- [ ] **Loading state for every async operation** — button disabled + spinner/skeleton
- [ ] **Empty state** — meaningful message shown when lists are empty
- [ ] **Error state** — user is informed when API returns errors
- [ ] **No dead-ends** — user can always navigate back or take a new action
- [ ] **Double-click guard** — API-triggering buttons don't fire twice on rapid clicks
- [ ] **Back navigation** — browser back button works logically

---

## PHASE D: Architecture & Performance

### D1. Architecture
- [ ] **No circular imports** — module dependency graph is clean
- [ ] **API route validation** — every route validates input with Zod
- [ ] **Offline-first** — existing features work without internet (Courses tab)
- [ ] **Cache consistency** — cache keys align with the current type system

### D2. Performance
- [ ] **Bundle size check** — newly added dependencies are truly necessary
- [ ] **Unnecessary re-renders** — large lists use memo/useMemo where appropriate
- [ ] **Image optimization** — images use next/image for optimization
- [ ] **Lazy loading** — components not needed on initial load are lazy-loaded

### D3. Timeout & Retry
- [ ] **Timeout values are consistent** — code, error message, and config use the same value
- [ ] **Rate limit detection** — uses HTTP status code (429) + string matching together
- [ ] **Graceful degradation** — user gets a fallback on API timeout
- [ ] **Abort controller** — long-running requests can be cancelled

---

## PHASE E: Regression Testing

- [ ] **Existing tests pass** — already verified in Phase A
- [ ] **Core flows are not broken** — mentally walk through these happy paths:
  1. Dashboard → Courses → Select course → Select lesson → Play → Complete → Back
  2. Dashboard → AI → Enter topic → Select level → START → Scenario generated → Play
  3. Dashboard → My Text → Paste text → START → Play
  4. Theme toggle → Dark ↔ Light switch → Page refresh → Theme persists
- [ ] **Edge cases**:
  - Empty topic with AI generate (button should be disabled)
  - Very long topic text (UI should not break)
  - No network during AI generate (offline fallback should work)
  - Back button during playback (cleanup should work properly)

---

## PHASE F: Report

After all checks, provide a summary in this format:

```
## QA Report — [date]

### Automated Tests
- Unit Tests: X/X passed
- TypeScript: OK/FAIL
- Build: OK/FAIL (bundle size: XX kB)

### Issues Found
| Severity | Issue | File:Line | Fix |
|----------|-------|-----------|-----|
| CRITICAL | ... | ... | ... |
| HIGH     | ... | ... | ... |
| MEDIUM   | ... | ... | ... |

### Issues Fixed
| Issue | File | What was done |
|-------|------|---------------|
| ... | ... | ... |

### Verdict: READY TO COMMIT / NEEDS FIXES
```

If NEEDS FIXES → fix the issues, re-run Phase A, update the report.
If READY TO COMMIT → inform the user.
