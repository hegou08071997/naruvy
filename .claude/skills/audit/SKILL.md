---
name: audit
description: Run a systematic health check on the Sick Rabbit Shopify theme — catches design-token drift, dead Liquid, stale component registries, schema and translation problems, Dawn-file destruction, and other debt that accumulates quietly between features. Use this skill when the user says "run an audit", "audit the theme", "health check", "check the codebase", "are we clean", "sanity check", "how's the theme looking" — or when a major piece of work just shipped (end of a phase, before a restyle wave, before launch). Also trigger at roadmap checkpoints and proactively suggest running one when a section restyle, token pass, or phase finishes. Before Phase 5 launch this is mandatory. Not for fixing bugs (that's the debug-session skill) or logging a single bug (that's the issue skill) — audits sweep the whole codebase for silent drift and log what they find.
---

# Audit

A systematic sweep of the theme to catch the things that degrade quietly between features. Every audit runs a standard set of checks, then adds context-aware extras based on what was recently shipped.

The goal is to catch drift before it becomes debt. On a forked Shopify theme, drift is especially expensive: Dawn is `upstream`, and every hardcoded value, destructured file, or stale registry entry makes the next `git merge upstream/main` worse.

## Standard checks (run every audit)

### 1. Snippet / section usage

- Scan `sections/` and `snippets/` for Liquid fragments that duplicate each other. If a chunk of markup shows up in 2+ places, flag it for extraction.
- Check that `docs/components.md` matches reality — every Sick-Rabbit-custom snippet/section listed; no orphan entries pointing at deleted files.
- Flag any `{% include %}` calls — should all be `{% render %}`.
- Flag `.liquid` files in `sections/` that are missing a `{% schema %}` block or missing `presets` (breaks merchant editability).
- Flag sections with settings defined in the schema that the template never reads (dead settings confuse merchants).

### 2. Design tokens

- Grep `assets/**/*.css`, `sections/**/*.liquid`, `snippets/**/*.liquid`, `layout/**/*.liquid` for hardcoded hex (`#[0-9a-f]{3,8}`), `rgb(`, `rgba(`.
- Check inline `style=""` attributes in Liquid for colour/size/spacing literals.
- Flag hardcoded font stacks (e.g. `font-family: 'Pirata One', cursive;` outside the token layer).
- Flag magic numbers for spacing/padding/margin/radius that aren't coming from tokens.
- Reference `docs/design/system.md` for the canonical list — if a value isn't there, either it needs to be added first or the usage is wrong.
- Check `config/settings_data.json` vs. `docs/design/system.md` for drift — is the store actually running the tokens we say it is?

### 3. Locale / translation hygiene

- Scan `sections/` and `snippets/` for English strings that should go through `{{ '...' | t }}` — plain text in `<button>`, `<h1>`, `<p>`, `alt=""`, `placeholder=""`, `title=""`, etc.
- Check that every `t:` key used in Liquid exists in `locales/en.default.json`.
- Flag orphan keys in `locales/en.default.json` not referenced anywhere.
- If other locale files exist, flag keys that are present in `en.default.json` but missing in other locales.

### 4. Money / currency

- Grep for prices formatted manually (`£{{ product.price }}`, concatenated currency symbols, `divided_by: 100`) instead of `| money`, `| money_with_currency`, or `| money_without_trailing_zeros`.

### 5. Dead code

- Orphan snippets (files in `snippets/` never referenced by `{% render %}` or `{% include %}`).
- Orphan sections (files in `sections/` not present in any `templates/*.json` and with no `"presets"` in the schema — truly unreachable).
- Orphan CSS files in `assets/` not referenced by any Liquid file.
- Orphan JS files in `assets/` not referenced by any Liquid file or `script` tag.
- Commented-out Liquid/HTML/CSS/JS blocks. Git has the history.
- Unused keys in `config/settings_schema.json` — setting IDs that nothing reads.

### 6. Naming and structure consistency

