# V29 MAX LAUNCH
Implemented: security headers, middleware request guards, Google OAuth+PKCE foundation, server-side Cloudflare AI adapter, health endpoint, Paystack initialization, Paystack HMAC-SHA512 webhook verification, responsive dashboard and existing V28.5 workspaces.

External gates before accepting real users/payments: durable database for users/projects/credits/idempotency; private object storage; queue + FFmpeg/GPU workers for true long-form MP4; live provider credentials; successful `npm run typecheck` and `npm run build` on the complete repository; full payment/auth/upload/security smoke tests.

The application fails closed when these services/secrets are absent. It never pretends demo credits are real money or that a short AI clip is a 10–180 minute rendered MP4.
