---
name: issue
description: Log bugs and regressions for the Sick Rabbit theme to planning/issues.md. Use this skill when the user reports something broken on the storefront — crashes, wrong behaviour, checkout or cart problems, layout that breaks, wrong prices, variants not switching, sections disappearing, accessibility regressions, translations missing, or anything working one way and now working another. Trigger on "that's broken", "this is a bug", "this doesn't work", "it's glitching", "look at the site — X is wrong", "did we regress X", "prod is broken", "what issues do we have", "what's open", "show me the bugs", "is there a bug for X". Also trigger when the user wants to mark an issue fixed or asks to show the current bug list. For features, new sections, or things to build, route to planning/ideas.md or planning/roadmap.md instead — this skill is strictly for things that need fixing.
---

# Issue

Issues for the Sick Rabbit theme live in `planning/issues.md`. This is the single source of truth for what's broken. Features, new sections, and things to build go in `planning/ideas.md` (not yet committed) or `planning/roadmap.md` (committed) — not here.

## Issue vs. task vs. idea vs. roadmap item

- **Issue** → "the variant picker doesn't update the price on mobile" → something's broken → log here
- **Task** → "add a size filter to the collection page" → something to build inside the current/next phase → use the `task` skill (`TSK-NNN` in `planning/roadmap.md`)
- **Idea** → "we should build a lookbook page" → something new not yet decided → `planning/ideas.md`
- **Phase / roadmap item** → "Phase 3 — Restyle sections" → a whole chunk of work → use the `plan` skill

If the user describes something that isn't broken, route it:
- Concrete and ready to build → `task`
- Not yet committed → `ideas.md`
- A whole phase → `plan`

## Why this matters for a Shopify theme

`main` auto-deploys to the live theme. "It's broken" on this project usually means a customer is seeing it right now. Severity is less about cosmetics and more about whether a shopper can find, understand, or complete a purchase.

## File format

`planning/issues.md` has two sections — Open and Fixed. New issues go in Open. When resolved, they move to Fixed with the fix summary and commit hash.

```markdown
# Issues

## Open

### ISS-003: Description of the issue
**Found:** YYYY-MM-DD
**Severity:** High | Medium | Low
**Where:** Section/snippet/template path or page type (e.g. `sections/header.liquid`, PDP, cart drawer)
**Steps:** How to reproduce — include device/browser if relevant
**Screenshot/URL:** optional but helpful for visual bugs

## Fixed

### ISS-001: Cart drawer closes on variant change
**Found:** 2026-04-22
**Severity:** High
**Fixed:** 2026-04-23
**Fix:** Removed stray event listener that re-initialised drawer on DOM mutation
**Commit:** abc1234
```

The `Where` line is an addition to the playbook template — it's always useful on a Shopify theme because the first thing anyone does when reopening an issue is find the relevant section/snippet.

### Issue IDs

Format: `ISS-NNN`. Increment from the highest existing ID. Read `planning/issues.md` first to find it — don't guess.

## Severity, Shopify-flavoured

Severity in a live-selling theme is mostly about: *does this prevent a sale or make a customer see something wrong*.

- **High** — blocks or breaks the purchase path. Checkout broken; cart broken; wrong price shown; currency/tax wrong; product variants not selecting; product pages 404ing; page crashing / white-screening; storefront password or unintended redirects; severe accessibility regression (can't add to cart by keyboard); Liquid error rendering a shopper-visible "Liquid error" string.
- **Medium** — visible problem with a workaround or limited blast radius. Visual glitch in one section, layout breaking at a specific viewport, an animation that jitters, a translation key missing, a setting that isn't wiring through to the CSS, a broken link in the footer, a Greptile-flagged regression that hasn't bitten customers yet.
- **Low** — minor, edge case, or internal-only. Copy typo, slight spacing inconsistency, admin-only annoyance, console warning with no user-visible impact.

When in doubt, ask the user — don't downgrade something that could be High.

## Workflow

### Logging an issue

1. Read `planning/issues.md` to find the current highest `ISS-NNN`.
2. Assess severity using the rules above. If you're unsure, ask.
3. Add an entry to the Open section with the next ID.
4. Fill every field: Found, Severity, Where, Steps. Skip Screenshot/URL if not provided.
5. Confirm in chat with the ID and one-line summary: e.g. *"Logged ISS-004 (high): cart drawer closes on variant change on mobile Safari."*

If the user reports several issues at once, log them all first, then confirm.

### Marking an issue fixed

When a fix has landed:

1. Move the entry from Open to Fixed.
2. Add `Fixed:` (date), `Fix:` (one or two sentences on the root cause and what changed), `Commit:` (hash).
3. Keep the body of the entry intact so the "what was broken" record survives.

If you're logging the fix as part of the same conversation that fixed it, reference the most recent commit hash from `git log -1 --format=%h`.

### Showing open issues

When asked "what's open" or "show the issues":

1. Read `planning/issues.md`.
2. Summarise the Open section in chat, grouped by severity (High → Medium → Low), newest first within each group.
3. If there's nothing open, say so — don't invent entries to pad.

## Connecting to commits

Reference the issue ID in commit messages so `git log | grep ISS-` stays useful:

```
fix: stop cart drawer closing on variant change (ISS-004)
```

The `commit` skill's `fix` type pairs naturally with issues.

## Connecting to Greptile and audits

- **Greptile review comments** that surface real regressions can be logged as issues with a note like "Found by Greptile on PR #N" in the Steps field. Style-only Greptile nits (naming, token tidy-ups) usually don't warrant an issue — address them in the PR.
- **Audit findings** (from the `audit` skill, when it exists) land here too, with "Found during audit — [check category]" in the Steps field. That traceability helps future audits dedupe.

## What not to log as an issue

- Things that are working as intended but the user doesn't like — that's a design change, go to `planning/ideas.md` or discuss a decision in `docs/decisions.md`.
- Merchant-admin configuration mistakes (e.g. a section hidden via admin toggles) — this is store config, not a theme bug. Tell the user what to flip in admin instead.
- Shopify platform outages — not ours to fix. Point at [shopify.status.com](https://www.shopifystatus.com/) and don't log.
