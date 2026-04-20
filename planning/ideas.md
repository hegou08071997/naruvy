# Ideas

Features being considered but not committed to the roadmap. Promote to `roadmap.md` when agreed.

## Post-launch

- **Bespoke PDP layout** — after the clean-Dawn-restyle launch. Large-format imagery, experimental typography, narrative-style product descriptions.
- **Custom cart drawer animations** — small moments of personality (rabbit icon, blackletter loading state).
- **Editorial content pages** — lookbooks / collection stories using OS 2.0 page templates, referencing themes from the old Astro repo (Anachronism, Norse Poets Society, etc.).
- **Lookbook / mood-board sections** — reusable section merchants can drop into any page.
- **Loyalty / referral** — Shopify apps (Smile.io, ReferralCandy, etc.) if volume warrants.
- **Wishlist / favourites** — evaluate app vs. custom. Probably app.
- **Custom 404** — something on-brand and strange.
- **Email capture with a story** — newsletter form that isn't "sign up for 10% off."

## Deferred decisions

- **License and self-host Nordica Plus** — the original brand display font for collection names. Not in Shopify's font library, so Phase 2 shipped with `Cinzel` as a stand-in (see `docs/decisions.md` 2026-04-20 Fonts). Post-launch: source the foundry file, drop in `assets/`, wire `@font-face`, update `--font-display-family` to prefer Nordica Plus with Cinzel as fallback.
- **Dark mode**: the brand palette is already dark-leaning; a true dark mode might be gratuitous. Revisit if a user asks.
- **Multi-currency**: GBP only at launch. Shopify Markets available if needed later.
