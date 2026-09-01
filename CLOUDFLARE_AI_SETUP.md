# SmartPoint AI Studio V27 — AI Video Generation

This patch is additive. It keeps the existing SmartPoint V26 workspace and connects the existing **Create** button to a real server-side AI video endpoint.

## Added/changed

- `app/api/generate/route.ts`
  - Calls Cloudflare's AI API from the server.
  - Uses `black-forest-labs/flux-3-video`.
  - Keeps the provider token out of the browser.
- `app/page.tsx`
  - Keeps the existing UI/modules.
  - The Create button now calls `/api/generate`.
  - A returned video can be previewed in the workspace.

## Required Cloudflare secrets

Add these as server-side environment variables/secrets in the Cloudflare deployment:

- `CLOUDFLARE_ACCOUNT_ID`
- `CLOUDFLARE_API_TOKEN`

Never put these values into `page.tsx` or commit them to GitHub.

## Important limitation

The current FLUX 3 Video model supports short 5–20 second clips. The existing SmartPoint 1/5/10/30/60/180-minute choices are intentionally preserved, but this patch does **not** pretend that one API call can create a 180-minute video.

The next engineering stage is:

1. prompt → scene plan
2. generate many short scenes
3. store scene files
4. queue/render worker
5. FFmpeg assembly
6. captions/audio
7. final MP4
8. save project history

That is the correct path for real long-form SmartPoint video generation.
