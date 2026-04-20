---
name: commit
description: Stage and commit changes to the Sick Rabbit Shopify theme following project conventions. Use this skill whenever the user says "commit", "save changes", "commit this", "let's commit", wants to prepare code for a PR, or has just finished a task and needs to save their work. Also trigger when the user asks to check what's changed before committing, says "what did we change", "ready to commit", or is about to push — this skill runs the pre-commit quality checks that matter for a live Shopify theme.
---

# Commit

Every commit to `main` on this repo auto-deploys to the live Shopify theme at `sick-rabbit-store.myshopify.com` (and, post-launch, `sickrabbit.com`). There is no staging step. Treat each commit like a production push — sloppy commits go live.

This skill ensures every commit follows the same format, passes the same quality checks, and doesn't break the storefront.

## Context that shapes this skill

- **`main` auto-deploys.** Shopify's GitHub integration syncs `main` → live theme. No CI gate between commit and customers seeing it.
- **Merchant admin edits auto-commit back.** Expect commits on `main` authored by Shopify's bot when the merchant edits sections or theme settings in admin. Don't be surprised by these; don't revert them without asking.
- **Dawn is `upstream`.** Periodic `git fetch upstream && git merge upstream/main` merges Shopify's Dawn updates in. Those merge commits are expected and fine.
- **No bundler, no build step.** What you commit is what Shopify serves. Liquid, CSS, JS all ship as-is.

## Message format

```
type: concise description

Co-Authored-By: Claude Opus <VERSION> (1M context) <noreply@anthropic.com>
```

Use the actual model running the session in the co-author line (check your own system prompt — e.g. `Claude Opus 4.7 (1M context)`).

### Types

| Type | When to use | Example |
|------|-------------|---------|
| `fix` | Bug fixes | `fix: stop cart drawer from closing on variant change` |
| `feat` | New sections, snippets, merchant-visible features | `feat: add anachronism collection section` |
| `restyle` | Visual restyle of existing Dawn sections/snippets (Phase 3 work) | `restyle: header nav to match brand type scale` |
| `refactor` | Structural changes without visual or behaviour change | `refactor: extract product-card media into snippet` |
| `tokens` | Design token / theme settings changes | `tokens: wire burnt rose into primary button scheme` |
| `docs` | Documentation only (`docs/`, `planning/`, `CLAUDE.md`) | `docs: log decision to defer bespoke PDP` |
| `chore` | Tooling, config, deps, `.greptile/` changes | `chore: tighten theme-check rules for schema blocks` |
| `content` | Locale / translation / copy-only changes | `content: update en.default cart empty-state copy` |

`restyle` and `tokens` are Shopify-theme-specific additions to the usual Conventional Commits set — they make Phase 3 history grep-able.

### Style

- **Lowercase after the prefix** — `fix: resolve cart bug` not `fix: Resolve Cart Bug`
- **Imperative mood** — "add", "fix", "remove" (not "added", "fixes", "removed")
- **Under 72 characters** for the subject line
- Use the body for the "why" if the subject alone doesn't tell the full story
- Reference the section/snippet/template path when it narrows the subject usefully — e.g. `restyle(sections/header): ...`

## Branch naming

- `fix/<short-description>` — bug fixes
- `feat/<short-description>` — new features
- `restyle/<section>` — visual restyle of a specific section/snippet
- `refactor/<short-description>` — structural changes
- `tokens/<short-description>` — token or theme-setting changes
- `docs/<short-description>` — docs only
- `chore/<short-description>` — tooling

## Workflow

### 0. Refuse if on `main`

Before anything else, check the current branch:

```bash
git branch --show-current
```

If it's `main`, stop. Tell the user:

> You're on `main`, which is connected to the live Shopify theme — commits here auto-deploy. Create a branch first:
>
> ```
> git checkout -b <type>/<short-description>
> ```
>
> Types: `fix`, `feat`, `restyle`, `tokens`, `refactor`, `docs`, `chore`, `content`.

The `.githooks/pre-commit` hook also refuses this at the git level if it's enabled. This skill-level check is the earlier, friendlier version.

### 1. Review what changed

```bash
git status
git diff
```

Read through the diff. This catches accidental changes, leftover debug code, files that shouldn't be committed, and — importantly for this repo — merchant-admin auto-commits that may have landed in your working tree during a `git pull`.

### 2. Quality check

Scan the diff for these common issues before staging.

