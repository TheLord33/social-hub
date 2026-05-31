import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "SocialHub — Post Everywhere, Track Everything",
    short_name: "SocialHub",
    description: "Manage and publish to all your social media platforms from one place.",
    start_url: "/dashboard",
    display: "standalone",
    background_color: "#080810",
    theme_color: "#7c3aed",
    orientation: "portrait-primary",
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
