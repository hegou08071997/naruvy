---
name: pr-comments
description: Fetch, triage, and resolve PR review comments on the Sick Rabbit theme — then commit, push, and schedule a re-check so Greptile's next review round gets handled hands-free. Use this skill whenever the user mentions PR comments, review feedback, Greptile comments, "check the PR", "resolve comments", "what did the reviewer say", "fix the review", "address feedback", "go through the comments", "are there new comments", "what's Greptile saying", or any variation of reading and acting on PR review feedback. Also trigger right after the user has pushed a PR and wants to see if feedback has arrived, or says "let's close out this PR" / "let's merge this once it's clean". This skill runs the review loop; it pairs with pr-commit (which creates the PR). Not for creating PRs from scratch — that's pr-commit.
---

# PR Comments — Fetch, Triage, Resolve, Commit, Push, Watch

Automates the entire review-response loop on a PR: pull down every unresolved comment, make the fixes, commit, push, and **schedule a re-check** so Greptile's next round gets handled too — hands-free until the PR is clean.

Every merge to `main` deploys to the live Shopify theme, so the review gate matters. This skill is how the gate actually works.

## Default behaviour

When invoked with no arguments (`/pr-comments`), run the full workflow automatically:

1. Detect the PR for the current branch
2. Fetch all comments
3. Show the triage summary
4. Resolve all comments (P1 → P2 → P3)
5. Commit and push
6. Schedule a re-check in 8 minutes to catch Greptile's next review

No confirmation needed — the user invoked the skill because they want comments resolved. Only pause if something is genuinely ambiguous or conflicting (e.g. two comments contradict each other, or a comment is about a file that has changed significantly since the review).

If the user passes arguments (a PR number, "just P1s", "only check don't fix"), respect those.

## Workflow

### 1. Identify the PR

```bash
git branch --show-current
gh pr view --json number,title,url,headRefName,state
```

- If the current branch is `main`, the user ran this in the wrong place. Tell them: *"You're on `main`. This skill operates on a PR branch. Check out the PR branch first (`gh pr checkout <number>`) and rerun."* Stop.
- If the user gave a PR number or URL, use that.
- If `state` is `MERGED` or `CLOSED`, report *"PR #N is already merged/closed — nothing to do"* and **cancel any scheduled re-check** (CronDelete). Stop.
- If no PR exists for the current branch, tell the user and stop.

### 2. Fetch all review comments

Inline code comments:

```bash
gh api repos/{owner}/{repo}/pulls/{number}/comments --paginate \
  --jq '.[] | {id, path, original_line, line, body, diff_hunk, in_reply_to_id, created_at, user: .user.login}'
```

Top-level PR comments (not attached to a line):

```bash
gh api repos/{owner}/{repo}/issues/{number}/comments \
  --jq '.[] | {id, body: (.body | .[0:500]), user: .user.login, created_at}'
```

If the Greptile MCP is available (`greptile-api` server), also call `list_merge_request_comments` with `greptileGenerated=true` and `addressed=false` to get the structured Greptile data directly — easier than parsing HTML badges.

### 3. Filter and group

- **Skip reply threads** — comments where `in_reply_to_id` is set are replies. Group them with the parent; act on the root.
- **Group by file** — batch fixes per file.
- **Extract priority** — Greptile tags comments P1 / P2 / P3 in the body. P1 = critical, P2 = important, P3 = suggestion.
- **Extract suggestions** — look for ` ```suggestion ` blocks. These are ready-to-apply code replacements.

### 4. Show the triage summary

```
PR #2: restyle: header nav to match brand type scale
14 comments across 6 files

P1 (2):
  - sections/header.liquid:45 — hardcoded #2d2d2a instead of var(--color-graphite)
  - snippets/header-nav.liquid:12 — {% include %} should be {% render %}

P2 (4):
  - assets/section-header.css:28 — magic number 24px should use --space-3
  - sections/header.liquid:67 — English string not going through t: filter
  - ...

P3 (8):
  - ...

