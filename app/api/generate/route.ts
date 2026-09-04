import { NextRequest, NextResponse } from "next/server";

const FAL_MODEL = "blackforestlabs/flux-3/text-to-video/draft";
const CLOUDFLARE_MODEL = process.env.CLOUDFLARE_AI_MODEL || "black-forest-labs/flux-3-video";
const MAX_PROMPT = 6000;

type Body = Record<string, unknown>;

const err = (message: string, status: number, id: string) =>
  NextResponse.json(
    { error: message, requestId: id },
    { status, headers: { "Cache-Control": "no-store" } },
  );

function clipSeconds(minutes: number) {
  return minutes <= 1 ? 5 : minutes <= 5 ? 10 : 20;
}

export async function POST(request: NextRequest) {
  const id = request.headers.get("x-request-id") || crypto.randomUUID();
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return err("Invalid JSON request.", 400, id);
  }

  if (!body || typeof body !== "object") {
    return err("Request body must be an object.", 400, id);
  }

  const x = body as Body;
  const prompt = typeof x.prompt === "string" ? x.prompt.trim() : "";
  const language = typeof x.language === "string" ? x.language.trim() : "English";
  const minutes = Number(x.durationMinutes);

  if (!prompt) return err("Describe the video you want to create first.", 400, id);
  if (prompt.length > MAX_PROMPT) return err(`Prompt is too long. Maximum ${MAX_PROMPT} characters.`, 413, id);
  if (!Number.isFinite(minutes) || minutes < 1 || minutes > 180) {
    return err("Duration must be between 1 and 180 minutes.", 400, id);
  }

  const seconds = clipSeconds(minutes);
  const falKey = process.env.FAL_KEY || "";

  // Preferred provider: fal.ai FLUX 3 draft.
  // Draft is used for the first production smoke test; fal currently advertises
  // a free daily allowance for FLUX 3 text-to-video draft generations.
  if (falKey) {
    try {
      const r = await fetch(`https://queue.fal.run/${FAL_MODEL}`, {
        method: "POST",
        headers: {
          Authorization: `Key ${falKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: `Create a professional ${language} video clip. ${prompt}`,
          aspect_ratio: "16:9",
          resolution: "720p",
          duration: seconds,
          generate_audio: true,
          safety_tolerance: 2,
        }),
        cache: "no-store",
      });

      const data = (await r.json().catch(() => null)) as Record<string, unknown> | null;

      if (!r.ok) {
        const message =
          typeof data?.detail === "string"
            ? data.detail
            : typeof data?.message === "string"
              ? data.message
              : `fal.ai request failed (${r.status}).`;
        return err(message, r.status === 402 ? 402 : r.status >= 500 ? 502 : r.status, id);
      }

      const requestId = typeof data?.request_id === "string" ? data.request_id : "";
      if (!requestId) return err("fal.ai accepted the request but did not return a request ID.", 502, id);

      return NextResponse.json(
        {
          ok: true,
          provider: "fal",
          status: typeof data?.status === "string" ? data.status : "IN_QUEUE",
          falRequestId: requestId,
          requestId: id,
          clipSeconds: seconds,
          targetMinutes: minutes,
          message: "Video generation queued. SmartPoint is waiting for the video…",
        },
        { headers: { "Cache-Control": "no-store" } },
      );
    } catch (e) {
      return err(e instanceof Error ? e.message : "fal.ai provider request failed.", 502, id);
    }
  }

  // Preserved fallback: existing Cloudflare AI path remains available.
  const account = process.env.CLOUDFLARE_ACCOUNT_ID || "";
  const token = process.env.CLOUDFLARE_API_TOKEN || "";
  if (!account || !token) {
    return err("No AI video provider is configured on the server. Add FAL_KEY or Cloudflare AI secrets.", 503, id);
  }

  try {
    const r = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${encodeURIComponent(account)}/ai/run`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: CLOUDFLARE_MODEL,
          input: {
            mode: "t2v",
            prompt: `Create a professional ${language} video clip. ${prompt}`,
            resolution: "hd",
            duration: seconds,
            generate_audio: true,
          },
        }),
        cache: "no-store",
      },
    );

    const data = (await r.json().catch(() => null)) as Record<string, unknown> | null;
    if (!r.ok) {
      const message =
        typeof data?.message === "string"
          ? data.message
          : typeof data?.error === "string"
            ? data.error
            : `Cloudflare AI request failed (${r.status}).`;
      return err(message, r.status >= 500 ? 502 : r.status, id);
    }

    const result = (data?.result || {}) as Record<string, unknown>;
    const videoUrl =
      typeof result.videoUrl === "string"
        ? result.videoUrl
        : typeof result.url === "string"
          ? result.url
          : null;

    return NextResponse.json(
      {
        ok: true,
        provider: "cloudflare",
        videoUrl,
        requestId: id,
        clipSeconds: seconds,
        targetMinutes: minutes,
        message: videoUrl
          ? "Video clip generated successfully."
          : "Generation completed without a playable URL.",
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (e) {
    return err(e instanceof Error ? e.message : "AI provider request failed.", 502, id);
  }
}
