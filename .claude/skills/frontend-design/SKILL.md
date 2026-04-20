---
name: frontend-design
description: Design and restyle UI for the Sick Rabbit Shopify theme — sections, snippets, layouts, components, colour/type/spacing decisions. Use this skill whenever the user is doing visual work on the theme: restyling a Dawn section (header, hero, PDP, cart drawer, footer), creating a new section or snippet, adjusting typography, applying brand colours, designing a module, reviewing how something looks, or asking things like "make this feel more Sick Rabbit", "restyle this", "design the header", "what should this look like", "fix the spacing", "typography pass", "does this match the brand". This is the authority on what Sick Rabbit looks and feels like — consult it for any design decision no matter how small, because "just this once hardcode a hex" is how drift starts. Not for architectural decisions about sections vs. snippets or OS 2.0 schemas (that's the architecture doc); not for logging design bugs (that's the issue skill). This skill answers "how should it look?" and "is that on-brand?". The Phase 3 restyle is the heart of this project — expect this skill to be invoked constantly.
---

# Frontend Design — Sick Rabbit

This is the visual authority for the Sick Rabbit theme. Whenever you're making something look a certain way, consult this.

## Two skills, one stack

Claude Code has a general `frontend-design` skill from the marketplace that teaches how to build **creative, production-grade frontend that doesn't look AI-generated**. Use that one for general design craft — layout instincts, avoiding slop aesthetics, pushing past the default.

**This skill layers Sick Rabbit on top of that craft.** It answers: *what does "Sick Rabbit" actually look like and how do I express it in Dawn + Liquid + CSS without breaking OS 2.0 or the upstream merge path?* Consult both.

## Brand identity, distilled

Sick Rabbit is a streetwear-adjacent apparel brand with a peculiar combination of references — **archaic / literary-occult typography**, **analogue music-gear physicality** (pedal boards, mixing desks, hardware synths), and a **playful, irreverent** tone that refuses to take itself too seriously. Collection themes — Anachronism, Norse Poets Society, Digital Occult, Major Arcana — are the permission slip. The storefront should feel like a small label run by someone with weird taste, not a generic Shopify fit-any-brand template.

The three ingredients sit together on purpose:
- Archaic blackletter + monospace is the "text-as-artefact" side
- Knobs, bevels, dials, meters is the "object-you-touch" side
- Playful irreverence is what keeps it from becoming cosplay-goth or tech-bro

### The six principles

1. **Warm-dark, not goth-dark.** The palette is earthy (graphite, burnt rose, dark slate, sand-dune cream). No pure black, no pure white, no cold greys. A hex that looks "just fine" in isolation will feel wrong next to the real tokens — always place a new value against the existing palette before committing.
2. **Typography-led.** Blackletter display faces (UnifrakturMaguntia, Pirata One, UnifrakturCook) carry the brand. A monospace (Anonymous Pro) carries the UI. The tension between those two is the signature — don't soften it with a neutral sans-serif for body text.
3. **Analogue-physical, not flat-digital.** UI elements can feel like hardware — pedal-board buttons, pots/knobs, meters, LED indicators, labelled panels. The `--shadow-bevel-raised`, `--shadow-bevel-pressed`, `--shadow-bevel-hover` tokens exist for this reason. Interactive controls (CTAs, variant pickers, add-to-cart, filters) can lean into this vocabulary. Purely editorial surfaces (long copy, hero) can stay flat. The goal isn't skeuomorphism cosplay — it's *one leg in the physical world* as a brand signal.
4. **Playful and irreverent, not precious.** The brand isn't serious about itself. Microcopy can be funny. Empty states can have personality. A 404 can be on-brand and dumb in a good way. "Slightly strange" shouldn't read as "strained cool" — it reads as a label having fun.
5. **Product-first once you're on the PDP.** Photography and the variant picker are the centre of gravity. Everything else steps back. Chrome stays minimal. The analogue vocabulary helps here — variant pickers as hardware selectors, quantity as a dial, add-to-cart as a chunky pedal button.
6. **Deliberate over polished.** The aim isn't SaaS polish — rounded-everything, airy gradients, feel-good micro-interactions. Hard edges, confident type, restrained animation, small tactile details. If it looks like a Stripe clone, it's wrong.

