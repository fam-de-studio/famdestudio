import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Image asset guard.
 *
 * Optimised images (/_next/image) and static media (/_next/static/media) may
 * only be loaded by pages of this site. Opening an image URL directly in a
 * tab (Sec-Fetch-Dest: document), or embedding it from another origin, gets a
 * 403. This closes the "open image in new tab / copy image address" route
 * without affecting normal page rendering.
 */
export function proxy(request: NextRequest) {
  const dest = request.headers.get("sec-fetch-dest");
  const site = request.headers.get("sec-fetch-site");

  // Direct navigation to the asset itself (address bar, "open in new tab").
  if (dest === "document") {
    return new NextResponse("Not available", { status: 403 });
  }

  // Hotlinking from another origin.
  if (site === "cross-site") {
    return new NextResponse("Not available", { status: 403 });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/_next/image", "/_next/static/media/:path*", "/img/:path*", "/og.jpg"],
};
