# Branching discipline

`main` on this repo is connected to the **live Shopify theme** via the GitHub integration. Every commit that lands on `main` deploys to `sick-rabbit-store.myshopify.com` (and, post-launch, `sickrabbit.com`) within seconds. There is no staging, no CI gate, no build step — `main` is production.

That reality drives every workflow rule below.

## The rule

**All code work happens on a branch. Branches merge to `main` via a PR that has passed Greptile review. No exceptions for "small fixes".**

A typo takes 30 seconds on a branch and merges in 2 minutes. A typo committed directly to `main` deploys to customers in 15 seconds. The asymmetry is the whole reason for the rule.

## The layered gate

Three layers, weakest to strongest:

### 1. Skill-level (Claude Code)

Every skill that writes git state (`commit`, `pr-commit`, `pr-comments`, `debug-session`, `refactor`) checks the current branch first and refuses to proceed on `main`. This catches most cases because most work is routed through a skill.

### 2. Git hook (client-side)

The `.githooks/pre-commit` script refuses commits to `main` at the git level. This catches the cases where someone uses raw `git` commands outside a skill. Configured once per machine:

```bash
git config core.hooksPath .githooks
```

Verify by checking out `main`, trying to commit, and seeing the refusal.

The hook is committed to the repo (under `.githooks/`, not `.git/hooks/`), so every clone gets the same protection — but each machine still has to enable it once.

**Emergency override**: `git commit --no-verify`. Use only when there's a genuine reason (e.g. a hook itself is broken). Ask yourself twice whether it's truly an emergency.

### 3. GitHub branch protection (remote-side)

The strongest gate. Configured once in GitHub → Settings → Branches → Branch protection rules → `main`.

Required settings:

- **Require a pull request before merging** — on
  - **Require approvals** — at least 1 (Greptile's approval counts once configured, or yours on self-review)
  - **Dismiss stale pull request approvals when new commits are pushed** — on (so approvals don't carry forward after unreviewed changes)
- **Require status checks to pass before merging** — on (once CI exists — the GitHub Actions workflow from Dawn's upstream runs theme-check)
- **Require linear history** — on (keeps `main` clean; pairs with squash-merge in the pr-comments skill)
- **Do not allow bypassing the above settings** — on for everyone except the Shopify GitHub bot (see next section)

### Important: the Shopify GitHub bot exemption

Shopify's GitHub integration commits merchant admin edits (section settings, theme customiser changes) directly to the connected branch — which is `main`. That's how two-way sync works. Branch protection will block the Shopify bot's pushes by default.

**Add the Shopify GitHub app as a bypass actor** under "Who can bypass these restrictions". Otherwise merchant admin edits will fail silently and the admin ↔ repo sync will break.

If you can't figure out the exact bot identity in GitHub's UI, the simplest alternative is:

1. Temporarily let the Shopify integration push → note which user/app appears as the commit author
2. Add that actor to the bypass list
3. Test: edit a section in Shopify admin → confirm it lands on `main`

## What goes where

| Work type | Where it happens | How it reaches `main` |
|---|---|---|
| Feature, fix, restyle, refactor, docs | feature branch | PR → Greptile review → squash-merge |
| Token changes | `tokens/*` branch | PR → review → merge |
| Content / locale tweaks | `content/*` branch | PR → review → merge |
| Dawn upstream merge | `chore/upstream-merge-YYYY-MM-DD` branch | PR → review → merge (expect conflicts in styled areas) |
| Merchant admin edit | Shopify admin → bot commits directly to `main` | Bypass (legit, intentional) |
| Hot-fix genuine production emergency | `fix/urgent-description` branch | PR → fast review → merge (same flow; the branch cost is negligible) |

There is no case where a human types `git commit` on `main` and means it.

## Branch naming

From the `commit` skill:

- `fix/<desc>` — bug fixes
- `feat/<desc>` — new features
- `restyle/<section>` — Phase 3 visual restyle
- `tokens/<desc>` — design token / theme settings changes
- `refactor/<desc>` — additive structural changes
- `docs/<desc>` — documentation only
- `chore/<desc>` — tooling, config, deps, upstream merges
- `content/<desc>` — locale / translation / copy-only changes

## Recovery: "I accidentally committed to main locally"

The pre-commit hook should have caught it, but if it didn't (disabled hooks, `--no-verify`, whatever):

1. **Don't push.** If you haven't pushed, nothing is live.
2. Rewind local main to origin:
   ```bash
   git log --oneline -n 5            # confirm the accidental commit is on top
   git reset --soft origin/main      # unstage the commit but keep the changes
   git checkout -b <type>/<desc>     # move onto a branch
   git commit -m "<proper message>"  # commit on the branch instead
   ```
3. Continue as normal — `pr-commit` skill from here.

If you already pushed to `main`, Shopify has already deployed it. At that point you have two options: revert the commit (`git revert <sha>` on a new branch, PR, merge → deploys the revert) or roll forward with a fix on a new branch. Don't force-push to undo — it breaks history for everyone and Shopify's sync can get confused.

## When can I touch `main` directly?

Never, with one exception: `git pull` after a merge, to sync your local checkout. That's not a commit, it's a fast-forward.

If you think you have a reason to commit to `main` directly, you don't.