**Universal**

- **Debug code left in** — `console.log`, `debugger`, commented-out blocks with no explanation.
- **Staged secrets** — `.env`-style values, API keys, tokens, the real Greptile key in `.greptile/mcp-proxy.mjs`. Credential leaks are irreversible. (`.greptile/mcp-proxy.mjs` is gitignored — confirm it's still not staged.)
- **Orphaned imports / unused JS** — leftovers from refactoring clutter the file.
- **Files that shouldn't be tracked** — `.shopify/`, node_modules, personal editor files.

**Shopify / Liquid**

- **Hardcoded colours, hex, spacing, radii** in CSS or inline `style=""` attributes. Everything visual goes through Dawn's CSS custom properties or Sick Rabbit tokens in `assets/base.css` / `config/settings_data.json`. If a value isn't in the token system, it should be added to `docs/design/system.md` and `assets/base.css` first.
- **`{% include %}` instead of `{% render %}`.** `{% include %}` is deprecated and leaks scope — always `{% render 'name' %}`.
- **Missing `{% schema %}` on section files.** Every file in `sections/` needs a schema block with `settings` and `presets` so merchants can still edit it.
- **Hardcoded English copy.** User-facing strings should go through `{{ 'key.path' | t }}` with the text in `locales/en.default.json`.
- **Manual currency formatting.** Prices go through `| money`, `| money_with_currency`, or `| money_without_trailing_zeros` — never `£{{ price }}` or `{{ price | divided_by: 100 }}`.
- **Destructive changes to Dawn originals.** Renaming, deleting, or restructuring Dawn's files turns every future `git merge upstream/main` into a conflict festival. Prefer additive changes (new snippet/section, CSS override) where possible.
- **Stale `docs/components.md`.** If a snippet or section was added or renamed, the registry should be updated in the same commit.
- **Broken JSON.** `templates/*.json`, `config/settings_data.json`, `config/settings_schema.json`, `locales/*.json`, and any `{% schema %}` blocks must be valid JSON. A trailing comma kills the theme.

If any of these come up, fix before staging. Call it out to the user — don't silently patch it over and commit, since some of these (e.g. hardcoded hex) might represent a deliberate exception worth discussing.

### 3. Run theme check

```bash
shopify theme check
```

If the user has the [Shopify Liquid VS Code extension](https://shopify.dev/docs/storefronts/themes/tools/shopify-liquid-vscode) running, most of this is already flagged live in the editor (wavy red/yellow lines, Prettier formatting on save). Running it from the terminal is the belt-and-braces gate before pushing — it catches anything the editor missed and is the same check that'll run in CI.

Any new errors block the commit until resolved. Warnings are judgement calls — don't suppress check rules without logging it in `docs/decisions.md`.

### 4. Stage and commit

Stage specific files by name. Avoid `git add -A` or `git add .` — those sweep in unrelated changes, untracked editor files, or an accidental `.greptile/mcp-proxy.mjs` if the gitignore hasn't been respected.

```bash
git add <file1> <file2> ...
git commit -m "$(cat <<'EOF'
type: description here

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

Replace `Claude Opus 4.7` with the actual model running the session.

### 5. Verify

```bash
git status
git log --oneline -n 3
```

Confirm the commit landed, nothing unintended was left out, and the message reads correctly.

## One logical change per commit

A bug fix and an unrelated restyle are two commits. This makes `git bisect` and `git revert` work correctly — important on a live-deploying repo where "revert just the broken bit" is sometimes the fastest route back to a working store.

If the working tree has mixed changes, stage and commit them separately rather than squashing into one.

## Safety

- **Never force push to `main`** — it rewrites the deployed theme history and can trigger a confusing re-sync. If you genuinely need to rewrite history on a feature branch, confirm with the user first.
- **Never amend a commit that's already been pushed** — treat amending as a local-only tool.
- **Never skip hooks** (`--no-verify`) unless the user explicitly asks. Hooks exist because something went wrong before; bypassing them repeats the mistake.
- **Don't commit while `shopify theme dev` is running on the wrong store or wrong theme** — check `shopify theme list` if unsure.

## Shopify admin auto-commits — do not "clean up"

Commits authored by something like `Shopify <theme-kit@shopify.com>` on `config/settings_data.json` or `templates/*.json` are merchant edits flowing back from the admin. They're legitimate and must not be reverted casually. If you see one that looks wrong, ask the user before touching it.
