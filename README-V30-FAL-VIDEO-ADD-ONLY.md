# SmartPoint V30 — FAL Video Add-Only Patch

This patch adds a server-side fal.ai FLUX 3 draft video path to SmartPoint AI Studio without removing the existing Cloudflare AI fallback.

## What it does
- Reads `FAL_KEY` only on the server.
- Uses `blackforestlabs/flux-3/text-to-video/draft` through fal's queue API.
- Uses 16:9, 720p, generated audio, and 5/10/20-second clips based on the existing duration selector.
- Polls fal's queue from `/api/generate/status` until the video is complete.
- Keeps the existing Cloudflare AI path when `FAL_KEY` is unavailable.
- Does not put any API key in client-side code.

## Required Cloudflare secret
`FAL_KEY` must already exist as a Worker secret. After changing secrets in Cloudflare, click Deploy so the new secret is active for the Worker.

## Important billing note
fal currently advertises a free daily allowance for FLUX 3 text-to-video draft generations. Production/full-quality endpoints are pay-per-use. Do not assume unlimited free generation.

## Files in this patch
- `app/api/generate/route.ts` — provider routing and fal queue submission
- `app/api/generate/status/route.ts` — secure server-side queue status/result polling
- `app/page.tsx` — waits for fal result and displays the generated video
- existing V29 files are copied unchanged for the upload package
