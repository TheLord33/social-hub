import { NextRequest, NextResponse } from "next/server";

const TIKTOK_TOKEN = "tiktok-developers-site-verification=Ko9YS5n8qaCaIZCI3xAxjwqNdARhc2ZN\ntiktok-developers-site-verification=IIhVBmZ5nry1Zc6HZXCXuUBZoBvxfr2s\ntiktok-developers-site-verification=DRrcz63CHYhAHPnKMCzaC4YzFd1LROEC";

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
