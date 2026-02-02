# OpenClaw Molt Fleet Dashboard - Artistic Direction

## Vision Statement

> A fusion of your blog's terminal-inspired minimalism with OpenClaw's modern SaaS sensibility—creating a cohesive, sophisticated interface that feels both technical and approachable.

## Core Aesthetic: "Soft Terminal Modernism"

### Philosophy
- **Less is more, but softer**: Reduce visual violence while maintaining clarity
- **Terminal-inspired without being literal**: Reference CLI aesthetics subtly through typography and structure
- **Warm technicality**: Replace cold blues with warmer, organic tones
- **Breathing room**: Generous spacing prevents visual fatigue

---

## Color System

### Primary Palette (Inspired by Your Blog)

| Role | Hex | Usage |
|------|-----|-------|
| **Background Base** | `#0a0f14` | Main page background - deep navy-black |
| **Background Elevated** | `#111821` | Cards, panels, modals - slightly lifted |
| **Background Input** | `#0d1218` | Form fields, code blocks |
| **Border Subtle** | `#1e2a35` | Dividers, card borders - barely visible |
| **Border Hover** | `#2a3a48` | Interactive borders on hover |

### Accent Colors

| Role | Hex | Usage |
|------|-----|-------|
| **Primary Action** | `#4ade80` | Success states, active running indicators - your blog's green |
| **Primary Action Hover** | `#22c55e` | Hover states - slightly brighter |
| **Secondary Action** | `#14b8a6` | Secondary buttons, links - teal accent |
| **Warning/Stop** | `#f87171` | Stop buttons, errors - softer coral red |
| **Warning/Stop Hover** | `#ef4444` | Error emphasis |
| **Highlight** | `#22d3ee` | Info states, links on hover - cyan |
| **Terminal Prompt** | `#64748b` | Command prefixes like `$` or `>` |

### Text Colors

| Role | Hex | Usage |
|------|-----|-------|
| **Text Primary** | `#e2e8f0` | Headings, important text - soft white |
| **Text Secondary** | `#94a3b8` | Body text, descriptions |
| **Text Muted** | `#64748b` | Timestamps, metadata, labels |
| **Text Inverse** | `#0a0f14` | Text on bright backgrounds |

### Transparency Values
- **Card hover lift**: `rgba(74, 222, 128, 0.05)` - subtle green glow
- **Status badges**: `rgba(74, 222, 128, 0.15)` for running, `rgba(248, 113, 113, 0.15)` for stopped
- **Borders**: Always use `rgba()` for borders to blend better

---

## Typography System

### Font Stack

```css
--font-display: "JetBrains Mono", "Fira Code", monospace;    /* Headlines, brand */
--font-body: "Inter", -apple-system, sans-serif;              /* Body text, UI */
--font-terminal: "JetBrains Mono", "SF Mono", monospace;      /* Code, data */
```

**Rationale**: 
- Display/headlines use mono to reference the terminal aesthetic without being heavy-handed
- Body stays sans-serif for readability
- Terminal font used for technical data (ports, PIDs, status)

### Type Scale

| Level | Size | Weight | Line Height | Usage |
|-------|------|--------|-------------|-------|
| **Brand** | 1.75rem (28px) | 700 | 1.2 | Logo/title with gradient |
| **H1** | 1.5rem (24px) | 600 | 1.3 | Page titles |
| **H2** | 1.25rem (20px) | 600 | 1.4 | Section headers |
| **H3** | 1.125rem (18px) | 600 | 1.4 | Card titles |
| **Body** | 1rem (16px) | 400 | 1.6 | General text |
| **Small** | 0.875rem (14px) | 400 | 1.5 | Descriptions, metadata |
| **Caption** | 0.75rem (12px) | 500 | 1.4 | Labels, badges, timestamps |

### Typography Patterns

- **Uppercase tracking**: Use `text-transform: uppercase` with `letter-spacing: 0.05em` for labels only
- **Monospace data**: All technical values (ports, PIDs, dates) in terminal font
- **Gradient text**: Brand only—`linear-gradient(135deg, #4ade80 0%, #14b8a6 100%)`

---

## Spacing System

