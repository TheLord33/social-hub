export type Platform =
  | "twitter"
  | "instagram"
  | "facebook"
  | "linkedin"
  | "tiktok"
  | "youtube"
  | "reddit";

export interface PlatformConfig {
  id: Platform;
  name: string;
  color: string;
  gradient: string;
  textColor: string;
  charLimit: number;
  connected: boolean;
  handle: string;
  followers: number;
  avatar: string;
}

export interface Post {
  id: string;
  content: string;
  platforms: Platform[];
  status: "published" | "scheduled" | "draft";
  publishedAt: Date;
  scheduledFor?: Date;
  media?: string[];
  metrics: Record<Platform, PlatformMetrics>;
}

export interface PlatformMetrics {
  views: number;
  likes: number;
  comments: number;
  shares: number;
  clicks: number;
}

export const PLATFORMS: PlatformConfig[] = [
  {
    id: "twitter",
    name: "X (Twitter)",
    color: "#000000",
    gradient: "from-gray-800 to-black",
    textColor: "text-white",
    charLimit: 280,
    connected: true,
    handle: "@socialhub",
    followers: 12400,
    avatar: "X",
  },
  {
    id: "instagram",
    name: "Instagram",
    color: "#E1306C",
    gradient: "from-purple-600 via-pink-500 to-orange-400",
    textColor: "text-white",
    charLimit: 2200,
    connected: true,
    handle: "@socialhub",
    followers: 38700,
    avatar: "In",
  },
  {
    id: "facebook",
    name: "Facebook",
    color: "#1877F2",
    gradient: "from-blue-600 to-blue-500",
    textColor: "text-white",
    charLimit: 63206,
    connected: true,
    handle: "SocialHub Page",
    followers: 5200,
    avatar: "Fb",
  },
  {
    id: "linkedin",
    name: "LinkedIn",
    color: "#0A66C2",
    gradient: "from-sky-700 to-blue-600",
    textColor: "text-white",
    charLimit: 3000,
    connected: true,
    handle: "SocialHub",
    followers: 8900,
    avatar: "Li",
  },
  {
    id: "tiktok",
    name: "TikTok",
    color: "#010101",
    gradient: "from-gray-900 to-gray-800",
    textColor: "text-white",
    charLimit: 2200,
    connected: false,
    handle: "@socialhub",
    followers: 0,
    avatar: "Tk",
  },
  {
    id: "reddit",
    name: "Reddit",
    color: "#FF4500",
    gradient: "from-orange-600 to-red-500",
    textColor: "text-white",
    charLimit: 40000,
    connected: false,
    handle: "u/socialhub",
    followers: 0,
    avatar: "Re",
  },
  {
    id: "youtube",
    name: "YouTube",
    color: "#FF0000",
    gradient: "from-red-600 to-red-500",
    textColor: "text-white",
    charLimit: 5000,
    connected: false,
    handle: "SocialHub Channel",
    followers: 0,
    avatar: "YT",
  },
];

const ZERO: PlatformMetrics = { views: 0, likes: 0, comments: 0, shares: 0, clicks: 0 };

function randomMetrics(base: number): PlatformMetrics {
  const r = (min: number, max: number) =>
    Math.floor(Math.random() * (max - min) + min);
  return {
    views: base + r(0, base * 0.8),
    likes: Math.floor(base * 0.04 + r(0, base * 0.02)),
    comments: Math.floor(base * 0.008 + r(0, base * 0.005)),
    shares: Math.floor(base * 0.012 + r(0, base * 0.008)),
    clicks: Math.floor(base * 0.06 + r(0, base * 0.03)),
  };
}

export const MOCK_POSTS: Post[] = [
  {
    id: "1",
    content:
      "Excited to share our latest product update! We've added dark mode, faster load times, and a brand new analytics dashboard. Check it out and let us know what you think! 🚀",
    platforms: ["twitter", "instagram", "linkedin"],
    status: "published",
    publishedAt: new Date(Date.now() - 2 * 3600000),
    metrics: {
      twitter: randomMetrics(4200),
      instagram: randomMetrics(9800),
      facebook: ZERO,
      linkedin: randomMetrics(3100),
      tiktok: ZERO,
      reddit: ZERO,
      youtube: ZERO,
    },
  },
  {
    id: "2",
    content:
      "Happy Monday! Here are 5 tips to boost your social media engagement this week:\n\n1. Post consistently\n2. Engage with comments\n3. Use trending hashtags\n4. Share behind-the-scenes content\n5. Collaborate with creators\n\nWhich tip will you try first?",
    platforms: ["twitter", "facebook", "linkedin"],
    status: "published",
    publishedAt: new Date(Date.now() - 24 * 3600000),
    metrics: {
      twitter: randomMetrics(8700),
      instagram: ZERO,
      facebook: randomMetrics(6200),
      linkedin: randomMetrics(11400),
      tiktok: ZERO,
      reddit: ZERO,
      youtube: ZERO,
    },
  },
  {
    id: "3",
    content:
      "We just hit 50K followers across all platforms! 🎉 Thank you for being part of our journey. Huge giveaway dropping this Friday — stay tuned!",
    platforms: ["twitter", "instagram", "facebook"],
    status: "published",
    publishedAt: new Date(Date.now() - 3 * 24 * 3600000),
    metrics: {
      twitter: randomMetrics(22000),
      instagram: randomMetrics(41000),
      facebook: randomMetrics(14000),
      linkedin: ZERO,
      tiktok: ZERO,
      reddit: ZERO,
      youtube: ZERO,
    },
  },
  {
    id: "4",
    content:
      "Behind the scenes: How we built our real-time analytics engine using WebSockets and React. Full blog post link in bio!",
    platforms: ["linkedin", "twitter"],
    status: "scheduled",
    publishedAt: new Date(),
    scheduledFor: new Date(Date.now() + 4 * 3600000),
    metrics: {
      twitter: ZERO,
      instagram: ZERO,
      facebook: ZERO,
      linkedin: ZERO,
      tiktok: ZERO,
      reddit: ZERO,
      youtube: ZERO,
    },
  },
];

export const CHART_DATA = Array.from({ length: 14 }, (_, i) => {
  const date = new Date();
  date.setDate(date.getDate() - (13 - i));
  return {
    date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    twitter: Math.floor(3000 + Math.random() * 8000),
    instagram: Math.floor(6000 + Math.random() * 15000),
    facebook: Math.floor(2000 + Math.random() * 6000),
    linkedin: Math.floor(1500 + Math.random() * 5000),
  };
});

export const TOTAL_STATS = {
  totalViews: 284700,
  totalFollowers: 65200,
  totalPosts: 47,
  avgEngagement: 4.8,
  viewsGrowth: 23.5,
  followersGrowth: 12.1,
  postsGrowth: 8.3,
  engagementGrowth: -1.2,
};
