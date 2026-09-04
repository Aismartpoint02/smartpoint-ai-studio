import { NextRequest, NextResponse } from "next/server";

const COOKIE = "sp_google_session";
const STATE_COOKIE = "__Host-sp_google_state";
const VERIFIER_COOKIE = "__Host-sp_google_verifier";
const MAX_AGE = 60 * 60 * 24 * 7;

function env(name: string) {
  return process.env[name] || "";
}

function base64url(input: Uint8Array | string) {
  const bytes = typeof input === "string" ? new TextEncoder().encode(input) : input;
  let binary = "";
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function fromBase64url(value: string) {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/") + "=".repeat((4 - (value.length % 4)) % 4);
  const binary = atob(padded);
  return new Uint8Array([...binary].map(c => c.charCodeAt(0)));
}

async function hmac(value: string, secret: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
  return crypto.subtle.sign("HMAC", key, new TextEncoder().encode(value));
}

async function sign(value: string, secret: string) {
  return base64url(new Uint8Array(await hmac(value, secret)));
}

async function verify(value: string, signature: string, secret: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["verify"]
  );
  return crypto.subtle.verify("HMAC", key, fromBase64url(signature), new TextEncoder().encode(value));
}

function redirectUri(request: NextRequest) {
  return env("GOOGLE_REDIRECT_URI") || new URL("/api/auth/google?mode=callback", request.url).toString();
}

function configError() {
  return NextResponse.json(
    { error: "Google sign-in is not configured. Add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET as server-side secrets." },
    { status: 503, headers: { "Cache-Control": "no-store" } }
  );
}

async function sha256base64url(value: string) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return base64url(new Uint8Array(digest));
}

function sameOrigin(request: NextRequest) {
  const origin = request.headers.get("origin");
  return !origin || origin === new URL(request.url).origin;
}

export async function GET(request: NextRequest) {
  const mode = request.nextUrl.searchParams.get("mode") || "start";
  const clientId = env("GOOGLE_CLIENT_ID");
  const clientSecret = env("GOOGLE_CLIENT_SECRET");
  const secret = env("SESSION_SECRET");

  if (mode === "session") {
    if (!secret) return NextResponse.json({ authenticated: false }, { headers: { "Cache-Control": "no-store" } });
    const raw = request.cookies.get("__Host-sp_google_session")?.value || "";
    if (!raw) return NextResponse.json({ authenticated: false }, { headers: { "Cache-Control": "no-store" } });
    const [payload, signature] = raw.split(".");
    if (!payload || !signature) return NextResponse.json({ authenticated: false }, { headers: { "Cache-Control": "no-store" } });
    try {
      if (!(await verify(payload, signature, secret))) return NextResponse.json({ authenticated: false }, { headers: { "Cache-Control": "no-store" } });
      const data = JSON.parse(new TextDecoder().decode(fromBase64url(payload)));
      if (!data.exp || Date.now() > data.exp) return NextResponse.json({ authenticated: false }, { headers: { "Cache-Control": "no-store" } });
      return NextResponse.json({ authenticated: true, user: { name: data.name, email: data.email, picture: data.picture } }, { headers: { "Cache-Control": "no-store" } });
    } catch {
      return NextResponse.json({ authenticated: false }, { headers: { "Cache-Control": "no-store" } });
    }
  }

  if (mode === "logout") {
    const response = NextResponse.json({ ok: true }, { headers: { "Cache-Control": "no-store", "Clear-Site-Data": "\"cache\", \"storage\"" } });
    response.cookies.set("__Host-sp_google_session", "", { httpOnly: true, secure: true, sameSite: "lax", path: "/", maxAge: 0 });
    return response;
  }

  if (!clientId || !clientSecret || !secret) return configError();

  if (mode === "callback") {
    const code = request.nextUrl.searchParams.get("code");
    const state = request.nextUrl.searchParams.get("state");
    const savedState = request.cookies.get(STATE_COOKIE)?.value || "";
    const verifier = request.cookies.get(VERIFIER_COOKIE)?.value || "";
    if (!sameOrigin(request) || !code || !state || !savedState || state !== savedState || !verifier) {
      return NextResponse.json({ error: "Invalid Google sign-in state." }, { status: 400 });
    }

    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri(request),
        grant_type: "authorization_code",
        code_verifier: verifier,
      }),
    });
    if (!tokenResponse.ok) return NextResponse.json({ error: "Google token exchange failed." }, { status: 502 });
    const tokens = await tokenResponse.json() as { access_token?: string };
    if (!tokens.access_token) return NextResponse.json({ error: "Google did not return an access token." }, { status: 502 });

    const userResponse = await fetch("https://openidconnect.googleapis.com/v1/userinfo", {
      headers: { authorization: `Bearer ${tokens.access_token}` },
    });
    if (!userResponse.ok) return NextResponse.json({ error: "Unable to read Google profile." }, { status: 502 });
    const user = await userResponse.json() as { sub?: string; email?: string; email_verified?: boolean; name?: string; picture?: string };
    if (!user.sub || !user.email || user.email_verified !== true) {
      return NextResponse.json({ error: "Google account verification was not completed." }, { status: 403 });
    }

    // Use Google's stable `sub` as the account identifier; do not use email as the primary ID.
    const payload = base64url(JSON.stringify({
      sub: user.sub,
      email: user.email,
      name: user.name || "Creator",
      picture: user.picture || "",
      iat: Date.now(),
      exp: Date.now() + MAX_AGE * 1000,
    }));
    const signature = await sign(payload, secret);
    const response = NextResponse.redirect(new URL("/", request.url));
    response.cookies.set("__Host-sp_google_session", `${payload}.${signature}`, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
      maxAge: MAX_AGE,
    });
    response.cookies.set(STATE_COOKIE, "", { httpOnly: true, secure: true, sameSite: "lax", path: "/", maxAge: 0 });
    response.cookies.set(VERIFIER_COOKIE, "", { httpOnly: true, secure: true, sameSite: "lax", path: "/", maxAge: 0 });
    return response;
  }

  const stateBytes = crypto.getRandomValues(new Uint8Array(32));
  const state = base64url(stateBytes);
  const verifier = base64url(crypto.getRandomValues(new Uint8Array(32)));
  const challenge = await sha256base64url(verifier);
  const google = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  google.searchParams.set("client_id", clientId);
  google.searchParams.set("redirect_uri", redirectUri(request));
  google.searchParams.set("response_type", "code");
  google.searchParams.set("scope", "openid email profile");
  google.searchParams.set("state", state);
  google.searchParams.set("access_type", "online");
  google.searchParams.set("prompt", "select_account");
  google.searchParams.set("code_challenge", challenge);
  google.searchParams.set("code_challenge_method", "S256");

  const response = NextResponse.redirect(google);
  response.cookies.set(STATE_COOKIE, state, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 600,
  });
  response.cookies.set(VERIFIER_COOKIE, verifier, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 600,
  });
  return response;
}