Resolving all...
```

This is informational, not a gate. Proceed to fixing.

### 5. Resolve comments

Work file-by-file, highest priority first.

For each file:

1. **Read the current file** — always, before editing. The comment was made against the review state; the file may have moved since.
2. **Apply suggestions directly** when the comment has a ` ```suggestion ` block, but only after verifying the suggestion still applies (if the diff hunk context no longer matches, the suggestion is stale).
3. **Reason through non-suggestion comments** — read the surrounding code, understand what the reviewer is asking for, implement the minimal change. No scope creep.
4. **Verify the edit** — re-read the changed region to confirm the fix is correct and doesn't break adjacent code.

**When to push back on a Greptile comment rather than accepting it**:

- The comment is asking for something that conflicts with a decision already logged in `docs/decisions.md` (e.g. Greptile wants to restructure a Dawn file we deliberately left alone). Reply to the comment citing the decision and mark it as not-a-fix.
- The comment is asking for something that would break merchant admin editability (e.g. removing a section's `{% schema %}` block). Reject with a reply explaining why.
- The comment is stylistic and contradicts a more important rule elsewhere (e.g. asking for a hardcoded hex "for simplicity" when the token system is the whole point). Reject with a reply.
- The comment is about Dawn's original code that we haven't touched. Reply: *"This is Dawn's original code; left deliberately per upstream-merge policy in docs/decisions.md."*

When in doubt, flag for the user rather than silently applying or silently ignoring.

### 6. Commit and push

Use the project's commit conventions (see the `commit` skill). For review responses:

- Prefix depends on what changed. Usually `fix:` (if the fix was a bug) or the matching type of the original PR (e.g. `restyle:` if the PR was a restyle and the fix is tightening a style).
- One commit for all review fixes is usually fine — these are review responses, not independent features. Exception: if the review surfaced two unrelated bugs in the same PR, split into two commits.
- Stage only the files you changed.
- Push immediately after committing — the whole point is to get the changes back up for re-review quickly.

```bash
git add <file1> <file2>
git commit -m "$(cat <<'EOF'
fix: address PR review comments

Co-Authored-By: Claude Opus <VERSION> (1M context) <noreply@anthropic.com>
EOF
)"
git push
```

Replace `<VERSION>` with the actual model version.

### 7. Report

```
Committed and pushed abc1234: fix: address PR review comments

Resolved 11/14 comments:
  - sections/header.liquid — replaced hardcoded hex with --color-graphite (P1)
  - snippets/header-nav.liquid — {% include %} → {% render %} (P1)
  - assets/section-header.css — 24px → var(--space-3) (P2)
  - ...

Flagged 3 comments for your review:
  - sections/header.liquid:92 — Greptile wants to restructure this block, but it's Dawn's original. Replied on the thread citing docs/decisions.md.
  - ...
```

### 8. Schedule the automatic re-check

Use CronCreate to fire `/pr-comments` every 8 minutes:

```
CronCreate:
  cron: "*/8 * * * *"
  prompt: "/pr-comments"
  recurring: true
```

Before creating: **check with CronList**. Only one `/pr-comments` cron at a time per session. If one already exists, leave it.

Tell the user: *"Scheduled re-check every 8 minutes. I'll pick up Greptile's next review automatically."*

**Connectivity precheck** — before scheduling, verify Greptile actually sees the PR. If the Greptile MCP is available:

```
mcp__greptile-api__list_code_reviews(prNumber, repository)
```

If it returns "merge request not found" or zero code reviews, Greptile isn't seeing the PR. Do **not** schedule the cron. Report:

```
Greptile doesn't see PR #N yet. Check app.greptile.com — verify
redpotatoe07/sickrabbit-theme is connected and indexing finished.
Re-run pr-comments once it shows the PR. No cron scheduled —
would just burn cycles.
```

### 9. On re-check fires: abort and loop-backoff logic

When this skill runs from a scheduled cron fire, check abort conditions in order **before** processing comments:

**9a. PR closed or merged** — detected at step 1. CronDelete the loop. Stop.

**9b. Greptile still can't see the PR** — if the connectivity check still fails and the PR has been open 15+ minutes, cancel the cron and report the connectivity issue (as in step 8).

**9c. Consecutive empty fires** — maintain a counter in `.claude/.pr-comments-state.json`:

```json
{ "pr_number": 2, "empty_fires": 0, "last_checked_at": "2026-04-20T12:30:00Z" }
```

- Any fire with zero new comments/reviews since the last push: `empty_fires += 1`.
- Any fire with new activity: `empty_fires = 0`.
- When `empty_fires == 3`, cancel the cron and report: *"3 empty checks in a row — cancelling auto-recheck. Re-run pr-comments manually once a review arrives."*

Add `.claude/.pr-comments-state.json` to `.gitignore`. Session state, not a tracked artifact.

**9d. Stale-comment detection** — get last push time (`git log --format='%ci' -1`). If ALL comments predate the last push, treat as empty and apply 9c. Don't offer merge on a stale-comments run — let 9c drive the cancel.

If there *are* new comments, reset `empty_fires` to 0 and run the full resolve workflow (3–7). The cron fires again in 8 minutes.

### 10. PR is clean — offer to merge (with live-deploy reminder)

Triggered only when the cron is cancelled for a **positive** reason: all comments resolved, review posted, no open review items. Not triggered when 9b or 9c cancels.

**Cancel the re-check** (CronDelete) and offer:

```
No new comments on PR #2 — PR is clean.
(Cancelled automatic re-check.)

Reminder: merging to main deploys immediately to the live theme
at sick-rabbit-store.myshopify.com (and sickrabbit.com post-launch).

Ready to merge? I can:
  1. Squash and merge into main  ← ships live
  2. Leave it open for now
```

The live-deploy reminder is intentional on this project — the user should have a beat to confirm before the PR hits production.

If the user says yes / merge / ship:

1. **Squash and merge**:
   ```bash
   gh pr merge {number} --squash --delete-branch
   ```
2. **Ask which roadmap item(s) this shipped.** Parsing the PR title is unreliable on this project — Phase 3 has six section-restyles and `restyle: header nav` could tick "Header" in Phase 3 or, if the PR was bigger than expected, close out multiple sub-items. Ask:

   > PR #N is merged. Which roadmap item(s) did it ship? I'll mark them in `planning/roadmap.md`:
   >
   > Options (from current In Progress + Next):
   > - Phase 3 → Header
   > - Phase 3 → Homepage
   > - (…)
   >
   > Or tell me something else.

   Then invoke the `plan` skill with the user's answer to update `planning/roadmap.md` (tick the checkbox / move to Shipped) with today's date. If the PR accomplished more than a single item, mark all of them.

3. **Pull `main` locally** so the working tree matches:
   ```bash
   git checkout main && git pull
   ```

If the user says no, acknowledge and stop. Leave the PR open.

## Edge cases

- **PR already merged/closed** — step 1 catches it, cancel any existing re-check.
- **Greptile can't see the PR (first run)** — step 8 connectivity precheck skips the cron and surfaces the issue.
- **Greptile can't see the PR (subsequent run)** — step 9b cancels the cron.
- **3 consecutive empty fires** — step 9c cancels. User re-runs manually when a review is expected.
- **No review comments yet legitimately** — don't auto-merge a fresh PR with zero comments. The empty-fire counter handles the "reviewer hasn't posted yet" case.
- **All comments stale** — 9d + 9c. Does not auto-merge.
- **PR on a different branch than current** — user specifies PR number; don't assume.
- **Merge conflicts on `gh pr merge`** — report the error, suggest the user pull `main` and rebase locally.
- **Greptile flags something that's genuinely Dawn-original** — reply on the thread citing the decisions log; don't silently fix.
- **Greptile flags a hardcoded value we consciously accepted** — same approach: reply with the justification; don't silently fix.
- **Session ends mid-loop** — the cron disappears with the session. State file persists but is harmless — it gets overwritten on next run.

## Interaction with other skills

- **`pr-commit`** — creates the PR and kicks off the first re-check schedule. This skill takes over from there.
- **`commit`** — follows the same commit conventions for review-response commits (prefix, co-author, specific file staging).
- **`issue`** — if a reviewer surfaces a genuine bug that won't be fixed in this PR, log it as an issue with the `issue` skill rather than rolling it into a sprawling PR.
- **`plan`** — post-merge, this skill invokes `plan` to mark the roadmap item shipped.
- **`audit`** — if a PR gets an unusually high volume of Greptile comments, that's a signal we've drifted from standards. Consider running an audit as a follow-up.
