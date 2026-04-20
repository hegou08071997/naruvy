# Roadmap

Mirrors the [Shopify Build Plan](../../Kiro) in the Kiro vault at `Projects/Sick Rabbit/Documentation/Website/Development/Shopify Build Plan.md`. That doc is the source of truth; this file is the repo-side summary.

Item-level tasks use `TSK-NNN` IDs so commits can reference them (`restyle: header nav (TSK-005)`). Managed by the `task` skill. Phase-level structure (this file's sections, transitions, audit checkpoints) is managed by the `plan` skill.

## Shipped

| Version | What | Date |
|---|---|---|
| — | Dawn forked as base theme | 2026-04-19 |
| — | Repo setup retrofit (CLAUDE.md, docs/, planning/, .greptile/, .claude/skills/) | 2026-04-19 |
| Phase 1 | Setup complete — Shopify CLI, Greptile + MCP, AI Toolkit, project skills, GitHub ruleset on `main` | 2026-04-20 |

## In Progress

### Phase 2 — Extract brand tokens (1 session)
- [ ] **TSK-001**: Pull colours, fonts, type scale, spacing from `C:\Users\redpo\repos\sickrabbit-website\src\styles\variables.css`
- [ ] **TSK-002**: Map onto Dawn's colour schemes in `config/settings_data.json`
- [ ] **TSK-003**: Add CSS custom properties (including `--shadow-bevel-*`) to `assets/base.css`
- [ ] **TSK-004**: Wire webfonts (UnifrakturMaguntia, Pirata One, Anonymous Pro, Nordica Plus, UnifrakturCook, Outfit) — `font_picker` settings or explicit `@font-face`

## Next

### Audit Checkpoint (post-Phase 2)
Token-coverage audit before Phase 3 restyle begins. Run the `audit` skill with the token-coverage + font-loading extras.

### Phase 3 — Restyle sections (iterative, ~4–6 sessions)
- [ ] **TSK-005**: Restyle header (logo, nav, cart icon, announcement bar)
- [ ] **TSK-006**: Restyle homepage (hero, featured collections, content modules)
- [ ] **TSK-007**: Restyle collection page (grid, filters, sort)
- [ ] **TSK-008**: Restyle product page / PDP (gallery, variants, add-to-cart, description)
- [ ] **TSK-009**: Restyle cart drawer (quantity, line items, checkout button)
- [ ] **TSK-010**: Restyle footer (links, newsletter, socials)

### Phase 4 — Content + products (parallel with Phase 3)
- [ ] **TSK-011**: Tapstitch integration — app install or CSV sync
- [ ] **TSK-012**: Product creation + tagging conventions
- [ ] **TSK-013**: Rule-based collections (Anachronism, Norse Poets Society, Digital Occult, Major Arcana)
- [ ] **TSK-014**: Paste/write homepage, about, policies (copy from old Astro repo)
- [ ] **TSK-015**: Shipping zones, payment gateways, taxes (GBP)

### Audit Checkpoint (pre-launch, mandatory)
Full audit including the pre-launch checklist before Phase 5. Non-negotiable — enforced by the `audit` skill.

### Phase 5 — Launch
- [ ] **TSK-016**: Connect GitHub integration — `main` → live theme
- [ ] **TSK-016a**: Add Shopify GitHub app to the `main` ruleset bypass list (only appears in the picker after TSK-016 installs it). Without this, merchant admin edits will fail to commit.
- [ ] **TSK-017**: Point `sickrabbit.com` DNS at Shopify (DNS-only cutover from Vercel)
- [ ] **TSK-018**: SSL auto-provision
- [ ] **TSK-019**: Password-protect for final QA
- [ ] **TSK-020**: Remove password → live
