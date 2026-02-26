---
name: frontend-design
description: Create distinctive, production-grade mobile-first interfaces for ShadowDrive AI. Optimized for iOS PWA with touch-safe driving UI, premium dark aesthetics, and zero-distraction playback screens.
---

# Frontend Design — ShadowDrive AI (Mobile-First)

This skill guides creation of distinctive, production-grade frontend interfaces optimized for **iOS Safari PWA** and mobile-first driving contexts.

## When to Use This Skill
- Building or redesigning any UI component (pages, cards, buttons, forms)
- Creating new course cards, lesson views, or playback screens
- Adapting existing web layouts for iOS viewport and safe areas
- Polishing the visual design for App Store-level quality

## Design Constraints (Driving Safety)
- **Touch targets**: Minimum 48×48dp, preferred 88px for primary actions
- **Glanceable**: A driver must understand the state in ≤0.5 seconds
- **Dark theme only**: `bg-gray-950` base, high-contrast text
- **No scrolling during playback**: All critical info above the fold
- **Safe areas**: Respect iOS notch/home indicator via `env(safe-area-inset-*)`

## Aesthetic Direction
- **Theme**: Ultra-dark, neon-accent (emerald `#10b981` primary, amber for warnings)
- **Typography**: System fonts for performance on iOS; bold weights for headings
- **Motion**: Subtle `transition-all duration-300`, `active:scale-95` for tactile feedback
- **Cards**: `backdrop-blur-sm`, `border border-gray-700/50`, `rounded-2xl`
- **Glassmorphism**: Light use on tab bars and status overlays

## iOS PWA Specific Rules
- Use `min-h-dvh` instead of `min-h-screen` (dynamic viewport height)
- Add `apple-mobile-web-app-capable` meta tag
- Handle `standalone` display mode with CSS `@media (display-mode: standalone)`
- Disable text selection on interactive elements: `select-none`
- Use `-webkit-tap-highlight-color: transparent` on buttons
- Test with iOS Safari's rubber-band scrolling behavior

## Color Palette (CSS Variables)
```css
--shadow-950: #030712;   /* Background */
--shadow-800: #1f2937;   /* Card surfaces */
--neon-green: #10b981;   /* Primary actions */
--neon-amber: #f59e0b;   /* Pause/Warning */
--neon-blue: #3b82f6;    /* Native/Translation phase */
```

## Component Patterns
- **Giant Button**: `min-h-[88px] rounded-3xl text-3xl font-bold uppercase tracking-widest`
- **Course Card**: `group flex items-center gap-4 p-5 rounded-2xl bg-shadow-800 border border-gray-700/50`
- **Status Bar**: Fixed top, `flex justify-between`, emoji + label + progress counter
- **Toast**: Fixed top-center, auto-dismiss 4s, slide-in animation, `backdrop-blur-sm`

## Examples
```tsx
// Giant driving-safe button
<button className="w-full min-h-[88px] rounded-3xl text-3xl font-bold uppercase
  bg-emerald-500 text-shadow-950 active:scale-95 transition-all duration-300
  shadow-2xl shadow-emerald-500/30">
  ▶ BAŞLA
</button>
```
