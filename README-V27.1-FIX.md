# SmartPoint V27.1 AI Generation Fix

Additive patch for the existing SmartPoint project.

Only `app/api/generate/route.ts` is replaced.

Fixes:
- Removes the unsupported Edge runtime declaration causing the Cloudflare OpenNext deployment failure.
- Keeps the Cloudflare Workers AI request server-side.
- Reads the generated video from `result.video`.
- Provides clearer errors for missing secrets and provider failures.

Configure these as Cloudflare Worker secrets:
- CLOUDFLARE_ACCOUNT_ID
- CLOUDFLARE_API_TOKEN

Never commit API tokens.

The existing 1–180 minute UI is preserved. FLUX 3 Video generates short clips; long-form video requires the later scene/queue/render pipeline.
