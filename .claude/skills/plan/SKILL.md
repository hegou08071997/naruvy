---
name: plan
description: Manage the Sick Rabbit theme roadmap and ideas backlog. Use this skill when the user says "what are we working on", "what's next", "status", "show the plan", "what's the roadmap", "what phase are we in", "add to the roadmap", "mark Phase X as shipped", "move this to in progress", "add an idea", "evaluate this feature", "prioritise", or anything else about what to build next and in what order. Also trigger when a section restyle or phase finishes and the roadmap needs updating, when the user wants to promote an idea from ideas.md to the roadmap, or when they're weighing whether a post-launch feature idea is worth committing to. Not for logging bugs (that's the issue skill) — this skill is strictly about what to build and in what order.
---

# Plan

This skill manages the two files that define what the Sick Rabbit theme is building:

- **`planning/roadmap.md`** — what's shipped, what's in progress, what's next. The committed plan. Mirrors the phased build plan in Kiro at `Projects/Sick Rabbit/Documentation/Website/Development/Shopify Build Plan.md`.
- **`planning/ideas.md`** — features being considered but not yet committed. The "maybe" list, mostly post-launch stuff.

The separation matters: half-formed ideas shouldn't clutter the committed plan. Ideas get evaluated on their own merits and only graduate to the roadmap when there's a clear decision to build them.

## Kiro linkage

The Shopify Build Plan in Kiro is the narrative source of truth — it has the rationale for each phase, tech decisions, and timeline. `planning/roadmap.md` in the repo is the status-tracking summary. When a phase ships or scope changes materially, update both: the Kiro doc gets the prose update, the repo roadmap gets the checkbox tick / shipped-row addition. If the user asks "what's the plan" without context, the repo roadmap is the fast answer; if they want the *why*, point them at the Kiro doc.

## Roadmap format

The project follows the five-phase build plan. Each phase already has a structure; keep it.

```markdown
# Roadmap

Mirrors Projects/Sick Rabbit/Documentation/Website/Development/Shopify Build Plan.md in Kiro.

## Shipped

| Version | What | Date |
|---|---|---|
| — | Dawn forked as base theme | 2026-04-19 |
| — | Repo setup retrofit | 2026-04-19 |
| Phase 1 | Setup complete (CLI, Greptile, AI Toolkit, skills) | 2026-04-20 |

## In Progress

### Phase 2 — Extract brand tokens
Pull colours, fonts, type scale from the old Astro repo; apply to Dawn's colour schemes and CSS custom properties.
- [x] Source tokens documented in `docs/design/system.md`
- [ ] Map onto Dawn colour schemes in `config/settings_data.json`
- [ ] Add CSS custom properties to `assets/base.css`
- [ ] Wire webfonts (UnifrakturMaguntia, Pirata One, Anonymous Pro, Nordica Plus, UnifrakturCook, Outfit)

## Next

### Audit Checkpoint (post-Phase 2)
Token-coverage audit before Phase 3 restyle begins.

### Phase 3 — Restyle sections
Section-by-section restyle in priority order:
- [ ] Header (logo, nav, cart icon, announcement bar)
- [ ] Homepage (hero, featured collections, content modules)
- [ ] Collection page
- [ ] Product page / PDP
- [ ] Cart drawer
- [ ] Footer

### Phase 4 — Content + products (parallel with Phase 3)
- [ ] Tapstitch integration
- [ ] Product creation + tagging
- [ ] Rule-based collections (Anachronism, Norse Poets Society, Digital Occult, Major Arcana)
- [ ] Copy from old Astro repo
- [ ] Shipping zones, payment gateways, taxes (GBP)

### Audit Checkpoint (pre-launch, mandatory)
Full audit including the pre-launch checklist before Phase 5.

### Phase 5 — Launch
- [ ] Connect GitHub integration — `main` → live theme
- [ ] Point `sickrabbit.com` DNS at Shopify
- [ ] SSL auto-provision
- [ ] Password-protect for QA
- [ ] Remove password → live
```

### Sections

- **Shipped** — completed phases/pieces, one row each, dated. This is the project's history.
- **In Progress** — what's actively being built. Checklist of concrete sub-steps. Ideally one phase active at a time.
- **Next** — what's coming after, in priority order. Enough detail to understand scope, not a full spec.

### Sub-phases / tasks

Phase 1 is broken into `1a → 1e` because it's multi-session. Phase 3 is a list of sections rather than sub-phases because each section restyle is roughly one session. Use whichever shape fits the phase.

For **item-level work inside a phase** — adding a concrete thing to build, ticking it off, listing what's open — hand off to the `task` skill. It owns `TSK-NNN` IDs and the bullet-level operations. This skill (`plan`) owns the phase-level structure: shipped/in-progress/next, transitions between sections, audit-checkpoint placement.

The quick split:
- "What phase are we in, and what's shipped?" → `plan`
- "Add TSK-NNN for X", "mark TSK-NNN done", "what tasks are open in Phase 3?" → `task`

