# Components

Shared snippet and section registry. Check this before creating anything new. Update every time a shared snippet or section is added or changed.

Dawn ships with many snippets and sections out of the box — this registry is **Sick Rabbit's custom additions and significant overrides**, not a catalogue of everything Dawn provides. For Dawn's originals, read `snippets/` and `sections/` directly.

## Sections (custom / significantly modified)

| Name | File | Purpose | Used on |
|---|---|---|---|
| _(none yet)_ | — | — | — |

## Snippets (custom / significantly modified)

| Name | File | Purpose | Rendered in |
|---|---|---|---|
| _(none yet)_ | — | — | — |

## Conventions

- New Liquid sections go in `sections/` with a `{% schema %}` block. Give it `presets` so merchants can add it in the theme editor.
- Reusable markup fragments (no schema, no merchant editing) go in `snippets/` — render with `{% render 'name' %}`, never with the deprecated `{% include %}`.
- Co-locate CSS in `assets/section-<name>.css` and load it from the section via `{{ 'section-<name>.css' | asset_url | stylesheet_tag }}`.
- Add a row to this file when you ship a new snippet or section.

Components are added here as they're created.
