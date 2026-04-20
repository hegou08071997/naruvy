# Sick Rabbit — Code Review Standards

Prose version of the structured rules in `config.json`, with examples. Scoped to the Shopify theme tree at the repo root.

## Design tokens

Every colour, font-size, spacing value, and radius in the theme must come from a token — either Dawn's existing CSS custom properties or the Sick Rabbit tokens declared in `assets/base.css` / `config/settings_data.json`.

```css
/* Correct */
.product-card__title {
  color: var(--color-graphite);
  font-family: var(--font-heading);
  padding: var(--space-3);
}

/* Wrong — hardcoded */
.product-card__title {
  color: #2d2d2a;
  font-family: 'Pirata One', cursive;
  padding: 24px;
}
```

If the value you need isn't in the token system, add it to `docs/design/system.md` and `assets/base.css` first, then use it.

Inline `style=""` attributes in Liquid must never carry hex or rgb literals. Either use a class, a setting, or pass a token through:

```liquid
<!-- Correct -->
<div class="banner banner--slate">...</div>

<!-- Correct — setting-driven -->
<div style="background: {{ section.settings.background_color }};">...</div>

<!-- Wrong -->
<div style="background: #1c4d4f;">...</div>
```

## OS 2.0 sections

Every file in `sections/` is a section the merchant can place, reorder, and edit in the theme editor. That contract is protected by the `{% schema %}` block. Don't remove it. Don't hardcode copy that belongs in `settings`. Provide `presets` so the section is discoverable in the theme editor.

```liquid
{% schema %}
{
  "name": "Featured Collection",
  "settings": [
    { "type": "collection", "id": "collection", "label": "Collection" },
    { "type": "text", "id": "heading", "label": "Heading", "default": "Featured" }
  ],
  "presets": [{ "name": "Featured Collection" }]
}
{% endschema %}
```

## Render vs. include

Use `{% render %}` for every snippet. `{% include %}` is deprecated and leaks scope.

```liquid
{% render 'product-card', product: product %}
```

## Translations

Every visible English string goes through `t:` and has an entry in `locales/en.default.json`. Don't hardcode copy.

```liquid
<!-- Correct -->
<button>{{ 'products.product.add_to_cart' | t }}</button>

<!-- Wrong -->
<button>Add to cart</button>
```

## Money

Prices always go through `money`, `money_with_currency`, or `money_without_trailing_zeros`. Never concatenate a currency symbol.

```liquid
<!-- Correct -->
<span>{{ product.price | money }}</span>

<!-- Wrong -->
<span>£{{ product.price | divided_by: 100.0 }}</span>
```

## Client-side JS

Dawn is HTML-first. Don't reimplement cart, variants, or money formatting on the client. Use Shopify's Cart AJAX API for dynamic updates, and progressive enhancement for interactivity. If you're reaching for a framework, stop and ask first.

## Respect Dawn

Every file rename or structural change creates permanent conflicts with `upstream/main`. Prefer additive changes:

- New sections go in `sections/sick-rabbit-*.liquid` or similar distinct names
- Override styling via CSS specificity and custom properties, not by editing Dawn's core CSS in place when it's avoidable
- When a Dawn file must be modified, keep the change minimal and self-contained

## Components registry

Before creating a new snippet or section, grep `docs/components.md` and `snippets/` + `sections/` for what already exists. If a pattern shows up in 2+ places, extract it to a snippet. When you add or rename a snippet or section, update `docs/components.md` in the same PR.

## Naming

| Thing | Convention | Example |
|---|---|---|
| Snippet / section file | kebab-case `.liquid` | `product-card.liquid` |
| JSON template | kebab-case `.json` | `collection.anachronism.json` |
| Section-scoped CSS | `section-<name>.css` | `section-featured-collection.css` |
| Liquid variable | snake_case | `product_card_image_ratio` |
| Locale key | dot.snake_case | `products.product.add_to_cart` |

## Theme check

Every change must pass `shopify theme check`. Don't disable a check rule without logging it in `docs/decisions.md`.
