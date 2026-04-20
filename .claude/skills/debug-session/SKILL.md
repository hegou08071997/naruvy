---
name: debug-session
description: Run a structured debugging session on the Sick Rabbit Shopify theme — triaging and working through multiple bugs in one sitting. Use this skill when the user wants to "debug", "fix things", "work through a list of issues", enter "debug mode", says "let's debug", or has multiple storefront problems to triage at once ("the PDP is broken AND the cart flickers AND the header nav disappears on mobile"). Also use when the user pastes in a batch of bug reports, returns from QA with a list, or shares Greptile findings they want to work through systematically. Not for single isolated fixes — those can go straight through the issue skill. This skill is the "sit down and work through everything that's wrong" workflow.
---

# Debug Session

A structured workflow for working through multiple storefront bugs in one sitting. List first, fix one at a time, verify each one before moving on, record as you go.

The core principle: a debug session on a live-deploying Shopify theme goes sideways fast if you skip the triage step. Fixing one thing can mask another, and chasing a "bug" that turns out to be a merchant admin setting wastes an hour. Get the full picture first.

## Before touching any code

### 0. Check the branch

```bash
git branch --show-current
```

If it's `main`, stop. Tell the user:

> You're on `main`, which auto-deploys to the live Shopify theme. Debug fixes need a branch so Greptile can review them before they ship:
>
> ```
> git checkout -b fix/debug-YYYY-MM-DD
> ```

Don't start triaging on `main` — the session will want to commit fixes eventually, and the `commit` skill will refuse anyway.

### 1. Read the existing issues

Read `planning/issues.md` and note everything in Open. Present to the user:

> You have 3 open issues. Want to work through these, start with new ones you're seeing now, or mix?

### 2. Collect new issues

Ask for everything that's wrong before writing a single fix. For each new issue, use the `issue` skill to log it in `planning/issues.md` (ID, severity, Where, Steps). Log them all before investigating.

On a Shopify theme, "Steps" needs more than usual:

- **Page / URL** — homepage, PDP for which product, collection X, checkout
- **Device and viewport** — mobile Safari 414px, desktop Chrome 1440px, etc.
- **Variant / customer state** — logged-in vs. guest, which variant selected, empty cart vs. populated, currency
- **Live vs. theme editor vs. local dev** — the three render slightly differently; bugs that only appear in the theme editor often aren't bugs

### 3. Triage: is this actually a code bug?

Before code-chasing, check the common "not a bug" paths. A couple of minutes here saves long investigations:

- **Merchant admin setting** — section hidden, block removed, setting misconfigured via the theme editor. Ask the user to check Online Store → Themes → Customize for the affected page. If the misconfiguration is in `config/settings_data.json`, it came from admin and should be resolved there, not in code.
- **Product data** — missing image, wrong price/tax, variant not in stock, inventory tracking off. Check the product in the Shopify admin.
- **Shopify platform issue** — [shopifystatus.com](https://www.shopifystatus.com/). If something store-wide just broke in the last hour and you changed nothing, check there first.
- **App block interference** — a third-party app can inject a block into a section. If a bug appears only where an app block sits, start there.
- **Browser cache / CDN** — a hard refresh sometimes fixes what isn't broken. Don't waste a session if the user hasn't refreshed.
- **Merchant auto-commit** — `git log` might show a recent commit from the Shopify bot changing `settings_data.json` or a JSON template; that can explain sudden behaviour changes.

If one of these is the cause, say so, close out the "issue" without a code fix, and move on.

### 4. Prioritise and decide the branching strategy

Once everything real is logged, suggest an order:

- **Severity first**: High → Medium → Low
- **Within severity, broken-before-polish**: a shopper-visible Liquid error before a rogue 2px margin
- **Dependencies**: if fix A likely affects the area fix B is in, do A first

Then decide *where* fixes will land:

- **Single quick fix, confident in it** — fix directly on `main`. Remember: `main` deploys live.
- **Multi-fix session, or anything non-trivial** — cut a branch `fix/debug-YYYY-MM-DD` or similar. Let Greptile review before merging. For this project, branches-to-PR is the default for anything beyond a one-line fix.

Confirm the order and branching with the user before investigating.

## Working through issues

Work sequentially, one issue at a time.

### For each issue

1. **Reproduce first.** Get `shopify theme dev --store=sick-rabbit-store.myshopify.com` running and reproduce the bug at `127.0.0.1:9292` on the same page/device/variant/state the user reported. If you can't reproduce, say so before investigating — a bug that doesn't reproduce needs more info, not more code reading.

2. **Investigate.** Read the relevant section/snippet/template. Trace through the Liquid execution. For JS bugs, open browser devtools; for layout bugs, use the element inspector with the live dev server. Find the actual root cause, don't guess and patch.

3. **Fix.** Keep the fix minimal. A debug session is about fixing, not improving. If you notice *other* things that should change while you're in the file, mention them — don't silently refactor. Prefer additive changes over restructuring Dawn's originals (see `CLAUDE.md`), so `upstream/main` merges stay tractable.

4. **Re-check in the browser.** The Shopify Liquid VS Code extension catches syntax issues live, but runtime behaviour only shows up when you view the page. Check the specific scenario the user reported (right page, right variant, right viewport, right logged-in state). For visual/layout bugs, eyeball on the actual breakpoint, not just by reading CSS.

5. **Record.** Update the issue in `planning/issues.md` immediately:
   - Set `Fixed:` to today's date
   - Write a clear `Fix:` sentence — root cause and what changed
   - Leave `Commit:` empty for now (fill in after the commit lands)

6. **Have the user verify.** Not fixed until the user says so. If the fix doesn't hold up, go back to step 2 — don't move on.

7. **Move the entry** from Open to Fixed.

### If a fix is too complex or blocked

Mark it `**Severity:** deferred` and add a note in Steps: what's known so far, what's blocking, what to try next. Deferred issues are useful context for the next session. Don't burn a whole session stuck on one when others are waiting.

### If you notice something unreported

Mention it to the user. They decide whether to log it as a new issue or ignore it. Silently fixing unreported problems creates invisible diffs that are hard to trace when something regresses.

## Closing the session

When the list is worked through:

1. **Summarise in chat:**
   ```
   ## Session Summary
   - ISS-004: Fixed (cart drawer closed on variant change — stale event listener)
   - ISS-005: Fixed (header nav disappeared on mobile — missing `display: flex` at 414px)
   - ISS-006: Deferred (PDP price flicker — needs variant JS deep-dive)
   - ISS-007: New — logged during session (footer newsletter input has hardcoded hex)
   ```

2. **Commit.** Use the `commit` skill. One logical change per commit — group fixes only if they genuinely belong to one change. Reference issue IDs in messages so `git log | grep ISS-` stays useful:
   ```
   fix: stop cart drawer closing on variant change (ISS-004)
   ```

3. **Fill the `Commit:` field** on each fixed issue with the actual hash after the commit lands (`git log -1 --format=%h`).

4. **If you branched** — push the branch, let Greptile review, and merge to `main` once green. Merging to `main` deploys live.

5. **Update `docs/components.md`** if any snippet or section was added, renamed, or significantly changed during fixes.

## Rules

- **List first, fix second** — get everything logged before writing any fix
- **Triage for not-a-code-bug first** — admin config, product data, platform status, app blocks
- **Reproduce before investigating** — if you can't reproduce, gather more info; don't read code blindly
- **One at a time** — sequential, not batched; debugging-while-context-switching misses things
- **Minimal fixes** — don't refactor during debug; log improvements separately
- **Verify in the browser on the right scenario** — the user's device/page/variant, not a guess
- **User confirms** — not fixed until they say so
- **Record immediately** — update the tracker after each fix, not at the end
- **Don't silently fix unreported things** — mention, let the user decide
- **Deferred is OK** — better than burning the session on one stubborn bug
- **Remember `main` deploys live** — branch for anything non-trivial
