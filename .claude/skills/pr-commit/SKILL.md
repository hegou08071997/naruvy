---
name: pr-commit
description: Open a pull request for the Sick Rabbit theme — analyses the branch, updates planning docs, commits doc changes, pushes, and creates the PR with a title/body that matches the project's conventions. Also schedules an automatic Greptile review check. Use this skill whenever the user says "create a PR", "open a PR", "make a PR", "push and PR", "ready for review", "send this up", "ship this branch", "let's get this reviewed", "submit for review", "PR this", or has finished a block of work on a feature/fix/restyle branch and wants to get it reviewed. Also trigger on "we're done with this branch", "that's everything", or "let's push this up". Not for committing uncommitted work — that's the commit skill. Not for responding to review feedback on an existing PR — that's the pr-comments skill. This skill creates the PR; pr-comments closes the loop.
---

# PR Commit

Opens a PR with the right title, body, and doc updates baked in, then hands off to Greptile's review loop. The goal: doc maintenance (roadmap, issues, components) happens as part of PR creation, not as a separate step that gets forgotten.

Every PR merged to `main` auto-deploys to the live Shopify theme. The review gate is load-bearing — this skill treats PR creation as a checkpoint, not a formality.

## Workflow

### 1. Validate preconditions

```bash
git branch --show-current
git status
git log main..HEAD --oneline
```

- **On main?** Stop: *"You're on main — create a feature branch first with `git checkout -b <type>/<short-description>`."*
- **Uncommitted changes?** Stop: *"You have uncommitted changes. Use the `commit` skill first, then we can open the PR."*
- **No commits ahead of main?** Stop: *"No commits ahead of main — nothing to PR."*

### 2. Analyse the branch

```bash
git log main..HEAD --oneline
git log main..HEAD --format="%s%n%b"
git diff main --stat
git diff main --name-only
```

