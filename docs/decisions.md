# Decisions

Architectural and design decisions. What was decided, why, what was rejected.

## 2026-04-19: Fork Dawn, restyle — don't build from scratch or go headless

**Decision:** Use Shopify's Dawn as the base theme, fork it, restyle it. Deploy via Shopify's GitHub integration.

**Why:** Dawn is the reference OS 2.0 theme — performance-tuned, actively maintained by Shopify, free, well-understood. All standard e-commerce plumbing (cart, checkout, PDP, variants, search) comes for free. The only problem left to solve is styling.

**Rejected:**
- Headless / Hydrogen — explicitly moving away from the prior Astro direction. Adds complexity for no benefit at this scale.
- Build from scratch — 4–8 weeks of reinventing cart logic nobody asked for.
- Paid theme — pay to then fight its opinions. Dawn is freer, cleaner, updates from Shopify.

## 2026-04-19: Retrofit the Dev Project Playbook structure onto Dawn (don't overwrite)

**Decision:** Layer `CLAUDE.md`, `docs/`, `planning/`, `.greptile/`, `.claude/skills/` alongside Dawn's existing `assets/`, `sections/`, `snippets/`, `templates/` etc. Do not rename, delete, or restructure Dawn's files.

**Why:** Dawn is tracked as `upstream`. Every rename or structural change we make becomes a merge conflict forever. Keep changes additive.

**Rejected:** Restructuring Dawn into a "tidier" layout. Not worth the perpetual merge cost.

## 2026-04-19: Invert the Build Order — visual first, functional already done

**Decision:** Skip the playbook's "functional-first, visual later" phase. Go straight to brand-token extraction and section restyling.

**Why:** The Build Order principle assumes you're building features from scratch. Here, Dawn ships a fully-functional storefront on day one. Functional work is maintenance only (upstream merges, occasional bug fixes). The whole point of forking Dawn is that we skip that phase.

**Rejected:** Running functional audits or feature-building passes before visual work. There's nothing to audit — it works.

## 2026-04-19: Products-first, collections-later

**Decision:** Populate the catalogue by creating products and tagging them as we go. Build collections — likely rule-based / automatic — once there's enough product data to organise.

**Why:** Tapstitch is the fulfillment source and the catalogue is being built from scratch. Designing collections against zero products is speculative. Tags are cheap; collections can be recomputed any time.

**Rejected:** Designing collection structure up front.

## 2026-04-20: Use Shopify AI Toolkit instead of benjaminsehl/liquid-skills

