import { NextRequest, NextResponse } from "next/server";

const MAX_BODY_BYTES = 2_000_000;

export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  const requestId = crypto.randomUUID();

  response.headers.set("X-Request-ID", requestId);

  const contentLength = Number(request.headers.get("content-length") || "0");
  if (contentLength > MAX_BODY_BYTES) {
    return NextResponse.json({ error: "Request body too large." }, { status: 413 });
  }

  // Do not allow unsafe cross-origin browser mutations.
  if (["POST", "PUT", "PATCH", "DELETE"].includes(request.method)) {
    const origin = request.headers.get("origin");
    if (origin && origin !== request.nextUrl.origin) {
      return NextResponse.json({ error: "Cross-origin request blocked." }, { status: 403 });
    }
  }

  return response;
}

export const config = {
  matcher: ["/api/:path*", "/((?!_next/static|_next/image|favicon.ico).*)"],
};
