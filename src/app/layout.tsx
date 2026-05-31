import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { headers } from "next/headers";
import "./globals.css";
import { Sidebar, MobileNav } from "@/components/sidebar";
import { Providers } from "@/components/providers";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SocialHub — Post Everywhere, Track Everything",
  description: "Manage and publish to all your social media platforms from one place.",
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, statusBarStyle: "black-translucent", title: "SocialHub" },
  other: {
    "tiktok-developers-site-verification": "DRrcz63CHYhAHPnKMCzaC4YzFd1LROEC",
    "mobile-web-app-capable": "yes",
  },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const headersList = await headers();
  const pathname = headersList.get("x-pathname") ?? "";
  const isAuthPage = pathname === "/login" || pathname === "/register";

  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <head>
        <meta name="tiktok-developers-site-verification" content="DRrcz63CHYhAHPnKMCzaC4YzFd1LROEC" />
        <meta name="theme-color" content="#7c3aed" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      </head>
      <body className="min-h-full bg-[#080810] text-white">
        <Providers>
          {!isAuthPage && <Sidebar />}
          {!isAuthPage && <MobileNav />}
          <main className={isAuthPage ? "min-h-screen" : "lg:ml-64 min-h-screen pb-16 lg:pb-0"}>
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}
