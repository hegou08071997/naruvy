# Sick Rabbit Theme

Custom Shopify theme for the [Sick Rabbit](https://sickrabbit.com) apparel brand. Forked from Shopify's [Dawn](https://github.com/Shopify/dawn) reference theme and restyled to the brand.

- **Store**: `sick-rabbit-store.myshopify.com`
- **Live domain (Phase 5)**: `sickrabbit.com`
- **Deploy**: GitHub integration — push to `main` auto-syncs to the live theme.

## Tech stack

| Layer | Choice |
|---|---|
| Platform | Shopify (Basic, GBP) |
| Theme base | Dawn (OS 2.0, performance-tuned) |
| Templating | Liquid + OS 2.0 JSON templates |
| Styling | CSS custom properties on top of Dawn's token system |
| Local dev | [Shopify CLI](https://shopify.dev/docs/api/shopify-cli/theme) |
| Version control | Git + GitHub |
| Fulfillment | [Tapstitch](https://www.tapstitch.com/) (print-on-demand) |
| Review | [Greptile](https://greptile.com) via MCP |

## Getting started

Prerequisites: Node.js, [Shopify CLI](https://shopify.dev/docs/themes/tools/cli/install).

```sh
# clone, then from the repo root
shopify theme dev --store=sick-rabbit-store.myshopify.com
```

Hot reload runs at `http://127.0.0.1:9292`. See [`docs/setup/build.md`](docs/setup/build.md) for the full command list and [`docs/setup/environment.md`](docs/setup/environment.md) for auth and env setup.

## Key docs

- [`CLAUDE.md`](CLAUDE.md) — coding rules and conventions
- [`docs/architecture.md`](docs/architecture.md) — theme structure
- [`docs/design/vision.md`](docs/design/vision.md) — brand direction
- [`docs/design/system.md`](docs/design/system.md) — tokens (colours, type, spacing)
- [`docs/components.md`](docs/components.md) — snippet/section registry
- [`docs/decisions.md`](docs/decisions.md) — architectural decisions log
- [`planning/roadmap.md`](planning/roadmap.md) — what's shipped, in progress, next

## Staying up to date with Dawn

Dawn is tracked as `upstream`:

```sh
git fetch upstream
git merge upstream/main
```

Resolve conflicts in our restyled areas; run `shopify theme check` afterwards.

## License

Dawn is MIT licensed — see [`LICENSE.md`](LICENSE.md). Sick Rabbit customisations on top are proprietary.
