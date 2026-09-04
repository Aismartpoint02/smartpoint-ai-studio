import { NextRequest, NextResponse } from "next/server";

const FAL_MODEL = "blackforestlabs/flux-3/text-to-video/draft";

const json = (payload: Record<string, unknown>, status = 200) =>
  NextResponse.json(payload, { status, headers: { "Cache-Control": "no-store" } });

export async function GET(request: NextRequest) {
  const falKey = process.env.FAL_KEY || "";
  const requestId = request.nextUrl.searchParams.get("requestId") || "";

  if (!falKey) return json({ error: "FAL_KEY is not configured." }, 503);
  if (!/^[A-Za-z0-9_-]{10,200}$/.test(requestId)) {
    return json({ error: "Invalid fal.ai request ID." }, 400);
  }

  try {
    const statusResponse = await fetch(
      `https://queue.fal.run/${FAL_MODEL}/requests/${encodeURIComponent(requestId)}/status?logs=1`,
      {
        headers: { Authorization: `Key ${falKey}` },
        cache: "no-store",
      },
    );

    const statusData = (await statusResponse.json().catch(() => null)) as Record<string, unknown> | null;
    if (!statusResponse.ok) {
      const message =
        typeof statusData?.detail === "string"
          ? statusData.detail
          : typeof statusData?.message === "string"
            ? statusData.message
            : `fal.ai status request failed (${statusResponse.status}).`;
      return json({ error: message }, statusResponse.status >= 500 ? 502 : statusResponse.status);
    }

    const status = typeof statusData?.status === "string" ? statusData.status : "IN_QUEUE";
    if (status !== "COMPLETED") {
      return json({ ok: true, status, requestId, queuePosition: statusData?.queue_position ?? null });
    }

    const resultResponse = await fetch(
      `https://queue.fal.run/${FAL_MODEL}/requests/${encodeURIComponent(requestId)}`,
      {
        headers: { Authorization: `Key ${falKey}` },
        cache: "no-store",
      },
    );

    const resultData = (await resultResponse.json().catch(() => null)) as Record<string, unknown> | null;
    if (!resultResponse.ok) {
      const message =
        typeof resultData?.detail === "string"
          ? resultData.detail
          : typeof resultData?.message === "string"
            ? resultData.message
            : `fal.ai result request failed (${resultResponse.status}).`;
      return json({ error: message }, resultResponse.status >= 500 ? 502 : resultResponse.status);
    }

    const video = (resultData?.video || {}) as Record<string, unknown>;
    const videoUrl = typeof video.url === "string" ? video.url : null;

    if (!videoUrl) {
      return json({ ok: false, status: "FAILED", requestId, error: "fal.ai completed without a video URL." }, 502);
    }

    return json({ ok: true, status: "COMPLETED", requestId, videoUrl });
  } catch (e) {
    return json({ error: e instanceof Error ? e.message : "fal.ai status request failed." }, 502);
  }
}