If a phase just needs a short flat checklist (one session's work, no cross-session tracking), plain bullets are fine and `task` IDs are optional. Introduce TSK-NNN when multi-session work benefits from commit traceability (`feat: … (TSK-009)`).

## Ideas format

```markdown
# Ideas

Features being considered but not committed. Mostly post-launch — anything worth weighing goes here before graduating to the roadmap.

| Idea | Complexity | Feasibility | Demand | Usefulness | Notes |
|------|-----------|-------------|--------|------------|-------|
| Bespoke PDP layout | High | High | Medium | High | Post-launch iteration on Dawn's default PDP |
| Lookbook section | Medium | High | Medium | High | Reusable OS 2.0 section for Anachronism / Norse Poets / etc. |
| Custom 404 | Low | High | Low | Medium | On-brand + irreverent |
| Loyalty / referral | Medium | High | Low | Low | Shopify app if volume warrants |
```

### Evaluation columns

- **Complexity** — how hard to build? (Low / Medium / High)
- **Feasibility** — can it actually be done with Dawn + Shopify + the current plan? (Low / Medium / High)
- **Demand** — how much does the brand/audience want this? (Low / Medium / High). Pre-launch this is a judgement call based on the brand direction.
- **Usefulness** — how much value does it add? (Low / Medium / High). Novelty features can be high-demand but low-usefulness; infrastructure can be the opposite.
- **Notes** — one-line context: constraint, dependency, or direction.

## Operations

### Show status

Read `planning/roadmap.md` and summarise: what's shipped, what's in progress (with sub-step progress), what's next. If asked for a one-line answer, say the current phase and the immediate next step. If asked for *why* a phase is scoped the way it is, read the Shopify Build Plan in Kiro.

### Add to the roadmap

1. Decide which section it belongs in (usually **Next**).
2. Ask about priority relative to existing Next items if the list isn't empty.
3. Add with a brief description and a checklist if it's multi-step.
4. If it's a major feature (new template, new integration, new section family), insert an **Audit Checkpoint** right after it — audits between major features prevent drift from one contaminating the next.
5. Mirror the change in the Kiro Shopify Build Plan when the scope or phase structure is materially different from what the plan currently says.

### Move between sections

- **Starting work**: move from Next to In Progress. Break into a checklist of concrete sub-steps. If the phase is session-long, plain bullets are fine; if multi-session, use `TSK-NNN` IDs.
- **Shipping**: move from In Progress to Shipped. Add a row to the Shipped table with today's date (absolute, not "today"). Clear the checklist — the detail is in git history.
- **Pausing**: move from In Progress back to Next with a note about why it was paused and what state it's in.

Dates: always convert relative references ("today", "this week", "Thursday") to absolute `YYYY-MM-DD`. Relative dates rot quickly.

### Add an idea

1. Read `planning/ideas.md` first to avoid duplicates.
2. Evaluate across the four columns. Ask the user if you're unsure about any rating.
3. Add to the table with a one-line Notes entry.
4. Confirm in chat: *"Added to ideas: Lookbook section (Medium complexity, High feasibility, Medium demand, High usefulness)."*

### Promote an idea

When an idea graduates to the roadmap:

1. Remove from the ideas table.
2. Add to **Next** in `planning/roadmap.md` with a description and a preliminary checklist.
3. Ask about priority relative to other Next items.
4. Insert an **Audit Checkpoint** after it if it's a major feature.
5. If the promotion materially changes the build plan, sketch the change and update Kiro's Shopify Build Plan — don't let repo and vault drift.

### Evaluate ideas

When the user asks to review or prioritise `planning/ideas.md`:

- Which ideas score highest across all four columns?
- Any dependencies (idea X needs idea Y first)?
- Does anything on the ideas list unlock or block something already on the roadmap?
- Is anything actually post-Phase-5 only (don't pollute Next with "after launch" ideas)?

Present a recommendation but let the user decide.

## Audit checkpoints

After every major feature, insert an audit checkpoint. Build this into roadmap updates automatically:

```markdown
### Audit Checkpoint (post-Phase 2)
Token-coverage audit before Phase 3 restyle begins.
```

A "major feature" on this project means: a phase transition, a new template type, a new third-party integration, a big section restyle. Minor token tweaks and copy edits don't need checkpoints between them.

The `audit` skill handles what happens at the checkpoint; this skill just makes sure it gets scheduled. The **pre-launch checkpoint before Phase 5 is mandatory** — don't let the user launch without it.

## Principles

- **The roadmap is a living document.** Update it honestly as priorities shift. An out-of-date plan is worse than no plan.
- **Ideas are cheap, commitments are expensive.** Keep `ideas.md` generous; keep `roadmap.md` honest. The gap between "that sounds cool" and "we're building that next" should require a conscious decision.
- **One phase at a time.** If In Progress has three phases open, nothing is actually in progress. Finish the restyle before starting the next.
- **Absolute dates, always.** "Next week" becomes `2026-04-27`. Relative dates rot.
- **Kiro = narrative, repo = status.** Keep both coherent; if they diverge, reconcile.
- **Don't skip the pre-launch audit.** Phase 5 is the one checkpoint that's non-negotiable.
