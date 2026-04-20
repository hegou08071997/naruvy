# Sick Rabbit Theme — Claude Instructions

A forked-and-restyled Shopify Dawn theme for the Sick Rabbit apparel brand. Deployed at `sickrabbit.com` via Shopify's GitHub integration (push to `main` → live theme).

## File Operations (CRITICAL)
- Always Read a file before editing it
- Use Edit for targeted changes, Write only when rewriting whole files
- Never use Bash/Task agents for file writes — they don't reliably persist
- Always verify with git status/diff before committing
- Do **not** rename or delete Dawn's existing files wholesale. Prefer additive changes (extend, override via CSS vars, add new sections/snippets) so `git merge upstream/main` stays tractable

## Before Writing Any Code
1. Check `docs/components.md` for existing snippets/sections that cover the need
2. Check `snippets/` and `sections/` for anything already written that does the job
3. If a block of Liquid shows up in 2+ places, extract it to a snippet — don't copy it
4. Read `docs/design/system.md` before making any visual decision
5. Check `docs/decisions.md` before proposing architectural alternatives

## Shopify / OS 2.0 Rules
- Templates are JSON (`templates/*.json`) — they reference sections, they don't contain layout. Don't replace a JSON template with a `.liquid` template without an explicit decision log entry
- Every section intended for admin reuse must keep its `{% schema %}` block with valid `presets`, `settings`, and `blocks` so merchants can still edit it in the theme editor
- Never inline business logic that Shopify already provides (money formatting, translations, cart, variants) — use filters (`money`, `t:`) and Liquid objects, not JS shims
- Client-side JS is a last resort. Dawn's principle is HTML-first, JS-only-as-needed — follow it
- Any new setting that needs merchant control goes in the section's schema or `config/settings_schema.json`, never hardcoded
- Two-way sync with Shopify admin: merchant edits auto-commit to the connected branch. Assume `config/settings_data.json` and `templates/*.json` may be changed outside of code and rebase-friendly

## Component Rules (Liquid edition)
- Reusable markup → `snippets/` (render with `{% render 'name' %}`)
- Reusable content blocks → `sections/` (with schema, so merchants can edit)
- Page templates → `templates/*.json` (compose sections)
- Screens/templates contain composition only — no primitive markup that belongs in a snippet
- Update `docs/components.md` when adding a new snippet or section

## Design Token Standard (NO EXCEPTIONS)
- Never hardcode colours, font sizes, spacing, or radii in section/snippet CSS
- Always use Dawn's CSS custom properties or Sick Rabbit tokens (defined in `assets/base.css` / `config/settings_data.json`)
- Colours go through Dawn's colour scheme system — don't bypass it to hardcode a brand hex
- If a value isn't in the design system, add it to `docs/design/system.md` and `assets/base.css` first, then use it

## Naming Conventions
- Snippets: kebab-case (`product-card.liquid`, `icon-cart.liquid`)
- Sections: kebab-case (`featured-collection.liquid`, `announcement-bar.liquid`)
- JSON templates: kebab-case (`product.json`, `collection.anachronism.json`)
- CSS files: kebab-case (`section-featured-collection.css`)
- Liquid variables: snake_case (`product_card_image_ratio`)
- Locale keys: dot-separated snake_case (`products.product.add_to_cart`)

## Commits & branches (CRITICAL — main is live)

`main` is connected to the live Shopify theme. Every merge to `main` deploys within seconds. There is no staging. Discipline:

- **Never commit directly to `main`.** Always on a branch. Always via PR. The pre-commit hook (`.githooks/pre-commit`, enabled via `git config core.hooksPath .githooks`) enforces this locally.
- **Never push directly to `origin/main`.** PRs only. GitHub branch protection enforces this remotely (see `docs/setup/branching.md`).
- **Small fixes still get branches.** A typo fix on a branch takes 30 seconds; a typo on `main` is live to customers in 15. The asymmetry is the whole rule.
- **Exception**: the Shopify GitHub bot commits merchant admin edits directly to `main`. That's expected — don't revert those casually.
- **Branch types**: `fix/`, `feat/`, `restyle/`, `tokens/`, `refactor/`, `docs/`, `chore/`, `content/`. See the `commit` skill and `docs/setup/branching.md`.
- **Keep commits focused.** One logical change per commit — so Shopify admin auto-commits don't collide with code changes and `git revert` stays useful.
- **Use the skills.** `commit` for local commits; `pr-commit` to open a PR (auto-schedules review checks); `pr-comments` for the Greptile review loop. They enforce the above rules and the project conventions.

## Upstream Dawn merges
- `upstream` remote → `https://github.com/Shopify/dawn.git`
- Periodically `git fetch upstream && git merge upstream/main`; expect conflicts in anything we've restyled
- After merging, run `shopify theme check` and smoke-test at `127.0.0.1:9292`

## Project Info
- Stack: Shopify Dawn theme (Liquid + OS 2.0 JSON templates + CSS + vanilla JS)
- Local dev: `shopify theme dev --store=sick-rabbit-store.myshopify.com` → `127.0.0.1:9292`
- Current branch: main
- Main branch: main
- Store: `sick-rabbit-store.myshopify.com`
- Live domain (Phase 5): `sickrabbit.com`
- Key docs: `docs/architecture.md`, `docs/components.md`, `docs/design/system.md`, `docs/decisions.md`, `planning/roadmap.md`

## Kiro Vault (Companion Knowledge Base)

This project has a companion folder in the Kiro Obsidian vault.
The vault path is defined in the user's global `~/.claude/CLAUDE.md`. Read it from there, then find project docs at `Projects/Sick Rabbit/`. Website-specific docs are under `Projects/Sick Rabbit/Documentation/Website/` — start with `CONTEXT.md` and `Development/Shopify Build Plan.md`.

When the user says "reference Kiro", "check Kiro", or mentions project docs,
strategy, planning, or research context — read files from that folder. Start with:
- `Projects/Sick Rabbit/Documentation/Website/CONTEXT.md` — website tech context and folder map
- `Projects/Sick Rabbit/Sick Rabbit.md` — the brand's substance: what it is, its goals, its current state
- `Projects/Sick Rabbit/Documentation/Website/Development/Shopify Build Plan.md` — the phased build plan

Kiro is NOT a code project. It is a personal knowledge vault containing strategy docs,
task files, research, competitive analysis, and planning for all of the user's projects.
Do not search or modify files outside this project's folder in the vault.
