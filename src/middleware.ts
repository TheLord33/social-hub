import { NextRequest, NextResponse } from "next/server";

const TIKTOK_TOKEN = "tiktok-developers-site-verification=MUQkmeXpTMbp3Z14mLTlnGChxPwiTBVJ";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (
    pathname === "/tiktok-developers-site-verification.txt" ||
    pathname === "/tiktok-developers-site-verification.txt/"
  ) {
    return new NextResponse(TIKTOK_TOKEN, {
      headers: { "Content-Type": "text/plain" },
    });
  }
}

export const config = {
  matcher: ["/tiktok-developers-site-verification.txt", "/tiktok-developers-site-verification.txt/"],
};
