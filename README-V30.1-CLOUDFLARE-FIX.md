# SmartPoint AI Studio V30.1 — Cloudflare Deploy Fix (ADD-ONLY)

This patch preserves V30 and adds the Cloudflare OpenNext deployment configuration required by Workers Builds.

Added:
- `wrangler.jsonc` — Worker entry point `.open-next/worker.js` and assets `.open-next/assets`.
- `open-next.config.ts` — OpenNext Cloudflare adapter configuration.
- Updated `package.json` — OpenNext build/deploy scripts and adapter/Wrangler dependencies.

Why: the Cloudflare Workers Builds preview deployment was failing with `Missing entry-point to Worker script or to assets directory` because the repository did not contain a Wrangler configuration and the build was only running `next build`.

Do not add or commit any secrets. Existing Worker secrets such as `FAL_KEY`, `CLOUDFLARE_ACCOUNT_ID`, and `CLOUDFLARE_API_TOKEN` remain configured in Cloudflare.
