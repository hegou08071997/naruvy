# Design System

Source tokens extracted from the old Astro repo at `C:\Users\redpo\repos\sickrabbit-website\src\styles\variables.css`. These are the target values — Phase 2 of the build plan applies them to Dawn's CSS custom properties and colour schemes.

> Status: **placeholder — not yet wired into the theme.** See `planning/roadmap.md` → Phase 2.

## Colour

### Core palette

| Token | Hex | Usage |
|---|---|---|
| `--color-graphite` | `#2d2d2a` | Primary dark — body text on light, surface-dark background |
| `--color-sand-dune` | `#e5dcc5` | Default background, header, footer |
| `--color-dark-slate-grey` | `#1c4d4f` | Secondary accent, elevated surfaces, tag badges |
| `--color-burnt-rose` | `#903636` | Primary CTA, accent |
| `--color-faded-copper` | `#a77b5f` | Reserved — special uses only |

### Semantic

| Token | Maps to |
|---|---|
| `--color-cta-primary` | `--color-burnt-rose` |
| `--color-cta-secondary` | `--color-dark-slate-grey` |
| `--color-surface-dark` | `--color-graphite` |
| `--color-surface-elevated` | `--color-dark-slate-grey` |
| `--color-surface-light` | `--color-sand-dune` |
| `--color-background-default` | `--color-sand-dune` |
| `--color-tag-badge` | `--color-dark-slate-grey` |

### States

| Token | Hex |
|---|---|
| `--color-success` | `#7FA099` |
| `--color-error` | `#D47A7A` |
| `--color-warning` | `#D4A574` |

> `--color-info` was present in the old Astro repo but referenced a non-existent `--color-interface-lavender` (dangling leftover from a deleted audio-interface palette). Dropped for Sick Rabbit — add back later if a Phase 3 component genuinely needs an info state.

**Shopify mapping**: these tokens will be mapped onto Dawn's colour scheme settings (background, text, button, button-label, etc.) in `config/settings_data.json` during Phase 2, and also set as CSS custom properties in `assets/base.css` for ad-hoc use.

## Typography

### Families

Set in `layout/theme.liquid`. Four fonts come from Shopify's `font_picker` + `font_face` pipeline (see `config/settings_schema.json` → typography). Two (Pirata One, Cinzel) aren't in Shopify's font library, so they're loaded from Google Fonts and hardcoded into their CSS custom properties.

| Token | Default font | Role | Source |
|---|---|---|---|
| `--font-display-special-family` | `UnifrakturMaguntia` | H1, buttons | Shopify `font_picker` (`type_display_special_font`) |
| `--font-heading-family` | `Pirata One` | H2 | Google Fonts `<link>`, hardcoded in `theme.liquid` |
| `--font-body-family` | `Anonymous Pro` (monospace) | Body text, UI | Shopify `font_picker` (`type_body_font`) |
| `--font-display-family` | `Cinzel` ⚠️ | Collection names | Google Fonts `<link>`, hardcoded in `theme.liquid` |
| `--font-logo-family` | `UnifrakturCook` | Logo | Shopify `font_picker` (`type_logo_font`) |
| `--font-hero-title-family` | `Outfit` | Hero title ("Sick Rabbit" wordmark) | Shopify `font_picker` (`type_hero_title_font`) |

> ⚠️ **Nordica Plus substitute**: Nordica Plus (the original brand display font) is not in Shopify's font library OR Google's. `Cinzel` is serving as a stand-in until Nordica Plus is licensed and self-hosted — see `docs/decisions.md` (2026-04-20 Fonts decision).

### Scale

| Token | Size | Pixels |
|---|---|---|
| `--text-display` | `4rem` | 64 |
| `--text-h1` | `3rem` | 48 |
| `--text-h3` | `2rem` | 32 |
| `--text-h2` / `--text-h4` | `1.5rem` | 24 |
| `--text-h5` | `1.25rem` | 20 |
| `--text-h6` / `--text-body` | `1rem` | 16 |
| `--text-body-lg` | `1.125rem` | 18 |
| `--text-body-sm` | `0.875rem` | 14 |
| `--text-body-xs` | `0.75rem` | 12 |
| `--text-display-collection` | `2.3125rem` | 37 |
| `--text-logo` | `5.25rem` | 84 |

### Weights / line heights

- Weights: `--weight-regular: 400`, `--weight-bold: 700`
- Line heights: `--leading-tight: 1` (gothic display), `--leading-normal: 1.5` (body), `--leading-relaxed: 1.8` (long-form)

## Spacing

8px base grid.

| Token | Value |
|---|---|
| `--space-1` | `0.5rem` (8px) |
| `--space-2` | `1rem` (16px) |
| `--space-3` | `1.5rem` (24px) |
| `--space-4` | `2rem` (32px) |
| `--space-5` | `2.5rem` (40px) |
| `--space-6` | `3rem` (48px) |
| `--space-8` | `4rem` (64px) |
| `--space-10` | `5rem` (80px) |
| `--space-12` | `6rem` (96px) |
| `--space-16` | `8rem` (128px) |

## Containers / breakpoints

| Token | Value |
|---|---|
| `--container-sm` / `--breakpoint-sm` | `640px` |
| `--container-md` / `--breakpoint-md` | `768px` |
| `--container-lg` / `--breakpoint-lg` | `1024px` |
| `--container-xl` / `--breakpoint-xl` | `1280px` |
| `--container-2xl` / `--breakpoint-2xl` | `1536px` |

## Border radius

| Token | Value |
|---|---|
| `--radius-sm` | `4px` |
| `--radius-md` | `8px` |
| `--radius-lg` | `12px` |
| `--radius-full` | `9999px` |

## Shadows

| Token | Value |
|---|---|
| `--shadow-sm` | `0 2px 4px rgba(0, 0, 0, 0.1)` |
| `--shadow-md` | `0 4px 8px rgba(0, 0, 0, 0.2)` |
| `--shadow-lg` | `0 8px 16px rgba(0, 0, 0, 0.3)` |
| `--shadow-xl` | `0 16px 32px rgba(0, 0, 0, 0.4)` |

### 3D bevel effects

Used sparingly, for interface elements that want an analogue / physical-device feel (buttons, toggles, cart-bar). Three states:

```css
--shadow-bevel-raised:
  inset -2px -2px 4px rgba(0, 0, 0, 0.4),
  inset 2px 2px 4px rgba(255, 255, 255, 0.1),
  0 4px 8px rgba(0, 0, 0, 0.3);

--shadow-bevel-pressed:
  inset 2px 2px 6px rgba(0, 0, 0, 0.5),
  inset -2px -2px 4px rgba(255, 255, 255, 0.05);

--shadow-bevel-hover:
  inset -3px -3px 6px rgba(0, 0, 0, 0.5),
  inset 3px 3px 6px rgba(255, 255, 255, 0.15),
  0 6px 12px rgba(0, 0, 0, 0.4);
```

## Transitions

| Token | Value |
|---|---|
| `--transition-fast` | `0.2s ease` |
| `--transition-normal` | `0.3s ease` |
| `--transition-slow` | `0.5s ease` |

## Buttons

TODO (Phase 3 — header/hero pass). Dawn ships a button system; decide whether to extend it (`.button`, `.button--primary`, `.button--secondary`) or replace. Log decision in `docs/decisions.md` when made.

## Inputs

TODO (Phase 3). Dawn's `.field` pattern is the starting point. Any deviation gets logged.
