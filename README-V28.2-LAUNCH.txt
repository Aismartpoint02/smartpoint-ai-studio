SmartPoint AI Studio V28.2 Launch Package

WHAT THIS VERSION DOES
- Preserves the SmartPoint AI Studio homepage and all existing modules.
- Makes every left navigation item open its own workspace view.
- Adds working browser-side project saving/counting for the creator shell.
- Adds search across the creative-suite modules.
- Adds Save Project and New Project interactions.
- Keeps AI Video wired to /api/generate.
- Keeps Security Center visible and separates UI readiness from production provider work.
- Keeps payment UI and explicitly avoids putting payment secrets in the browser.
- Adds small launch-status/credits UI without pretending those credits are real money.

IMPORTANT PRODUCTION ITEMS
A page.tsx cannot create or store Cloudflare/Paystack secrets, a real user database, private object storage, or payment webhooks by itself.
Before accepting real payments or promising real long-form rendering, connect:
1) Cloudflare Worker runtime secrets for CLOUDFLARE_ACCOUNT_ID and CLOUDFLARE_API_TOKEN.
2) A real Paystack server-side integration with secret key + callback/webhook verification.
3) Real authentication/session storage.
4) A persistent database for users/projects/credits.
5) Private media storage and a render/queue worker for long videos.
6) Domain and production smoke tests.

SAFETY
Never paste provider secret keys into app/page.tsx or the browser.
Never commit .env or secret values to GitHub.

INSTALL
Replace ONLY:
  app/page.tsx
with the included:
  app/page.tsx

Do not delete other existing repository files. The existing app/api/generate/route.ts and next.config.ts should remain in place.

Then run the existing project build/deploy flow.


SECURITY HARDENING V28.3
- Security response headers and CSP in next.config.ts.
- poweredByHeader disabled.
- Request correlation via X-Request-ID.
- Request body size guard (2 MB).
- Cross-origin mutation guard.
- Google OAuth PKCE (S256).
- Dedicated SESSION_SECRET for signing application sessions; Google client secret is not reused as the session-signing key.
- __Host- prefixed Secure/HttpOnly session/state cookies.
- Existing security UI is preserved.

REQUIRED SERVER SECRETS
GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET
SESSION_SECRET

SESSION_SECRET must be a long random server-side secret. Never place it in page.tsx, GitHub source, or client-side code.

LIMITATION
The middleware guard is not a substitute for a distributed WAF/rate limiter. For production scale, put Cloudflare WAF/rate limiting in front of the Worker and use a persistent database/session store.
