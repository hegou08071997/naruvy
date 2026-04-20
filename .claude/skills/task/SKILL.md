---
name: task
description: Log and tick individual work items (TSK-NNN) inside a phase of the Sick Rabbit theme roadmap. Use this skill whenever the user says "add a task", "new task", "log a task", "that's a task", "make it a task", "what tasks are open", "task list", "mark TSK-NNN done", "tick that task", "TSK-", or describes something to build or add ("we need a newsletter block", "add a filter for size"). Also trigger when the user wants to sequence concrete sub-steps inside an active phase before starting work. For fixing broken behaviour use the issue skill; for adding, reordering, or shipping whole phases use the plan skill; this skill is the item-level tool that sits between them.
---

# Task

Track individual buildable work items inside a phase in `planning/roadmap.md`. Tasks are **things to build** — features, components, enhancements. They are NOT fixes for broken behaviour (that's the `issue` skill) and NOT phase-level structure (that's the `plan` skill).

## Task vs. issue vs. roadmap item

- **Task** — "we need a newsletter signup block on the footer" → something to build → `TSK-NNN` in `planning/roadmap.md`
- **Issue** — "the newsletter signup submits twice on double-click" → something broken → `ISS-NNN` in `planning/issues.md`
- **Roadmap item** (phase) — "Phase 3 — Restyle sections" → the overall chunk of work → managed by the `plan` skill

If the user describes something broken, redirect to the `issue` skill. If they're adding or reorganising a whole phase, redirect to `plan`.

## How this splits with `plan`

- **`plan`** owns phase-level structure: the Shipped table, the In Progress section, the Next queue, audit checkpoints, phase transitions (Next → In Progress → Shipped), and reconciliation with the Kiro Shopify Build Plan.
- **`task`** owns item-level work within a phase: adding `TSK-NNN` bullets, ticking them done, listing what's open.

When a phase's tasks are all ticked and the phase should move to Shipped, that's a `plan` operation — this skill confirms and hands off.

## Task ID format

`TSK-NNN`, zero-padded to 3 digits. Increment from the highest existing ID in `planning/roadmap.md`. Read the file first to find it — don't guess, because some phases have their own TSK ranges and a collision is ugly.

## Where tasks live

Tasks are checklist bullets inside a phase section in `planning/roadmap.md`. One line each:

```markdown
### Phase 3 — Restyle sections
- [ ] **TSK-001**: Restyle header (logo, nav, cart icon, announcement bar)
- [ ] **TSK-002**: Restyle homepage (hero, featured collections, content modules)
- [x] **TSK-003**: Restyle collection page
```

`[ ]` = open. `[x]` = done. Tasks can live in **In Progress** (active phase) or in **Next** sections (planned phases not yet started — optional, for sequencing work ahead of time).

## Operations

### Add a task

When the user describes something to build:

1. **Confirm it's a task, not an issue.** If the description implies broken behaviour, redirect to the `issue` skill.
2. **Read `planning/roadmap.md`.** Find the highest existing `TSK-NNN` and identify the phase sections.
3. **Decide which phase it belongs to.**
   - If one phase is In Progress and the work belongs there, use it.
   - If the work belongs to a future Next phase, put it there — good for sequencing.
   - If no phase fits (it's a parallel sub-stream, or a pre-Phase-1 prep), ask the user.
4. **Add the bullet** with the next `TSK-NNN` ID, under the right phase section.
5. **Confirm in chat:** *"Added TSK-017 to Phase 3: Restyle product page / PDP gallery."*

Keep the description to one line — enough to recognise at a glance. If the user's explanation is longer, distill it. Longer context belongs in the commit message or a decisions-log entry, not the roadmap.

### List open tasks

When the user asks what's open:

1. Read `planning/roadmap.md`.
2. Show open (`[ ]`) tasks grouped by phase, phase name as header, TSK-NNN IDs and descriptions under each.
3. Skip completed tasks unless the user asks for them.

Format:

```
Open tasks:

Phase 3 — Restyle sections
  TSK-001: Restyle header
  TSK-002: Restyle homepage
  TSK-004: Restyle product page / PDP

Phase 4 — Content + products
  TSK-010: Tapstitch integration
  TSK-011: Product tagging conventions
```

### Mark a task done

When the user says a task is done ("TSK-002 is done", "mark that task complete", "tick off the cart drawer restyle"):

1. Read `planning/roadmap.md`.
2. Find the task — by TSK number if given, otherwise by description (ask if ambiguous).
3. Change `- [ ]` to `- [x]`.
4. Confirm: *"Marked TSK-002 as done."*

If marking this task finishes every task in the current In Progress phase, say so and suggest the `plan` skill to move the phase to Shipped:

> That was the last task in Phase 3. Want me to hand off to the `plan` skill to move Phase 3 to Shipped?

### Mark multiple tasks at once

If the user says "mark TSK-001 and TSK-003 as done", handle them in one pass, then confirm both.

### Reopen a task

If a task was ticked but actually isn't done (regression, missed scope), change `[x]` back to `[ ]` and note why in chat so the user has context. Don't silently re-open — the checkbox is a social signal to the rest of the project.

## Commit integration

When a commit closes out a task, reference the TSK ID in the subject so `git log | grep TSK-` stays useful and the `pr-commit` skill's auto-detection can pick it up:

```
restyle: header to match brand type scale (TSK-001)
feat: announcement bar with admin-editable message (TSK-009)
```

The `pr-commit` skill parses `TSK-\d+` from commit messages in the branch and ticks the matching tasks as part of its doc-update step — so disciplined TSK references mean the roadmap stays current without extra effort at PR time.

## Edge cases

- **"Add a task" without details** — ask: *"What's the task?"* Don't invent a placeholder.
- **Task straddles phases** — ask the user to pick the primary phase, or split into two smaller tasks.
- **Task that's actually a whole phase** — redirect to `plan`. If it needs 6+ sub-items and a deliverable statement, it's not a task.
- **User describes something broken, not something to build** — redirect to the `issue` skill.
- **Task duplicates an existing one** — flag it and ask whether to consolidate or keep both.
- **TSK-NNN collision** (two tasks claiming the same ID) — should never happen, but if it does, renumber the later one and tell the user.

## Principles

- **IDs are cheap, ambiguity is expensive.** Always use TSK-NNN even for small tasks — the commit/PR traceability is worth the small friction.
- **One-line descriptions.** If a task needs a paragraph, it's either scope that needs splitting or context that belongs in a commit message.
- **Don't let the list bloat.** If the same user keeps adding tasks to a phase that's already underway, pause and ask whether the phase's scope has genuinely grown or whether the new items should go to Next.
- **Tick promptly.** The list stops being useful the moment it drifts from reality. Mark done when done; don't batch up 10 ticks at the end of a session.
