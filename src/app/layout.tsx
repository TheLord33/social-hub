import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Sidebar, MobileNav } from "@/components/sidebar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SocialHub — Post Everywhere, Track Everything",
  description: "Manage and publish to all your social media platforms from one place.",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "SocialHub",
  },
  other: {
    "tiktok-developers-site-verification": "DRrcz63CHYhAHPnKMCzaC4YzFd1LROEC",
    "mobile-web-app-capable": "yes",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <meta name="tiktok-developers-site-verification" content="DRrcz63CHYhAHPnKMCzaC4YzFd1LROEC" />
        <meta name="theme-color" content="#7c3aed" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      </head>
      <body className="min-h-full bg-[#080810] text-white">
        <Sidebar />
        <MobileNav />
        <main className="lg:ml-64 min-h-screen pb-16 lg:pb-0">{children}</main>
      </body>
    </html>
  );
}
