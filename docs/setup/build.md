# Build & Dev Commands

Shopify CLI is the primary tool. Install it once globally:

```sh
npm install -g @shopify/cli
```

Theme commands are bundled — since CLI `3.59.0` the separate `@shopify/theme` package is deprecated and redundant. Docs: [shopify.dev/docs/themes/tools/cli/install](https://shopify.dev/docs/themes/tools/cli/install).

## Local dev

```sh
shopify theme dev --store=sick-rabbit-store.myshopify.com
```

Opens a local server at `http://127.0.0.1:9292` with hot reload for Liquid/CSS/JS changes. First run prompts for auth — logs you into the Shopify Partner / store account.

Useful flags:

| Flag | Purpose |
|---|---|
| `--theme <id-or-name>` | Develop against a specific unpublished theme instead of the default dev theme |
| `--live-reload <mode>` | `hot-reload` (default), `full-page`, or `off` |
| `--host 0.0.0.0` | Expose on LAN (for phone testing) |

## Lint

```sh
shopify theme check
```

Runs theme-check against the repo. Rules live in `.theme-check.yml` (Dawn default). Expect this to run in CI via Dawn's existing GitHub Actions workflow.

## Push / pull

```sh
# Push the current directory as an unpublished theme for review
shopify theme push --unpublished --theme "Sick Rabbit dev $(date +%Y-%m-%d)"

# Push to the live theme (DO NOT use once GitHub integration is live — let it auto-deploy)
shopify theme push --live

# Pull the published theme's current state (useful for syncing merchant admin edits locally)
shopify theme pull --live
```

**Once the GitHub integration is connected at Phase 5**, prefer `git push` over `shopify theme push`. Shopify will sync `main` to the live theme automatically and commit admin edits back.

## Deploy (Phase 5 onwards)

1. Push to `main` on GitHub
2. Shopify GitHub integration picks it up, syncs to the connected theme
3. Theme goes live at `sickrabbit.com`

Nothing to run locally for deploy.

## Upstream merges

```sh
git fetch upstream
git merge upstream/main
# resolve conflicts
shopify theme check
shopify theme dev --store=sick-rabbit-store.myshopify.com   # smoke test
git push origin main
```
