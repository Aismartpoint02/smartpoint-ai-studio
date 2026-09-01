import { NextResponse } from "next/server";

export const runtime = "edge";

const MODEL = "black-forest-labs/flux-3-video";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const prompt = typeof body?.prompt === "string" ? body.prompt.trim() : "";
    const language = typeof body?.language === "string" ? body.language : "English";
    const durationMinutes = Number(body?.durationMinutes || 1);

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required." }, { status: 400 });
    }

    const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
    const apiToken = process.env.CLOUDFLARE_API_TOKEN;

    if (!accountId || !apiToken) {
      return NextResponse.json(
        {
          error:
            "AI provider is not connected yet. Add CLOUDFLARE_ACCOUNT_ID and CLOUDFLARE_API_TOKEN as server-side secrets."
        },
        { status: 503 }
      );
    }

    // FLUX 3 Video currently supports 5–20 second clips.
    // The 1–180 minute SmartPoint UI is preserved; long-form rendering
    // will be assembled from multiple generated scenes in the next stage.
    const duration = durationMinutes <= 1 ? 5 : durationMinutes <= 5 ? 10 : 20;

    const response = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: MODEL,
          input: {
            mode: "t2v",
            prompt: `${prompt}\nSpoken language: ${language}.`,
            resolution: "hd",
            duration,
            generate_audio: true,
          },
        }),
      }
    );

    if (!response.ok) {
      const detail = await response.text();
      return NextResponse.json(
        {
          error: `Cloudflare AI error (${response.status}).`,
          detail: detail.slice(0, 1000),
        },
        { status: 502 }
      );
    }

    const data = await response.json();
    const videoUrl = data?.result?.video;

    if (!videoUrl) {
      return NextResponse.json(
        { error: "Cloudflare AI completed without returning a video URL.", provider: data },
        { status: 502 }
      );
    }

    return NextResponse.json({
      videoUrl,
      model: MODEL,
      clipSeconds: duration,
      message: "AI video clip generated successfully.",
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unexpected generation error." },
      { status: 500 }
    );
  }
}