- Snippets and sections: kebab-case filenames. Flag camelCase or snake_case.
- JSON templates: kebab-case. Section-scoped CSS: `section-<name>.css` pattern.
- Liquid variable names: snake_case.
- Flag files living in the wrong directory (a schema-carrying file in `snippets/`, a schema-less fragment in `sections/`).

### 7. Dawn integrity (upstream friendliness)

- Has any Dawn-originating file been renamed, moved, or deleted? Every such change becomes a permanent merge conflict. Flag and ask whether it was deliberate — if yes, should be logged in `docs/decisions.md`.
- Count commits behind `upstream/main` (`git fetch upstream && git rev-list --count HEAD..upstream/main`). If the gap is growing, flag for a scheduled merge.

### 8. JSON validity

- Every `templates/*.json`, `config/settings_data.json`, `config/settings_schema.json`, `locales/*.json`, and inline `{% schema %}` block must parse. A trailing comma kills the storefront. (`shopify theme check` catches most of this — run it as part of the audit.)

### 9. Theme check

- Run `shopify theme check`. Record errors (blockers) and warnings (review-and-decide) separately.
- If any check rule has been disabled in `.theme-check.yml` without a matching `docs/decisions.md` entry, flag it.

## Context-aware extras

After the standard checks, read `planning/roadmap.md` to see what phase is active and what just shipped. Add the relevant extras and tell the user what and why before running them.

| Recent work | Add extras |
|---|---|
| Phase 2 (token extraction) | **Token coverage**, **font loading** |
| Phase 3 (section restyle) — header/nav | **Accessibility (keyboard nav)**, **performance (critical CSS)** |
| Phase 3 — PDP / variant picker | **Accessibility (ARIA live regions)**, **performance (JS deferral)**, **variant state edge cases** |
| Phase 3 — cart drawer | **Accessibility (focus trap)**, **performance (JS hydration)**, **edge cases (empty cart, variant swap)** |
| Phase 4 (products + content) | **Data completeness**, **image alt text**, **metafield coverage** |
| Phase 5 (launch) | **Pre-launch checklist** (see below) — mandatory, no skipping |

Tell the user: *"Running standard audit + accessibility + performance (cart-drawer restyle just landed). Want to add or skip anything?"*

### Performance (Shopify flavour)

- Images rendered with `image_url: width: X` at a size appropriate for the slot (not 2000px in a 400px thumbnail).
- Below-fold images using `loading="lazy"` and appropriate `fetchpriority`.
- Custom fonts declared with `font-display: swap`; preloaded only when above-the-fold.
- Critical CSS inlined in `<head>`; non-critical loaded asynchronously.
- JavaScript loaded with `defer` or as `type="module"`; no blocking scripts.
- No heavy work happening on every page (e.g. a global JS file that loads a carousel lib on pages without carousels).
- Lighthouse score delta vs. vanilla Dawn — if we've regressed performance, flag it.

### Accessibility (WCAG 2.2 AA)

