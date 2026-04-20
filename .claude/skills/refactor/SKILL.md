---
name: refactor
description: Extract repeated Liquid, CSS, or design-token patterns into shared snippets, sections, or token layers in the Sick Rabbit Shopify theme. Use this skill when the user says "refactor", "deduplicate", "DRY this up", "clean up", "extract", "this is copy-pasted everywhere", "turn this into a snippet/section", "move this to a token", or has just finished a restyle and wants to pull shared patterns out. Also trigger when an audit has flagged duplication across sections/snippets, or when a hardcoded value is showing up in 2+ places and should move into the token system. Not for fixing bugs (that's debug-session), not for adding new features (that's just building), and not for destructively rewriting Dawn's originals — refactor here means additive extraction that respects the upstream-merge path.
---

# Refactor

The #1 source of inconsistency in a restyled Dawn theme is the same Liquid fragment, CSS declaration, or hardcoded value copy-pasted across sections and snippets. Each duplicate is a place where a future change gets applied once and missed elsewhere. This skill is the disciplined process for pulling the shared thing out.

## What "refactor" means on this project

A refactor here is **additive extraction** that doesn't change rendered output. Three shapes:

1. **Liquid duplication → a new snippet.** A block of markup rendered in two or more places gets pulled into `snippets/` and replaced with `{% render 'name' %}` calls.
2. **CSS duplication → a shared token or utility.** A hardcoded value (colour, spacing, radius, font-family) showing up in multiple files gets promoted to `assets/base.css` as a CSS custom property, and registered in `docs/design/system.md`.
3. **Settings duplication → a new section.** When the same "configurable block" keeps getting inlined into sections with its own settings, it wants to become its own section (with schema) or a block within an existing section.

Three shapes it **isn't**:

- **Not** restructuring Dawn's original files. Dawn is `upstream`; rewriting Dawn's sections into a "tidier" structure creates permanent merge conflicts. Additive refactor (new snippet, new token, new utility class) is fine. Deleting or renaming a Dawn file is a decision that needs `docs/decisions.md`.
- **Not** a behaviour change. If you're mid-refactor and notice a bug, log it with the `issue` skill and keep going — don't mix a fix into the refactor commit.
- **Not** premature abstraction. Two similar blocks of Liquid can stay duplicated. Three-line repetitions don't justify a snippet. Extract when the duplication is *substantial* (10+ lines, or real complexity like a product card, a labelled input, a bevel-button wrapper).

## Before changing anything

0. **Check the branch.** `git branch --show-current`. If it's `main`, stop — create a `refactor/<desc>` branch first. Refactors go through PR review before hitting `main` like every other change, because `main` is live.
1. **Read `docs/components.md`.** The thing you're about to extract may already exist as a snippet.
2. **Scan `snippets/` and `sections/`.** A Dawn snippet may cover the need with a parameter you hadn't considered.
3. **Confirm real duplication.** At least two actual consumers. Hypothetical future duplication isn't duplication yet.
4. **Check the registry rule**: if the pattern you're extracting doesn't fit a clean name, you probably haven't found the right abstraction yet. Name first, extract second — if the name is forced, the extraction will be too.

## The three extraction shapes

### Shape A — Liquid fragment to snippet

When a chunk of markup renders in 2+ places (e.g. a product card, a labelled form field, a collection tile).

1. **Find every instance.** Search for distinctive markers — a class name, an `{% assign %}`, a settings key. Document every location. A missed instance is worse than no refactor — the old pattern survives in parallel.
2. **Separate identical from varying.**
   - What's the same in every instance → lives in the snippet.
   - What differs → becomes parameters passed via `{% render 'name', key: value %}`.
   - What's unique to one consumer → stays in the consumer.
