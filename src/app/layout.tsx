import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/sidebar";

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
  other: {
    "tiktok-developers-site-verification": "DRrcz63CHYhAHPnKMCzaC4YzFd1LROEC",
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
      </head>
      <body className="min-h-full bg-[#080810] text-white">
        <Sidebar />
        <main className="ml-64 min-h-screen">{children}</main>
      </body>
    </html>
  );
}
