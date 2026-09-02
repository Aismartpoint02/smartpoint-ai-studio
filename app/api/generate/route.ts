import { NextResponse } from "next/server";

const MODEL = "black-forest-labs/flux-3-video";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const prompt = String(body?.prompt ?? "").trim();
    const language = String(body?.language ?? "English").trim();
    const durationMinutes = Number(body?.durationMinutes ?? 1);

    if (!prompt) {
      return NextResponse.json({ error: "Please enter a video prompt." }, { status: 400 });
    }

    const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
    const apiToken = process.env.CLOUDFLARE_API_TOKEN;

    if (!accountId || !apiToken) {
      return NextResponse.json(
        { error: "Cloudflare AI is not configured. Add CLOUDFLARE_ACCOUNT_ID and CLOUDFLARE_API_TOKEN as Worker secrets." },
        { status: 500 }
      );
    }

    const clipSeconds =
      durationMinutes <= 1 ? 5 :
      durationMinutes <= 5 ? 10 : 20;

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
            duration: clipSeconds,
            generate_audio: true,
          },
        }),
      }
    );

    const data = await response.json();

    if (!response.ok || data?.success === false) {
      return NextResponse.json(
        { error: data?.errors?.[0]?.message || "Cloudflare AI video generation failed." },
        { status: response.status || 502 }
      );
    }

    const videoUrl = data?.result?.video;

    if (!videoUrl) {
      return NextResponse.json(
        { error: "Cloudflare AI completed the request but returned no video URL." },
        { status: 502 }
      );
    }

    return NextResponse.json({
      videoUrl,
      model: MODEL,
      clipSeconds,
      message: "AI video generated successfully.",
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unexpected generation error." },
      { status: 500 }
    );
  }
}
