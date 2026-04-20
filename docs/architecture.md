# Architecture

Sick Rabbit theme is a Shopify Online Store 2.0 theme, forked from Dawn. This doc maps the Dawn-provided structure and our layered-on additions.

## Folder structure

```
sickrabbit-theme/
├── assets/             # CSS, JS, theme images, static files served by Shopify's CDN
├── config/             # settings_schema.json (schema), settings_data.json (values)
├── layout/             # theme.liquid — master template wrapping every page
├── locales/            # Translations; en.default.json is primary
├── sections/           # Reusable content sections with {% schema %} blocks
├── snippets/           # Small reusable Liquid fragments (no schema)
├── templates/          # OS 2.0 JSON templates + /customers account pages
├── docs/               # Repo documentation (this folder)
├── planning/           # Roadmap, ideas, issues
├── .greptile/          # Greptile review config
└── .claude/skills/     # Project-specific Claude skills
```

## Templating model (OS 2.0)

- **Layout** (`layout/theme.liquid`) wraps every page. Global head tags, header/footer include points, JSON-LD scaffolding.
- **Templates** (`templates/*.json`) are thin JSON files listing sections and their order for a given page type (`product.json`, `collection.json`, `index.json`, etc.).
- **Sections** (`sections/*.liquid`) are self-contained blocks of markup, CSS, and schema. Merchants rearrange them in the theme editor.
- **Snippets** (`snippets/*.liquid`) are small reusable fragments rendered from sections and other snippets via `{% render %}`.

```
Request → theme.liquid (layout) → template.json → section A → snippet
                                               → section B → snippet
                                               → section C
```

## State and data

There is no app-side state. All data comes from:

- **Liquid objects** (`product`, `collection`, `cart`, `customer`, `shop`, `settings`) — server-rendered by Shopify
- **Section settings / block settings** — merchant-editable, read via `section.settings.*` and `block.settings.*`
- **Theme settings** (`settings.*`) — defined in `config/settings_schema.json`, values live in `config/settings_data.json`
- **Translations** — `locales/*.json`, accessed via the `t` filter

Any client-side state is per-page and scoped to the component's JS file in `assets/`.

## Styling

Dawn uses CSS custom properties set from `config/settings_data.json` and theme colour schemes. We layer Sick Rabbit tokens on top in `assets/base.css`. Per-section styles live in `assets/section-<name>.css`, loaded in the section's Liquid.

See [`docs/design/system.md`](design/system.md) for the full token list.

## Deploy path

- `main` branch → Shopify live theme, via [Shopify GitHub integration](https://shopify.dev/docs/storefronts/themes/tools/github)
- Merchant edits in admin auto-commit back to the connected branch (two-way sync)
- Local dev uses `shopify theme dev` against `sick-rabbit-store.myshopify.com`

## Upstream

Dawn remains `upstream`. Pull periodically to inherit Shopify's fixes and new OS 2.0 features.

```sh
git fetch upstream
git merge upstream/main
```

Expect conflicts in any section/snippet we've restyled.
