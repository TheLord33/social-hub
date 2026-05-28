"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  useEffect(() => { router.replace("/dashboard"); }, [router]);
  return (
    <div style={{ display: "none" }}>
      tiktok-developers-site-verification=IIhVBmZ5nry1Zc6HZXCXuUBZoBvxfr2s
    </div>
  );
}
