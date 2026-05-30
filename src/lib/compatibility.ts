import { Platform } from "./data";

export type MediaType = "text" | "image" | "video";

export interface CompatEntry {
  supported: boolean;
  label?: string;
  note?: string;
  warning?: string;
}

export const COMPATIBILITY: Record<Platform, Record<MediaType, CompatEntry>> = {
  twitter: {
    text:  { supported: true,  label: "Tweet" },
    image: { supported: true,  label: "Photo tweet" },
    video: { supported: true,  label: "Video tweet" },
  },
  facebook: {
    text:  { supported: true,  label: "Text post" },
    image: { supported: true,  label: "Photo post" },
    video: { supported: true,  label: "Video post" },
  },
  instagram: {
    text:  { supported: false, note: "Instagram API requires an image or video — text-only posts aren't supported." },
    image: { supported: true,  label: "Feed post" },
    video: { supported: true,  label: "Reel" },
  },
  linkedin: {
    text:  { supported: true,  label: "Share" },
    image: { supported: true,  label: "Image post" },
    video: { supported: false, note: "LinkedIn video requires binary asset upload, which isn't supported yet." },
  },
  tiktok: {
    text:  { supported: false, note: "TikTok only accepts video content." },
    image: { supported: false, note: "TikTok only accepts video content." },
    video: { supported: true,  label: "TikTok video" },
  },
  reddit: {
    text:  { supported: true,  label: "Text post", warning: "Requires a subreddit and title." },
    image: { supported: true,  label: "Image link", warning: "Posted as a link post. Requires a subreddit and title." },
    video: { supported: true,  label: "Video link", warning: "Posted as a link post. Requires a subreddit and title." },
  },
  youtube: {
    text:  { supported: false, note: "YouTube requires a video — text-only posts aren't supported." },
    image: { supported: false, note: "YouTube only accepts video content." },
    video: { supported: true,  label: "YouTube video", warning: "Requires a video title." },
  },
};

export function isCompatible(platform: Platform, mediaType: MediaType): boolean {
  return COMPATIBILITY[platform]?.[mediaType]?.supported ?? false;
}

export function getLabel(platform: Platform, mediaType: MediaType): string {
  return COMPATIBILITY[platform]?.[mediaType]?.label ?? mediaType;
}

export function getNote(platform: Platform, mediaType: MediaType): string | undefined {
  return COMPATIBILITY[platform]?.[mediaType]?.note;
}

export function filterCompatible(platforms: Platform[], mediaType: MediaType): Platform[] {
  return platforms.filter((p) => isCompatible(p, mediaType));
}