**Decision:** Install the official [Shopify AI Toolkit](https://github.com/Shopify/Shopify-AI-Toolkit) as the Liquid / Shopify Agent Skill source, not `benjaminsehl/liquid-skills` as originally planned in Kiro's `CONTEXT.md`.

**Why:** The liquid-skills repo's own README now redirects people to Shopify's official toolkit ("No longer needed — go check out the official Shopify AI Toolkit"). The official toolkit adds doc search, GraphQL/Liquid validation, and store management via the CLI's execute capability, with auto-updates.

**Rejected:** Cloning the deprecated `benjaminsehl/liquid-skills`. Would work for the three skill files, but we'd miss the validator, doc search, and ongoing updates, and we'd own a dead dependency.

**Install:** Inside Claude Code, run `/plugin marketplace add Shopify/shopify-ai-toolkit` then `/plugin install shopify-plugin@shopify-ai-toolkit`.

## 2026-04-20: Fonts — hybrid Shopify font_picker + Google Fonts link

**Decision:** Load Sick Rabbit fonts through a hybrid system based on what Shopify's font library actually carries.

**Shopify `font_picker` (4 fonts)** — auto-subsetted, edge-cached, merchant-editable:
- `type_body_font` → `anonymous_pro_n4` (body, UI)
- `type_display_special_font` → `unifraktur_maguntia_n4` (H1, buttons)
- `type_logo_font` → `unifraktur_cook_n7` (logo, bold only)
- `type_hero_title_font` → `outfit_n4` (hero)

**Google Fonts `<link>` (2 fonts)** — hardcoded in `layout/theme.liquid`:
- `Pirata One` → `--font-heading-family` (H2)
- `Cinzel` → `--font-display-family` (collection names — stand-in for Nordica Plus)

**Why hybrid:** Pirata One and Cinzel are not in Shopify's curated font library. They're both on Google Fonts, so a single `<link>` in `<head>` (with preconnect) gets both with `font-display: swap`. Everything else goes through Shopify's native pipeline for best performance. `type_header_font` picker is kept with Dawn's default `assistant_n4` but its effect on `--font-heading-family` is overridden in `theme.liquid` — the setting is retained so upstream Dawn merges stay clean.

**Nordica Plus gap:** The original brand display font for collection names is not in Shopify's library OR Google Fonts (paid foundry font). Cinzel is the stand-in — medieval-leaning display serif, sits in the same gothic band as Pirata One and UnifrakturCook. Licensing + self-hosting Nordica Plus is a **post-launch decision** — logged in `planning/ideas.md`.

**Initial attempt that failed:** Tried to put all 6 fonts through `font_picker` on the assumption that Shopify's library = full Google Fonts catalogue. It isn't. Shopify's library is curated. Check the [available fonts](https://shopify.dev/docs/storefronts/themes/architecture/settings/fonts) before defaulting any `font_picker` to a non-standard family.

**Rejected:**
- Self-hosting all six fonts via `@font-face` — slower first paint, bigger repo, font files to license/manage.
- Finding in-library substitutes for Pirata One and Cinzel — the brand tokens call these out specifically; substitution is last-resort, not a convenience.
- Licensing Nordica Plus now — blocks Phase 2 on an external purchase; Cinzel is a strong-enough stand-in to move forward.

## 2026-04-20: Dawn colour scheme mapping — Sick Rabbit palette

**Decision:** Map the five Sick Rabbit brand tokens onto Dawn's five built-in colour schemes, keeping Dawn's scheme conventions (cards default to scheme-2, sold-out badges to scheme-3, sale badges to scheme-5).

| Scheme | Role | Background | Text | Button |
|---|---|---|---|---|
| 1 | Sand Dune — primary / default | `#e5dcc5` | `#2d2d2a` | `#903636` burnt rose |
| 2 | Graphite — cards | `#2d2d2a` | `#e5dcc5` | `#903636` burnt rose |
| 3 | Slate — sold-out badge | `#1c4d4f` | `#e5dcc5` | `#903636` burnt rose |
| 4 | Rose — featured / hero accent | `#903636` | `#e5dcc5` | `#2d2d2a` graphite |
| 5 | Copper — sale badge | `#a77b5f` | `#2d2d2a` | `#2d2d2a` graphite |

**Why:**
- Scheme-1 = Sand Dune (light) matches the old Astro site's default page background — most of the storefront renders on this.
- Dark graphite cards (scheme-2) on sand backgrounds give strong contrast — core Sick Rabbit feel.
- Burnt rose is the button colour across light schemes so CTAs pop without per-section overrides.
- Slate → sold-out and Copper → sale leans on Dawn's existing `sale_badge_color_scheme` / `sold_out_badge_color_scheme` conventions so merchants and upstream Dawn merges keep working.
- `--color-faded-copper` was flagged as "reserved / special uses" — sale badges are rare enough to qualify as a special use.

**Rejected:**
- Fewer schemes (e.g. 3) — would break Dawn's admin picker UX and break presets.
- Burnt rose as scheme-1 background — too aggressive for the default surface; reserved for featured moments instead.
- Keeping Copper entirely out of the scheme system — would leave scheme-5 doing nothing useful.

## 2026-04-19: Copy source is the old Astro repo

**Decision:** Reuse homepage copy, about page, collection descriptions from `C:\Users\redpo\repos\sickrabbit-website` (`src/pages/`, `src/content/`). Only rewrite when the old copy doesn't fit the new context.

**Why:** The voice is already right. Don't redo the voice work just because the stack changed.

**Rejected:** Writing copy from scratch for the Shopify version.
