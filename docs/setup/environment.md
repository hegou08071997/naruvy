# Environment

Shopify themes don't use a `.env` file for theme code — there are no runtime env vars baked into Liquid. Authentication is handled per-machine by the Shopify CLI.

## Prerequisites

- **Node.js** — 18 LTS or newer
- **Shopify CLI** — `npm install -g @shopify/cli` (theme commands are bundled since CLI 3.59.0)
- **[Shopify Liquid VS Code extension](https://shopify.dev/docs/storefronts/themes/tools/shopify-liquid-vscode)** — live theme-check diagnostics, autocomplete for tags/filters/objects/settings, hover docs, Liquid Prettier formatting. Catches most issues at save-time before they ever reach a commit.
- **Git** — standard
- **Access to the Sick Rabbit store** — owner or staff account on `sick-rabbit-store.myshopify.com`

## Enable the git pre-commit hook (per-machine, do this once)

The repo ships a pre-commit hook at `.githooks/pre-commit` that refuses direct commits to `main` (which would auto-deploy to the live theme). Enable it:

```sh
git config core.hooksPath .githooks
```

Verify: `git checkout main && git commit --allow-empty -m "test"` should fail with a clear error message. Then `git checkout -` to return to wherever you were. See `docs/setup/branching.md` for the full branch-discipline context.

## First-time auth

```sh
shopify theme dev --store=sick-rabbit-store.myshopify.com
```

The first run opens a browser for login and stores credentials in the CLI's config directory (`~/.config/shopify/` on macOS/Linux, `%APPDATA%\shopify\` on Windows). After that the CLI re-auths silently.

To switch accounts: `shopify auth logout` then re-run `shopify theme dev`.

## Greptile MCP

The Greptile code review agent needs an API key to connect. See `.greptile/` setup and [the Greptile section of the Kiro vault](https://app.greptile.com/settings/api) for the key.

1. Get the API key from [app.greptile.com/settings/api](https://app.greptile.com/settings/api)
2. Open `.greptile/mcp-proxy.mjs` and replace `"your-key-here"` with the real key
3. Restart Claude Code — `/mcp` should show `greptile-api` as connected

`.greptile/mcp-proxy.mjs` is gitignored so the key never ends up in Git. Each machine sets its own copy.

## GitHub integration (Phase 5)

When ready to connect the live theme:

1. In Shopify admin → Online Store → Themes → Add theme → "Connect from GitHub"
2. Authorise Shopify's GitHub app on `redpotatoe07/sickrabbit-theme`
3. Pick the `main` branch
4. Merchant edits from admin will auto-commit back to `main`

## Troubleshooting

| Symptom | Fix |
|---|---|
| `shopify theme dev` says "store not found" | Check the `--store` flag spelling, re-auth with `shopify auth logout` |
| Hot reload stops working | Kill the process and restart. CSS changes occasionally need a hard refresh |
| `shopify theme check` complains about schema | Validate JSON in `templates/*.json` and any `{% schema %}` blocks |
| Merchant admin edits don't appear locally | `shopify theme pull --live` to sync them down |
