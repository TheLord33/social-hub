import NextAuth from "next-auth";
import { authConfig } from "./auth.config";
import { NextResponse } from "next/server";

const { auth } = NextAuth(authConfig);

const TIKTOK_TOKEN =
  "tiktok-developers-site-verification=Ko9YS5n8qaCaIZCI3xAxjwqNdARhc2ZN\ntiktok-developers-site-verification=IIhVBmZ5nry1Zc6HZXCXuUBZoBvxfr2s\ntiktok-developers-site-verification=DRrcz63CHYhAHPnKMCzaC4YzFd1LROEC\ntiktok-developers-site-verification=ZBiBQ1jJD08RGzWVd8t80YkEygX2UqTd\ntiktok-developers-site-verification=fnrHzdUMVl6LLPu0HAY1E60lvXLRvhby";

const PUBLIC_PATHS = new Set(["/", "/login", "/register", "/forgot-password", "/reset-password"]);

export default auth((req) => {
  const { pathname } = req.nextUrl;

  // TikTok URL prefix verification — public, no auth
  if (pathname.startsWith("/tiktok-developers-site-verification")) {
    return new NextResponse(TIKTOK_TOKEN, { headers: { "Content-Type": "text/plain" } });
  }

  // Auth.js internal routes — always allow
  if (pathname.startsWith("/api/auth")) return NextResponse.next();

  // Authenticated users leave auth pages
  if (req.auth && (pathname === "/login" || pathname === "/register")) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  // Unauthenticated users go to login
  if (!req.auth && !PUBLIC_PATHS.has(pathname)) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // Pass pathname to the root layout so it can conditionally render the sidebar
  const headers = new Headers(req.headers);
  headers.set("x-pathname", pathname);
  return NextResponse.next({ request: { headers } });
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon\\.ico|.*\\.png|.*\\.svg|.*\\.txt|.*\\.ico).*)"],
};