| Token | Value | Usage |
|-------|-------|-------|
| **xs** | 0.25rem (4px) | Tight gaps, icon spacing |
| **sm** | 0.5rem (8px) | Internal element spacing |
| **md** | 1rem (16px) | Standard padding, gaps |
| **lg** | 1.5rem (24px) | Card padding, section gaps |
| **xl** | 2rem (32px) | Large section separations |
| **2xl** | 3rem (48px) | Page-level spacing |

### Layout Principles
- **Card padding**: `24px` (lg) on all sides
- **Section gaps**: `32px` (xl) between major sections
- **Inner grid gaps**: `16px` (md) between related items
- **Breathing room**: Never less than `16px` between unrelated elements

---

## Component Library

### Card Component

```
┌─────────────────────────────────────┐
│  [molt-name]          [STATUS]      │ ← 24px padding
│                                     │
│  Port: 19001    PID: 4521           │ ← Metadata grid
│  Docker: yes    Created: 2024-01-15 │
│                                     │
│  ┌─────────────────────────────┐    │
│  │  Health: ✓ OK               │    │ ← Health panel (nested card)
│  └─────────────────────────────┘    │
│                                     │
│  [Stop] [Dashboard]                 │ ← Actions, 8px gap
└─────────────────────────────────────┘
```

**Specs**:
- Background: `#111821`
- Border: `1px solid #1e2a35`
- Border-radius: `8px`
- Left accent: `3px solid` (green for running, red for stopped)
- Hover: `-translate-y: 1px`, border brightens to `#2a3a48`
- Box-shadow on hover: `0 4px 20px rgba(74, 222, 128, 0.05)`

### Button Variants

**Primary (Success/Start)**:
- Background: `#4ade80`
- Text: `#0a0f14` (inverse)
- Hover: `#22c55e`, slight scale(1.02)
- Padding: `8px 16px`
- Border-radius: `6px`
- Font-weight: 500

**Danger (Stop)**:
- Background: transparent
- Border: `1px solid #f87171`
- Text: `#f87171`
- Hover: Background fills with `rgba(248, 113, 113, 0.15)`

**Secondary (Links/Actions)**:
- Background: `#14b8a6`
- Text: `#0a0f14`
- Hover: `#0d9488`

**Ghost (Subtle)**:
- Background: transparent
- Border: `1px solid #1e2a35`
- Text: `#94a3b8`
- Hover: Background `#111821`, border `#2a3a48`

### Status Badge

**Running**:
- Background: `rgba(74, 222, 128, 0.15)`
- Text: `#4ade80`
- Border: `1px solid rgba(74, 222, 128, 0.3)`
- Border-radius: `9999px` (pill)
- Padding: `4px 12px`
- Font: 12px uppercase, letter-spacing 0.05em

**Stopped**:
- Background: `rgba(248, 113, 113, 0.15)`
- Text: `#f87171`
- Border: `1px solid rgba(248, 113, 113, 0.3)`

### Terminal Accents

**Command Prompt Style**:
```
$ molt list          ← "$" in muted gray (#64748b)
3 molts found        ← output in secondary text
```

Use for:
- Section headers with a subtle `$` or `>` prefix
- Empty states: `$ echo "No molts found"`
- Loading states: `$ _` (blinking cursor optional)

---

## Layout Architecture

### Page Structure

```
┌─────────────────────────────────────────────────────────────┐
│  🦕 Molt Fleet         [Stats]              [Refresh]       │ ← Header
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────────────────────────┐  ┌──────────────┐    │
│  │                                  │  │  Broadcast   │    │
│  │  Active Molts                    │  │  Message     │    │
│  │  ─────────────────────────────   │  │              │    │
│  │  ┌──────────────────────────┐   │  │  [textarea]  │    │
│  │  │ [Card 1]                 │   │  │              │    │
│  │  └──────────────────────────┘   │  │  [Broadcast] │    │
│  │  ┌──────────────────────────┐   │  └──────────────┘    │
│  │  │ [Card 2]                 │   │                     │
│  │  └──────────────────────────┘   │                     │
│  │                                  │                     │
│  └──────────────────────────────────┘                     │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Grid System

- **Main layout**: `grid-cols-[1fr_350px]` on large screens
- **Card metadata**: `grid-cols-[repeat(auto-fit,minmax(140px,1fr))]`
- **Gap consistency**: `24px` between sections, `16px` within

---

## Micro-interactions & Motion

### Transitions

| Element | Duration | Easing |
|---------|----------|--------|
| Button hover | 200ms | ease-out |
| Card hover | 250ms | cubic-bezier(0.4, 0, 0.2, 1) |
| Border color | 150ms | ease |
| Page load | 400ms | ease-out |

### Hover Effects

**Cards**:
- Subtle lift: `transform: translateY(-1px)`
- Border brightens
- Soft green glow shadow appears

**Buttons**:
- Scale: `1.02` on hover (subtle)
- Background darkens/lightens appropriately

**Links**:
- Color transition to highlight cyan
- Optional: underline animation from left

### Loading States

**Skeleton Cards**:
- Background pulse animation between `#111821` and `#1a2530`
- No hard borders, just subtle shapes