Also check whether `main` has advanced since the branch was cut (merchant auto-commits or other merged PRs can land on `main` while you're working):

```bash
git fetch origin
git rev-list --count HEAD..origin/main
```

If the count is non-zero, warn the user:

> `main` is N commits ahead of this branch. Consider rebasing before opening the PR so the review is against a current base:
>
> ```
> git fetch origin
> git rebase origin/main
> ```
>
> Continue anyway? (The PR will still work, but conflicts may need resolution during merge.)

This is a soft warning, not a block — sometimes the user knowingly wants to open the PR against the branch-point state.

From this, build an understanding of:

- **Feature/fix/restyle nature** — from commit messages and their types (`feat:`, `fix:`, `restyle:`, `tokens:`, `refactor:`, `docs:`, `chore:`, `content:`)
- **Which section/snippet/template files changed** (`sections/**`, `snippets/**`, `templates/**`, `layout/**`)
- **Which assets changed** (`assets/**/*.css`, `assets/**/*.js`)
- **Which config/locale files changed** (`config/settings_*.json`, `locales/*.json`)
- **Which issue IDs appear** in commit messages (pattern: `ISS-\d+`)
- **Whether Dawn originals were touched** (Dawn files being edited needs a decision log entry — flag if missing)

### 3. Determine which docs need updating

Use cheap checks first — don't read a file you don't need to touch.

#### `planning/issues.md`

**Cheap check:** Parse all commit messages for `ISS-\d+`.
**Update if:** Any issue IDs found. Read the file, find those IDs in Open, move to Fixed with:
- `**Fixed:** <today's date>`
- `**Fix:** <one-line description derived from the commit message>`
- `**Commit:** <short hash>`

#### `planning/roadmap.md`

**Cheap check:** Always read — it's short and the skill needs to know the current phase.
**Update if:** The branch completes or advances roadmap items:
- An "In Progress" item finished → move to Shipped with today's date
- A "Next" item started → move to In Progress
- Mark completed sub-items `[x]` (Phase 3 section-by-section checklist especially)
- If nothing matches, don't touch it

#### `planning/ideas.md`

**Cheap check:** Only check if roadmap moved something to Shipped.
**Update if:** A shipped item matches an idea — remove it, it graduated.

#### `docs/components.md`

**Cheap check:** Did any `snippets/*.liquid` or `sections/*.liquid` files get added, renamed, or materially modified?

```bash
git diff main --name-status -- snippets/ sections/
```

The `--name-status` flag surfaces adds (`A`), deletes (`D`), modifies (`M`), and renames (`R100` etc.) distinctly. Handle each differently:

- **Add (`A`)** — new snippet/section, add a row to the registry
- **Delete (`D`)** — remove the row (unless it's being replaced by an Add, in which case it's a rename)
- **Rename (`R`)** — git reports this as `R<score>` with the old and new paths; update the existing row's path, don't add a new row
- **Modify (`M`)** — only touch the registry if the purpose or rendered-by changed materially; cosmetic edits don't need a registry bump

**Update if:** Yes — add, update, or remove rows in the custom snippets/sections tables. Keep it minimal: name, path, purpose, where rendered.

#### `docs/design/system.md`

**Cheap check:** Did `assets/base.css` or `config/settings_data.json` change?
**Update if:** A new CSS custom property was added that isn't already in the system doc, or a colour scheme was changed materially.

#### `docs/decisions.md`

**Cheap check:** Did any Dawn-originating file get renamed, moved, or deleted? (Check against Dawn upstream — `git log upstream/main -- <path>` existing means it's Dawn's.)

**Update if:** Yes — and if no corresponding entry exists in `decisions.md`, **stop and offer to draft one with the user** before continuing. Destructive edits to Dawn need a logged decision; silently merging them violates the upstream-merge policy.

The prompt flow:

> This branch modifies or deletes Dawn-originating files: `<paths>`. Per the upstream-merge policy, destructive Dawn edits need a logged decision in `docs/decisions.md`. Want me to draft an entry now? I'll ask:
>
> - What was decided (what changes and why this shape)
> - Why (what problem it solves, what constraint forces this over an additive alternative)
> - What was rejected (the additive alternative considered and why it didn't work)
>
> Then I'll write it to `docs/decisions.md` and include it in the `docs:` commit. Otherwise I'll stop here and you can add the entry manually.

If the user says yes, interview briefly and write the entry using the existing `decisions.md` format (see existing entries for reference). If no, stop — don't create the PR without the decision logged.

### 4. Update the docs

For each doc that needs updating:
1. Read the current file
2. Make surgical, minimal changes — don't rewrite sections unrelated to the branch
3. Show the user what was updated:

```
Updated planning docs:
  - planning/roadmap.md — moved Phase 3 header to Shipped
  - planning/issues.md — moved ISS-004 to Fixed
  - docs/components.md — added sick-rabbit-header-nav snippet
```

This is informational, not a gate. Proceed.

### 5. Commit the doc updates

If any docs changed, commit them separately with `docs:` prefix so doc housekeeping doesn't pollute the feature diff.

```bash
git add planning/roadmap.md planning/issues.md docs/components.md
git commit -m "$(cat <<'EOF'
docs: update planning docs for PR

Co-Authored-By: Claude Opus <VERSION> (1M context) <noreply@anthropic.com>
EOF
)"
```

Replace `<VERSION>` with the actual model version running the session (e.g. `4.7`). Only stage files that were actually modified — never `git add -A`.

If no docs needed updating, skip this step. Don't create an empty commit.

### 6. Run theme-check as a branch-level gate

```bash
shopify theme check
```

The `commit` skill runs this per-commit, but a branch-as-a-whole gate catches the case where two commits compose into a broken state (one adds a CSS variable, another removes it; one renames a snippet, another still `{% render %}`s the old name). The VS Code extension's live diagnostics usually surface these during development — this is the pre-push belt-and-braces version.

If any new errors appear (not warnings), stop and tell the user. Don't push a broken branch up for review.

### 7. Push and create PR

#### Check for existing PR

```bash
gh pr view --json number,url,state 2>/dev/null
```

If a PR already exists and is `OPEN`, report: *"PR #N already exists: <url>. Use the `pr-comments` skill to check for review feedback."* Stop here.

If the PR exists but is `CLOSED` or `MERGED`, note it and proceed — the user is clearly starting a new PR on the same branch name (rare but valid).

#### Push the branch

```bash
git push -u origin <branch-name>
```

If the branch already tracks a remote, just `git push`.

#### Derive the PR title

Parse the branch name prefix for the type and humanise the description:

| Branch | Title |
|---|---|
| `fix/cart-drawer-variant-reset` | `fix: cart drawer resets on variant change` |
| `feat/anachronism-collection-template` | `feat: anachronism collection template` |
| `restyle/header-nav` | `restyle: header nav to match brand type scale` |
| `tokens/burnt-rose-primary-cta` | `tokens: wire burnt rose as primary CTA colour` |
| `refactor/extract-product-card-media` | `refactor: extract product-card media into snippet` |
| `docs/decisions-phase-3-pdp` | `docs: log phase 3 PDP design decisions` |
| `content/en-default-cart-empty` | `content: update cart empty-state copy` |

For `content/*` branches, add a dedicated test-plan bullet: *"Verify the affected copy renders correctly on the page(s) where the translation key is used — check both desktop and mobile to catch any truncation or layout overflow."*

Keep under 70 characters. Details go in the body.

#### Structure the PR body

```markdown
## Summary

<1–2 sentence overview of what the branch accomplishes>

- **Change/fix name** (ISS-NNN if applicable): one-line description
- **Change/fix name**: one-line description
- ...

## What changed in the theme

- Sections: `sections/foo.liquid`, `sections/bar.liquid`
- Snippets: `snippets/baz.liquid`
- CSS: `assets/section-foo.css`
- Config/locale: `config/settings_data.json`, `locales/en.default.json`

(Only include the bullets that actually apply — drop ones that don't.)

## Test plan

- [ ] Visit `127.0.0.1:9292` (or the preview theme) and confirm the affected page renders correctly on desktop
- [ ] Re-check at 414px mobile viewport
- [ ] If the change involves a section: verify the schema still works in the theme editor (no merchant-editing regressions)
- [ ] `shopify theme check` passes clean
- [ ] Any issue IDs referenced (ISS-NNN) are fixed

## Upstream / Dawn notes

(If any Dawn-originating files were edited: link to the `docs/decisions.md` entry that authorised it. Otherwise: "Additive changes only — no Dawn files renamed or removed.")

🤖 Generated with [Claude Code](https://claude.com/claude-code)
```

Summary bullets are derived from commit messages grouped by feature, not one-per-commit. Test plan items are user-facing verification steps for a theme — page loads, visual checks, theme editor, `theme check`. Not abstract unit-test things.

The **Upstream / Dawn notes** section is specific to this project — it forces the PR author (and reviewer) to acknowledge the upstream-merge implication of any Dawn-file edits.

#### Create the PR

```bash
gh pr create --title "<title>" --body "$(cat <<'EOF'
<body>
EOF
)"
```

### 8. Report

```
Created PR #N: restyle: header nav to match brand type scale
https://github.com/redpotatoe07/sickrabbit-theme/pull/N

Doc updates: planning/roadmap.md, docs/components.md
Scheduled Greptile review check every 8 minutes — pr-comments will pick up feedback automatically.
```

### 9. Schedule the review check

After creating the PR, schedule `/pr-comments` to run every 8 minutes so Greptile's review gets picked up without you having to remember. Use CronCreate:

```
CronCreate:
  cron: "*/8 * * * *"
  prompt: "/pr-comments"
  recurring: true
```

Before creating, **check with CronList** — only one pr-comments cron at a time; don't stack duplicates if one is already running from an earlier PR.

Tell the user: *"Scheduled review check every 8 minutes. Review comments will be picked up and resolved automatically via the pr-comments skill."*

The pr-comments skill handles the rest of the loop: fetch comments, resolve them, commit, push, re-check until clean, then offer to merge (which ships live).

## Edge cases

- **No docs need updating** — skip the doc commit, still push and create the PR. Common for pure refactors or content-only changes.
- **PR already exists** — report the URL and stop. The user probably wants `pr-comments`.
- **Uncommitted changes** — don't proceed. Redirect to the `commit` skill.
- **No commits ahead of main** — nothing to PR. Stop.
- **Branch has only doc commits** — still valid. The PR is a doc-only PR; analyse accordingly.
- **Dawn files edited without `docs/decisions.md` entry** — stop and ask the user. This is the load-bearing check that keeps upstream merges tractable.
- **Merge conflicts** — this skill does not handle rebasing. Suggest the user rebase or merge `main` in first.
- **User is on an old-style branch name** (no type prefix) — derive the best type from the commit-message analysis and ask before using it.

## Interaction with other skills

- **`commit`** — pr-commit follows the same commit message conventions (prefix types, co-author line, specific file staging) but writes the `docs:` commit inline rather than invoking the skill.
- **`issue`** — pr-commit moves `ISS-NNN` entries from Open to Fixed using the same format.
- **`plan`** — pr-commit updates `roadmap.md` and `ideas.md` using the same format.
- **`pr-comments`** — the natural follow-up. Scheduled automatically at step 8. Handles review feedback end-to-end.
- **`audit`** — if a big chunk of work just shipped (a phase, a major restyle), the user may want to run an audit before or after the PR. This skill doesn't automate that — but mention it if the branch is phase-sized.