- Colour contrast — with the Sick Rabbit warm-dark palette this needs real checking, not assumption. Body text on backgrounds: 4.5:1. UI text: 3:1. Use the actual hex values from `docs/design/system.md`.
- Touch targets ≥ 44×44 CSS pixels (cart icons, variant buttons, nav toggles).
- Every interactive element keyboard-reachable; focus state visible (and on-brand — don't kill the default outline without replacing it).
- `aria-live` on cart-update announcements; focus trap on cart drawer and modals; focus restored on close.
- Product images have meaningful `alt` text (not just the filename).
- Form inputs have associated `<label>` or `aria-label`.
- Heading hierarchy per page (one `h1`, no skipped levels).

### Pre-launch checklist (Phase 5 — mandatory)

Run every standard check plus:

- Storefront **password protection removed** (or, if staying protected, that's deliberate).
- Legal pages present and linked: shipping policy, returns, privacy, terms (policies live in Shopify admin → Settings → Policies).
- Shipping zones configured for the intended markets (GBP, UK + ROI + EU as applicable).
- Taxes configured correctly for GBP / UK registration status.
- Payment gateway active (Shopify Payments or alternative) and tested with a real test transaction.
- Favicon set; social share meta (`og:image`, `og:title`, `twitter:card`) on home and PDP.
- 404 template styled and on-brand.
- Theme editor → all sections still editable (no regressions to schema blocks).
- Google Analytics / meta pixel / any tracking scripts installed and firing.
- DNS configuration for `sickrabbit.com` matches Shopify's required records; SSL provisioned.
- Dawn `upstream/main` merged to within ~1 release.
- `git log --author="Shopify"` — any merchant-admin auto-commits reviewed and understood before launch.

## Workflow

### 1. Announce the plan

Read `planning/roadmap.md`. List the standard checks plus any extras, and explain why the extras are included. Let the user adjust before you start.

### 2. Run checks systematically

Work through each category in order. Prefer Grep/ripgrep over manual reading for anything mechanical (hex values, `{% include %}`, orphan snippets — write small shell/regex passes instead of eyeballing).

For each finding, assess severity using the issue skill's Shopify-flavoured rubric:

- **High** — breaks the purchase path, shopper-visible error, security/compliance issue, pre-launch blocker.
- **Medium** — inconsistency, drift from the token system, minor technical debt, something that'll bite in the next restyle.
- **Low** — cosmetic or trivial.

### 3. Log findings to `planning/issues.md`

Use the `issue` skill's format. Add the audit provenance in Steps:

```
**Steps:** Found during audit YYYY-MM-DD — [check category]. <reproducer or file:line>
```

That traceability lets future audits dedupe and lets `git log | grep` find the fix later.

Don't fix things during the audit pass itself. That conflates two workflows and makes the audit less thorough (you'll burn time fixing the first thing you find and forget to finish the sweep). Audit first, fix later in a debug session.

### 4. Produce a summary

Write to chat:

```
## Audit Summary — YYYY-MM-DD

**Checks:** Snippet/section, Design tokens, Locales, Money, Dead code, Naming, Dawn integrity, JSON, Theme check + Accessibility + Performance

### Results
- High: 2
- Medium: 6
- Low: 3

### Highlights
- 4 hardcoded hex values in sections/header.liquid and snippets/product-card.liquid (design tokens)
- `snippets/legacy-hero.liquid` orphaned — no render call in repo (dead code)
- Cart drawer `aria-live` missing — screen readers don't announce line-item updates (accessibility, high)
- 47 commits behind upstream/main — schedule a Dawn merge (Dawn integrity)

### Logged
All findings added to planning/issues.md as ISS-012 through ISS-022.
```

## Roadmap integration

Audits are checkpoints, not ad-hoc. When building or updating `planning/roadmap.md`, insert an **Audit Checkpoint** between major phases without being asked — it's standard practice on this project:

```markdown
### Phase 2 — Extract brand tokens
...

### Audit Checkpoint (post-Phase 2)
Token-coverage pass before Phase 3 restyle begins.

### Phase 3 — Restyle sections
...

### Audit Checkpoint (pre-launch, mandatory)
Full audit including the pre-launch checklist before Phase 5.

### Phase 5 — Launch
...
```

The cost of a full audit is small compared to the cost of restyling on top of hidden token drift or launching with a broken 404.

## Rules

- **Sweep, don't fix.** An audit catalogues findings; fixes happen afterwards via debug-session.
- **Log to `planning/issues.md`** with audit provenance — don't drop findings into chat and forget them.
- **Run `shopify theme check`** as part of every audit — it catches things grep doesn't.
- **Read the roadmap** before choosing extras. Context-free audits miss the things most likely to be broken.
- **Respect Dawn.** Any destructive edit to a Dawn-originating file is a finding unless already logged in `docs/decisions.md`.
- **Don't skip the pre-launch checklist** before Phase 5.