3. **Keep the parameter list minimal.** Only parameterise variations that exist now, not imagined future ones. Two parameters is usually fine; six is a smell.
4. **Create `snippets/<name>.liquid`.** Kebab-case filename. Use `{% doc %}` / `{% enddoc %}` at the top to document the expected parameters (Shopify's LiquidDoc, supported by the VS Code extension). Use tokens from `docs/design/system.md` for any visual values.
5. **Replace all call sites.** Always `{% render %}`, never the deprecated `{% include %}`. After each replacement, diff the rendered HTML (view the page at `127.0.0.1:9292` and inspect) to make sure output is identical.
6. **Remove the old inline code** and any imports/variables that became unused.
7. **Add to `docs/components.md`.** Name, path, parameters, where it's rendered, one-line purpose.

### Shape B — Hardcoded value to token

When a hex/rgb/spacing/radius value appears in 2+ files.

1. **Find every instance.** Grep the exact value across `assets/`, `sections/`, `snippets/`, `layout/`. Include Liquid inline `style=""` attributes.
2. **Name the token.** Semantic (`--color-surface-elevated`) beats literal (`--color-1c4d4f`). The name should survive the brand palette drifting slightly.
3. **Add to `assets/base.css`** as a CSS custom property, grouped with related tokens.
4. **Document in `docs/design/system.md`** — add a row to the relevant table so future sessions can find it.
5. **Replace every call site** with `var(--token-name)`. After each replacement, eyeball the page at `127.0.0.1:9292` — a token swap should be pixel-identical.
6. **Run `shopify theme check`** — catches orphaned references or typos.

### Shape C — Inlined configurable block to section or block

When the same "a merchant can configure this" pattern keeps appearing inside other sections (e.g. an image-with-caption block that three different sections each reimplement).

This is the biggest-blast-radius refactor. Only do it when the duplication is clear and the new section/block has obvious merchant value.

1. **Audit the current usage.** What settings does each inlined version expose? What's actually different between them vs. cosmetically different?
2. **Decide: standalone section or block-within-section?**
   - Standalone section: merchant can drop it anywhere in any template.
   - Block: merchant adds it as a child of a parent section.
   - If the thing only ever lives inside one kind of parent, it's a block. If it's independent, it's a section.
3. **Write the schema first.** Define settings, blocks, presets. Keep setting IDs stable — if merchants have saved values against the old inlined versions, renaming an ID loses their data.
4. **Implement the Liquid.** Use tokens, follow the standard section pattern in `docs/architecture.md`.
5. **Migrate the old inlined versions.** For each consumer, remove the inlined block and either (a) tell the merchant to re-add it from the theme editor, or (b) rewrite the relevant `templates/*.json` to include the new section with matching settings. Merchant state is at risk here — confirm with the user before touching production-facing templates.
6. **Add to `docs/components.md`** with schema summary.

## The non-negotiables

- **Behaviour stays identical.** A refactor produces the same rendered output as before — same HTML, same CSS, same behaviour. If `git diff` on the rendered page shows unexpected changes, you haven't refactored, you've rewritten.
- **One extraction per commit.** Extract the thing, replace every call site, verify, commit with `refactor:` prefix. Start the next extraction on a fresh working tree.
- **Don't break consumers.** If an existing snippet already has call sites, don't change its parameter signature without migrating every call site in the same commit. Silent interface drift = silent breakage.
- **Don't rename merchant-visible setting IDs.** Those IDs are the key to the merchant's saved values in `config/settings_data.json` (and on the live store). Renaming a setting ID is a data-loss event for that setting, not a refactor.
- **Respect Dawn.** Additive snippets, additive tokens, additive utilities are fine. Restructuring Dawn's files is a decision, not a refactor. If you must, log it in `docs/decisions.md` and prepare for merge conflicts.
- **Don't over-extract.** Three similar lines of Liquid can stay. The right amount of abstraction is the minimum that eliminates meaningful duplication — fewer parameters, smaller snippets, narrower tokens.

## Verify before commit

- **`shopify theme check`** — passes clean (the VS Code extension catches most of this live, terminal run is the pre-push gate)
- **`127.0.0.1:9292`** — visit every page where the refactor landed, at mobile + desktop breakpoints, and confirm visually identical output
- **`git diff --stat`** — the diff should be mostly deletions from call sites plus one new file. If it's sprawling, you're doing too many things in one commit.
- **`docs/components.md`** — updated if a snippet was added or renamed
- **`docs/design/system.md`** — updated if a token was added or renamed

## Commit with `refactor:` prefix

Use the `commit` skill. The `refactor:` type exists specifically so refactor commits don't get mixed up with `fix:` or `feat:` in `git log`. Reference the extracted thing in the subject:

```
refactor: extract product-card media into shared snippet
refactor: promote repeated --color-#1c4d4f usages to --color-surface-elevated token
refactor: consolidate image-with-caption block into reusable section
```

## When to say no

- **"Let's refactor this into a utility for later reuse"** — no. Extract when there's real duplication, not speculative reuse.
- **"While I'm in here, let me also fix this bug"** — no. Log the bug with the `issue` skill, finish the refactor, then fix the bug as a separate commit.
- **"Let me also rename this to something tidier"** — unless the new name is meaningfully better, no. Pure rename commits are their own thing, not a refactor.
- **"This Dawn file is messy, let me restructure it"** — no. Dawn is upstream. If there's a genuine problem, discuss and log in `docs/decisions.md` before touching it.