**Button Loading**:
- Opacity: 0.7
- Cursor: not-allowed
- Text: "Loading..." with animated ellipsis

---

## Special Elements

### Header Stats

Three stat pills in header:
```
┌──────────┐  ┌──────────┐  ┌──────────┐
│   12     │  │    8     │  │    4     │
│  TOTAL   │  │ RUNNING  │  │ STOPPED  │
└──────────┘  └──────────┘  └──────────┘
```

- Numbers: `font-display`, 2xl, bold
- Labels: 12px uppercase, muted color
- No backgrounds—clean text only

### Health Indicator

Visual health status:
```
● Health: OK          ← Green dot + text
○ Health: Checking... ← Gray pulsing dot
○ Health: Error       ← Red dot
```

- Dot: `8px` circle, status color
- Animation: Pulse for "checking" state

### Empty State

```
┌─────────────────────────────────────┐
│                                     │
│          ┌─────────┐                │
│          │  🦕     │                │
│          └─────────┘                │
│                                     │
│    $ echo "No molts found"          │
│                                     │
│    Create your first molt:          │
│    clmnt molt create <name>         │
│                                     │
└─────────────────────────────────────┘
```

- Icon: Subtle, desaturated
- Command prompt style text
- Monospace font for the command example

---

## Accessibility

### Contrast Ratios
- All text meets WCAG AA (4.5:1 minimum)
- Interactive elements meet WCAG AA (3:1 minimum)

### Focus States
- Outline: `2px solid #14b8a6`
- Outline-offset: `2px`
- No browser default outlines removed without replacement

### Reduced Motion
```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## Implementation Notes

### CSS Variable Mapping

Replace current theme.css variables with these new values:

```css
/* Backgrounds */
--bg-primary: #0a0f14;
--bg-secondary: #111821;
--bg-tertiary: #1a2530;
--bg-input: #0d1218;

/* Text */
--text-primary: #e2e8f0;
--text-secondary: #94a3b8;
--text-muted: #64748b;
--text-inverse: #0a0f14;

/* Borders */
--border-primary: #1e2a35;
--border-secondary: #2a3a48;

/* Status */
--status-success: #4ade80;
--status-success-bg: rgba(74, 222, 128, 0.15);
--status-error: #f87171;
--status-error-bg: rgba(248, 113, 113, 0.15);

/* Actions */
--action-primary: #4ade80;
--action-primary-hover: #22c55e;
--action-secondary: #14b8a6;
--action-secondary-hover: #0d9488;
--action-danger: transparent;
--action-danger-border: #f87171;
--action-danger-text: #f87171;
```

### Component Architecture

**Proposed reusable components**:

1. **Card** - Base card wrapper with variants
2. **Badge** - Status badges (running/stopped)
3. **Button** - All button variants
4. **Stat** - Header stat display
5. **HealthIndicator** - Health status with dot
6. **EmptyState** - Empty state with terminal styling
7. **TerminalText** - Monospace text with optional prompt

---

## Summary

This direction creates a dashboard that:
1. ✅ Uses your blog's softer, less contrasty color palette
2. ✅ Maintains OpenClaw's modern, technical aesthetic
3. ✅ Introduces subtle terminal-inspired touches without being gimmicky
4. ✅ Provides a comprehensive component system for reusability
5. ✅ Ensures accessibility and polish in every detail

The result feels cohesive, professional, and uniquely yours—not generic, not overwhelming, just right.
