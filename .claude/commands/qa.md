# /qa — Pre-Commit Quality Assurance

Run a comprehensive quality check from an end-user perspective before committing code changes.

## Instructions

Perform ALL of the following checks in order. Report findings in a summary table at the end.

### 1. Automated Checks
- Run `npm test` — all tests must pass
- Run `npm run build` — production build must succeed with zero errors
- Check TypeScript: `npx tsc --noEmit` — zero type errors

### 2. Code Quality Scan
For every file modified since the last commit (`git diff --name-only HEAD`), check:

**Critical (blocks commit):**
- [ ] No hardcoded English text in Turkish UI components (all user-facing strings must be Turkish)
- [ ] No dynamic Tailwind classes without safelist coverage (e.g., `bg-${var}-500`)
- [ ] No timeout/error message mismatches (timeout value vs. displayed message)
- [ ] No unused imports or dead code introduced
- [ ] No `console.log` left in production code (except in designated debug/logging sections)
- [ ] No security issues: exposed API keys, XSS vectors, SQL injection

**High Priority:**
- [ ] Error handling: try-catch in cleanup/unmount, API error paths return user-friendly messages
- [ ] Rate limit detection uses HTTP status codes, not just string matching
- [ ] All `as` type assertions have runtime validation (prefer Zod)
- [ ] Accessibility: interactive elements have aria-labels, buttons have min touch targets (44px)

**Medium Priority:**
- [ ] Mobile responsiveness: no horizontal overflow, touch targets >= 44x44px
- [ ] Offline fallback: every API call has a graceful degradation path
- [ ] Cache consistency: cache keys match the current type system
- [ ] Component cleanup: useEffect returns cleanup functions where needed

### 3. UI/UX Consistency Check
- [ ] All toast messages are in Turkish
- [ ] Color scheme is consistent (emerald = success, amber = warning, blue = info)
- [ ] Button text follows pattern: uppercase for primary actions, normal case for secondary
- [ ] Loading states exist for all async operations
- [ ] No dead-end states (user can always navigate back)

### 4. Architecture Check
- [ ] No circular imports
- [ ] API routes validate input with Zod before processing
- [ ] Offline-first: app works without internet for existing features
- [ ] Double-click guards on all API-triggering buttons

### 5. Report Format
After all checks, output a summary:

```
## QA Report — [date]

### Automated
- Tests: X/X passed
- Build: OK/FAIL
- TypeScript: OK/FAIL

### Issues Found
| Severity | Issue | File | Line |
|----------|-------|------|------|
| ... | ... | ... | ... |

### Verdict: READY TO COMMIT / NEEDS FIXES
```

If NEEDS FIXES: list each fix needed, then apply the fixes and re-run automated checks.
If READY TO COMMIT: confirm all checks passed.