### The anti-patterns — things that would kill it

- **Bright primary CTAs** that fight the warm-dark palette (electric blue, neon green)
- **SaaS aesthetics**: soft gradients, glass-morphism, big drop shadows, rounded-everything, feel-good animation
- **Corporate sans-serif body text** (Inter, SF Pro, Helvetica, system-ui default) — neutralises the blackletter tension
- **Pastel "friendly" accent colours**
- **Generic Shopify hover**: scale-up-on-hover product card, fade-in-everything, the usual
- **Excessive animation** — a page should feel still until a shopper does something
- **Stock-photo hero composition**: centred text + "shop now" + lifestyle photo
- **Default Dawn leaking through**: neutral greys, sans-serif headings, generic blue focus rings, system button chrome
- **Cosplay goth**: skulls, pentagrams, blood-red, mall-Hot-Topic energy. The brand is literary-occult, not costume-goth.
- **Earnest "curated brand" voice** — the one that says "discover our collection of thoughtfully designed pieces." This brand doesn't talk like that. See principle 4.
- **Skeuomorphism cosplay** — a product card rendered as a literal polaroid, drop-shadowed and rotated. The analogue vocabulary is *selective* (interactive controls), not a wholesale retro theme.

If a choice drifts toward any of those, push back. The brand is specific; generic defaults aren't "safe," they're wrong.

## Tokens are the source of truth

The canonical token list lives at **`docs/design/system.md`**. That file is the contract. This skill gives you taste; that file gives you values.

Rules:

- Never hardcode hex, rgb, spacing pixels, radii, or font-families in CSS or inline Liquid `style=""`. Use CSS custom properties from `assets/base.css` or Dawn's colour scheme system.
- If the value you need isn't in `docs/design/system.md`, **add it there and in `assets/base.css` first**, then use it. Adding to the system is a lightweight decision, not a heavy one — the heavy decision is letting hardcoded values creep in.
- Dawn's own CSS custom properties (set from `config/settings_data.json`) are part of the system. When you're styling, reach for `var(--color-foreground)`, `var(--color-background)`, etc., wired to our palette via the scheme settings. Don't bypass them by defining parallel CSS vars with the same name.
- Merchant-editable surfaces (section settings, colour schemes) are the preferred way to expose design decisions. If a merchant should be able to pick a colour for a section, surface it via a `color_scheme` setting in the section's schema, not a hardcoded `background:`.

## Colour, applied

The palette is in `docs/design/system.md`. Here's when to use each:

| Colour | Typical role | Don't use for |
|---|---|---|
| `--color-sand-dune` (#e5dcc5) | Default page background, header/footer, hero background on light sections | CTA, body text on dark (too low contrast) |
| `--color-graphite` (#2d2d2a) | Body text on sand-dune; dark surfaces (footer, feature sections); primary heading colour | CTAs (too quiet) |
| `--color-dark-slate-grey` (#1c4d4f) | Secondary/elevated surfaces, tag/badge backgrounds, secondary CTAs | Body text on sand-dune (contrast is borderline) |
| `--color-burnt-rose` (#903636) | Primary CTA, accent, in-brand highlight. Use sparingly for emphasis to keep its impact | Background fills, body text |
| `--color-faded-copper` (#a77b5f) | Reserved — special one-off uses (collection-specific highlights, seasonal accents) | Anything recurring |

Rules of thumb:
- Two colours at a time usually feels right; three colours in a section requires a *reason*. Four colours is almost always wrong.
- The burnt-rose CTA is the brand's punctuation mark — if every button is burnt rose, nothing is emphasised. Reserve it for the primary action.
- On dark surfaces (graphite, dark slate), use sand-dune or a slightly warmer off-white for text. Never pure `#fff`.
- Body text hierarchy is carried by **weight and family**, not colour. Don't use five greys for five heading levels.

## Typography, applied

Six families, each with a role (full list in `docs/design/system.md`):

- **UnifrakturMaguntia** — H1, primary display. Use big, use once per page. Never set it under 2rem — blackletter at small sizes is unreadable and looks cosplay.
- **Pirata One** — H2, secondary display. Slightly more functional than UnifrakturMaguntia; good for section headings.
- **UnifrakturCook** — logo only. Don't repurpose.
- **Nordica Plus** — collection names, poster-style displays. The brand's "poster type."
- **Outfit** — hero wordmark ("Sick Rabbit"). Used where blackletter would be too hard to read (hero titles, some landing-page moments). Limited use — this is the "readable" face, don't let it take over.
- **Anonymous Pro (monospace)** — body, labels, UI, microcopy. This is where most text lives. The monospace tension against the blackletter displays is the signature.

Rules of thumb:
- **One display face per section**, ideally per page. Multiple blackletter faces at once = ransom note.
- **Headings can be big**. The scale in `docs/design/system.md` goes up to 84px for the logo. Use the scale — don't timidly default to 24px for every heading.
- **Tight line-heights on display type** (`--leading-tight: 1`), generous on body (`--leading-normal: 1.5`, `--leading-relaxed: 1.8` for long-form).
- **Don't italicise blackletter.** Never.
- **Kerning and spacing matter more at large sizes** than small. For the 64–84px display sizes, inspect the letterforms — blackletter has weird default kerning that often needs a `letter-spacing: -0.02em` or similar tuning.

## The analogue-hardware vocabulary

This is what "principle 3" looks like in practice. These are design moves — use them where they fit, don't force them everywhere.

**Vocabulary bank**:
- **Bevelled buttons** — depress on click. `--shadow-bevel-raised` for default, `--shadow-bevel-pressed` for `:active`, `--shadow-bevel-hover` on hover. The change should feel *mechanical* (instant, discrete), not CSS-easing smooth.
- **Knobs / dials** — quantity control, sort-by, variant size. A circular control with a notch is on-brand; a vanilla `<select>` is not.
- **Toggle switches** — filters, on/off states. Chunky, labelled, with a satisfying on/off position (think guitar-pedal toggle, not iOS switch).
- **Meters / LEDs** — stock indicators, progress, cart-item counter. A segmented LED read-out ("3 in stock" as three lit bars) reads more Sick-Rabbit than a plain number.
- **Labelled panels** — section headings can look like hardware labels: uppercase monospace, small, on a separator line or bordered box. Think guitar-amp front panel.
- **Patch-cable / wiring motifs** — decorative, for transitions, dividers, hero ornaments. Subtle, not everywhere.
- **Tactile type** — display type can feel embossed, die-cut, engraved. Don't go full steampunk, but a slight depth cue on the wordmark or a big heading is on-brand.

**Where to apply**:
- **Lean in**: CTAs (add-to-cart, checkout, submit), variant pickers, filter/sort UI, cart drawer controls, quantity adjusters, search button, newsletter form submit.
- **Stay flat**: editorial hero copy, collection grids, product photography frames, long-form copy, policy pages. Don't bevel a paragraph.

**Where it usually fails**:
- **Over-applied** — every element bevelled and clickable-looking. Reads as Fisher-Price, not pedal-board. Pick the interactive elements, leave the rest alone.
- **Too literal** — a product card rendered as a cassette tape label with tape-reels. That's costume, not design. The vocabulary is *inspired by* hardware, not *a theme of* it.
- **Inconsistent metaphor** — one button is a pedal, another is a chrome light-switch, another is flat. Pick the vocabulary and use it consistently across interactive controls.

## How to restyle a Dawn section (Phase 3 workflow)

Phase 3 is a section-by-section restyle (priority: header → homepage → collection → PDP → cart drawer → footer). For each section:

### 1. Read Dawn's original first

Open the section file (`sections/<name>.liquid`) and its associated CSS (`assets/section-<name>.css` or `assets/component-*.css`). Note what merchant-editable settings already exist — the schema must stay intact so theme-editor behaviour is preserved.

### 2. Look at a brand reference

Before touching code, look at the old Astro repo (`C:\Users\redpo\repos\sickrabbit-website\src\pages/` and `src/content/`) for how this thing has been expressed in the brand's voice before. It's not a codebase to port; it's a mood board. Especially valuable for copy tone and hero typography treatments.

### 3. Plan additive, not destructive

Dawn is `upstream`. Every structural rewrite is a future merge conflict. Prefer these in order:
1. **CSS custom property overrides** in `assets/base.css` — change the look without touching the Liquid at all
2. **Section-scoped CSS** in `assets/section-<name>.css` — override Dawn's defaults with class selectors
3. **Schema settings** — expose merchant-editable knobs so design choices aren't hardcoded
4. **New snippets** you `{% render %}` into the section — when you need new markup
5. **Direct Liquid edits to Dawn's section file** — last resort, only when the above can't express the change

### 4. Build the variant in isolation

Run `shopify theme dev` at `127.0.0.1:9292`. Navigate to the page with the section. Open devtools, tune CSS custom properties live in the inspector before committing to values in code.

### 5. Verify across the scenarios

Design only holds up if it holds up in reality:
- **Breakpoints** — 414px (mobile Safari), 768px (tablet), 1024px (small desktop), 1440px (desktop). Design once, check four times.
- **Content states** — empty (no products, empty cart), short content, very long content (paragraph of 3 sentences vs. paragraph of 15)
- **Dark content areas** — some sections have the palette inverted; make sure the type still reads

### 6. Update `docs/components.md` if you added anything

New snippets and significantly-modified sections go in the registry.

### 7. Log the decision if it's material

If the restyle made a non-obvious choice (e.g. "we override Dawn's button entirely instead of extending it"), add a short entry to `docs/decisions.md`. Future you will want to know why.

## Section-specific notes (growing document)

Populate this section as Phase 3 progresses. Each section gets a paragraph on the key design move, the failure modes encountered, and the token choices that worked.

- **Header** — _TBD (Phase 3 first pass)._ Key decisions: logo treatment (UnifrakturCook), nav font, cart icon style, announcement bar behaviour.
- **Hero / homepage** — _TBD._ Key decisions: hero wordmark, featured-collection presentation, density of the page.
- **Collection grid** — _TBD._ Key decisions: product card, hover state, filter/sort UI, empty state.
- **PDP** — _TBD._ Key decisions: gallery layout, variant picker, add-to-cart button, description typography, related products.
- **Cart drawer** — _TBD._ Key decisions: line item layout, quantity control, empty-cart moment, checkout CTA treatment.
- **Footer** — _TBD._ Key decisions: newsletter form, link grouping, social icons, "slightly strange" moment.

When you finish a section, write the paragraph. These notes compound.

## Accessibility, specific to this palette

The warm-dark palette needs real contrast checking — eyeballing lies. WCAG 2.2 AA: **4.5:1** for body text, **3:1** for large text (≥ 18px bold or ≥ 24px regular) and UI components.

Known-good combinations (check with a tool before relying):

- `--color-graphite` on `--color-sand-dune` — safe for body text
- `--color-sand-dune` on `--color-graphite` — safe for body text
- `--color-sand-dune` on `--color-dark-slate-grey` — safe for body text
- `--color-burnt-rose` on `--color-sand-dune` — **marginal for body text**; fine for large headings and CTA buttons
- `--color-dark-slate-grey` on `--color-sand-dune` — **marginal for body text**; verify before use

Other accessibility rules:

- **Focus states must be visible and on-brand.** Don't `outline: none` without replacing with a custom style — the default browser outline is ugly but it's there for a reason. A 2px burnt-rose outline with a 2px offset reads as intentional and on-brand.
- **Touch targets ≥ 44×44 CSS pixels.** Nav links, cart buttons, variant swatches. Decorative elements can be smaller.
- **Blackletter is hard to read.** Use it for display sizes, not for body copy or critical labels. Anything a shopper needs to understand at a glance (prices, "Add to cart", checkout steps) goes in Anonymous Pro.
- **Alt text on product images** should describe the product, not be empty or the filename.
- **Announce cart updates** with `aria-live="polite"` on the cart line-item region.

## Shopify / OS 2.0 hooks

- **Colour schemes** (`config/settings_data.json` → `color_schemes`) are how a merchant can change a section's palette. Map the brand tokens onto Dawn's scheme slots (background, foreground, button, button-label, secondary-button, etc.) so schemes work out of the box.
- **Section settings** are where design choices become merchant-editable. If the user wants to pick a hero image, a heading, or a background colour per-section, it belongs in the schema.
- **App blocks** — some sections may accept merchant-installed app blocks (e.g. reviews). Design the section so an app block drop-in doesn't break the layout.
- **Responsive images** — use `{{ image | image_url: width: X }}` with sensible widths and `srcset`, not a fixed-size image in markup.

## Common patterns (seed)

These grow into a `references/examples.md` when there are enough of them to warrant splitting.

### Section CSS skeleton

```liquid
<!-- sections/sick-rabbit-example.liquid -->
<div class="sr-example color-{{ section.settings.color_scheme }}">
  <h2 class="sr-example__heading">{{ section.settings.heading }}</h2>
</div>

{% stylesheet %}
  .sr-example {
    padding-block: var(--space-10);
    padding-inline: var(--space-4);
  }
  .sr-example__heading {
    font-family: var(--font-heading);
    font-size: var(--text-h1);
    line-height: var(--leading-tight);
    color: rgb(var(--color-foreground));
  }
{% endstylesheet %}

{% schema %}
{
  "name": "Sick Rabbit Example",
  "settings": [
    { "type": "color_scheme", "id": "color_scheme", "label": "Colour scheme", "default": "scheme-1" },
    { "type": "text", "id": "heading", "label": "Heading", "default": "Example" }
  ],
  "presets": [{ "name": "Sick Rabbit Example" }]
}
{% endschema %}
```

### Do / don't

```css
/* ✓ */
.product-card__title {
  font-family: var(--font-heading);
  color: rgb(var(--color-foreground));
  padding: var(--space-3);
}

/* ✗ */
.product-card__title {
  font-family: 'Pirata One', cursive;
  color: #2d2d2a;
  padding: 24px;
}
```

## When in doubt

- **When in doubt about a value**, check `docs/design/system.md`.
- **When in doubt about a pattern**, look at how the old Astro repo expressed it — it doesn't have to match, but it's a strong hint.
- **When in doubt about the brand**, re-read the five principles above. If a choice fights them, it's probably wrong.
- **When in doubt about a Shopify constraint**, consult the Shopify AI Toolkit skill or `docs/architecture.md`.
- **When in doubt whether the user will like it**, show them at `127.0.0.1:9292` before committing. Design opinions are cheap; a live preview is fast.

## Reference

- **Tokens (source of truth)** — `docs/design/system.md`
- **Brand mood board (old Astro repo)** — `C:\Users\redpo\repos\sickrabbit-website\src\styles/`, `src/pages/`, `src/content/`
- **Architecture** — `docs/architecture.md`
- **Decisions** — `docs/decisions.md`
- **Generic design craft** — the `frontend-design:frontend-design` skill from the Claude Code marketplace (complements this one)

Populate sibling files as the design grows:
- `components/README.md` — shared snippet/section UI inventory
- `references/brand-voice.md` — copy voice, tone, microcopy examples from the old repo
- `references/dawn-overrides.md` — patterns for overriding Dawn defaults cleanly
- `references/section-notes.md` — per-section design log (or keep inline above until it splits)
