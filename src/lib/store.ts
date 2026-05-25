"use client";
import { create } from "zustand";
import { Post, Platform, MOCK_POSTS } from "./data";

interface Store {
  posts: Post[];
  selectedPlatforms: Platform[];
  draftContent: string;
  togglePlatform: (p: Platform) => void;
  setDraftContent: (c: string) => void;
  publishPost: (content: string, platforms: Platform[]) => void;
  clearDraft: () => void;
}

export const useStore = create<Store>((set) => ({
  posts: MOCK_POSTS,
  selectedPlatforms: ["twitter", "instagram", "linkedin"],
  draftContent: "",

  togglePlatform: (p) =>
    set((s) => ({
      selectedPlatforms: s.selectedPlatforms.includes(p)
        ? s.selectedPlatforms.filter((x) => x !== p)
        : [...s.selectedPlatforms, p],
    })),

  setDraftContent: (c) => set({ draftContent: c }),

  publishPost: (content, platforms) =>
    set((s) => ({
      posts: [
        {
          id: Date.now().toString(),
          content,
          platforms,
          status: "published",
          publishedAt: new Date(),
          metrics: {
            twitter:   { views: 0, likes: 0, comments: 0, shares: 0, clicks: 0 },
            instagram: { views: 0, likes: 0, comments: 0, shares: 0, clicks: 0 },
            facebook:  { views: 0, likes: 0, comments: 0, shares: 0, clicks: 0 },
            linkedin:  { views: 0, likes: 0, comments: 0, shares: 0, clicks: 0 },
            tiktok:    { views: 0, likes: 0, comments: 0, shares: 0, clicks: 0 },
            reddit:    { views: 0, likes: 0, comments: 0, shares: 0, clicks: 0 },
            youtube:   { views: 0, likes: 0, comments: 0, shares: 0, clicks: 0 },
          },
        },
        ...s.posts,
      ],
      draftContent: "",
      selectedPlatforms: ["twitter", "instagram", "linkedin"],
    })),

  clearDraft: () => set({ draftContent: "" }),
}));
