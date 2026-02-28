---
name: frontend-design
description: Create distinctive, production-grade mobile-first interfaces for ShadowDrive AI. Driving-safe, dual-theme (dark/light), iOS PWA optimized, with strict color consistency via CSS custom properties.
---

# Frontend Design — ShadowDrive AI (Mobile-First, Dual-Theme)

This skill guides creation of distinctive, production-grade frontend interfaces optimized for **iOS Safari PWA** and mobile-first driving contexts with full **dark/light theme** support.

## When to Use This Skill
- Building or redesigning any UI component (pages, cards, buttons, forms)
- Creating new course cards, lesson views, or playback screens
- Adapting existing web layouts for iOS viewport and safe areas
- Polishing the visual design for App Store-level quality
- Adding any new visual element that must respect dual-theme

## Core Design Philosophy: Driving Safety First
The user operates this app **while driving**. Every design decision must prioritize:
1. **Glanceability** — understand the state in ≤0.5 seconds
2. **Large touch targets** — minimum 48x48dp, preferred 88px for primary actions
3. **High contrast** — text must be readable in direct sunlight (light mode) and night (dark mode)
4. **No scrolling during playback** — all critical info above the fold
5. **Minimal cognitive load** — fewer choices, bigger elements, clearer hierarchy

## Dual-Theme Architecture

### Strategy: CSS Custom Properties (NOT Tailwind dark: prefix)
All colors are defined as CSS variables in `globals.css`. Components use Tailwind semantic classes mapped to these variables.

### Semantic Color Tokens (from tailwind.config.ts)
| Token | CSS Variable | Usage |
|-------|-------------|-------|
| `bg-background` | `--background` | Page background |
| `bg-card` | `--card` | Card/surface backgrounds |
| `bg-card-hover` | `--card-hover` | Hover state surfaces |
| `text-foreground` | `--foreground` | Primary text |
| `text-foreground-secondary` | `--foreground-secondary` | Secondary text |
| `text-foreground-muted` | `--foreground-muted` | Tertiary/helper text |
| `text-foreground-faint` | `--foreground-faint` | Disabled/ghost text |
| `border-border` | `--border` | Default borders |
| `border-border-hover` | `--border-hover` | Hover borders |

### Color Rules — STRICT
1. **NEVER hardcode colors** — always use theme variables or semantic Tailwind classes
2. **Semantic accent colors** that work in both themes:
   - `emerald-400/500` — success, brand, Dutch language
   - `amber-400/500` — warning, pause, user's turn
   - `blue-400/500` — info, Turkish translation
   - `red-400/500` — error only
3. **When using accent colors with backgrounds**, provide BOTH theme variants:
   - CORRECT: `text-emerald-700 dark:text-emerald-300 bg-emerald-500/15 dark:bg-emerald-500/20`
   - WRONG: `text-emerald-300 bg-emerald-500/20` (dark-only, invisible in light mode)
4. **Foreground colors** always use semantic tokens, never raw gray/slate colors

## iOS PWA Specific Rules
- Use `min-h-dvh` instead of `min-h-screen`
- Handle `standalone` display mode with CSS `@media (display-mode: standalone)`
- Disable text selection on interactive: `select-none`
- Use `touch-action: manipulation` on buttons
- Respect safe areas: `env(safe-area-inset-*)`

## Component Patterns

### Giant Button (Driving-Safe Primary Action)
```tsx
<button className="w-full min-h-[88px] rounded-3xl text-2xl font-bold uppercase tracking-widest
  bg-emerald-500 text-white dark:text-shadow-950
  hover:bg-emerald-400 active:scale-95 transition-all duration-300
  shadow-2xl shadow-emerald-500/30 animate-glow">
  BASLA
</button>
```

### Course Card
```tsx
<button className="course-card group flex items-center gap-4 p-5 rounded-2xl
  bg-card border border-border/50 hover:border-border-hover
  transition-all duration-300 active:scale-[0.98]">
  ...
</button>
```

### Toast Notifications — MUST use dual-theme colors
```tsx
const TOAST_COLORS = {
  success: 'bg-emerald-500/15 dark:bg-emerald-500/20 border-emerald-500/30 dark:border-emerald-500/40 text-emerald-700 dark:text-emerald-300',
};
```

### Loading States
- **AI Generation**: `GeneratingLoader` — orbital rings + wave bars + rotating status text
- **Async operations**: Button disabled + spinner
- **Page transitions**: `animate-fade-in`
- NEVER use bare spinners — always provide context text

## Typography Scale (Driving Readability)
| Element | Size | Weight |
|---------|------|--------|
| Main phrase (playback) | `text-3xl sm:text-4xl` | `font-bold` |
| Page title | `text-2xl` | `font-bold` |
| Card title | `text-base` to `text-lg` | `font-bold/medium` |
| Body text | `text-sm` to `text-base` | `font-normal` |
| Label/helper | `text-xs` | `font-medium` |
| **Minimum body text**: 14px — never smaller |

## Motion & Feedback
- `transition-all duration-300` for interactive elements
- `active:scale-95` for buttons (tactile feedback)
- `active:scale-[0.98]` for cards (subtler)
- `animate-glow` for primary CTA buttons
- `animate-fade-in` for tab content transitions

## Checklist Before Submitting UI Changes
- [ ] All colors use CSS variables or semantic Tailwind classes (no hardcoded hex in TSX)
- [ ] Tested in both dark AND light mode
- [ ] Touch targets >= 44px (preferably 48px+)
- [ ] Text readable at arm's length (driving distance)
- [ ] No horizontal overflow at 320px width
- [ ] Safe area padding for iOS
- [ ] Loading/error/empty states handled
- [ ] All user-facing text in Turkish
