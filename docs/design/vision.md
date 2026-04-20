# Design Vision

## What Sick Rabbit is

A streetwear-adjacent apparel brand with a slightly occult, literary, tech-myth aesthetic. Collection themes include Anachronism, Norse Poets Society, Digital Occult, Major Arcana — creative, irreverent, unafraid to be strange.

## Site personality

A peculiar combination — archaic/literary-occult typography sitting next to analogue music-gear physicality (pedal boards, mixing desks, hardware synths), held together by a playful irreverence. The three ingredients matter in combination:

- The archaic blackletter + monospace is the "text-as-artefact" side
- Knobs, bevels, dials, meters is the "object-you-touch" side
- Playful irreverence is what keeps it from being cosplay-goth or tech-bro

Principles:

- **Deliberate, not corporate.** The storefront should feel like a small label run by someone with weird taste, not a generic Shopify fit-any-brand template.
- **Warm-dark, not goth-dark.** Earthy darks (graphite, burnt rose, dark slate) with a sand-dune cream as the default light tone. Black-on-grey is lazy; this brand uses colour.
- **Typography-led.** Blackletter display faces carry the identity. UI text is a monospace for contrast and a techy feel.
- **Analogue-physical vocabulary for interactive controls.** CTAs, variant pickers, quantity adjusters, filters — these can feel like hardware (bevelled buttons that depress, knobs, toggles, meters). The `--shadow-bevel-raised/-pressed/-hover` tokens exist for exactly this. Editorial surfaces stay flat. The goal is *one leg in the physical world* as a brand signal, not full skeuomorphism cosplay.
- **Product-first.** Once we're on the PDP, photography and the variant picker are the centre of gravity. Minimal chrome.
- **Playful, not precious.** Slightly strange, irreverent, doesn't take itself too seriously. Microcopy can be funny. Empty states can have personality. A 404 can be on-brand and dumb in a good way.

## What to avoid

- Generic SaaS gradients, pastel "friendly" palettes, rounded-everything.
- Bright primary CTAs that fight the warm-dark palette.
- Overuse of animation — occasional, purposeful transitions only.
- Any UI pattern that screams "default Shopify theme."

## North star

A visitor should land on the homepage and feel they've arrived at *a brand*, not a store template. Without reading any copy, the typography and colour choices should already be saying something.

## Build order exception

The [[Build Order]] playbook says "functional first, visual later." For this project it's inverted: Dawn ships functional, so we skip directly to the visual layer. See [`docs/decisions.md`](../decisions.md).
