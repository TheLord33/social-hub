import { NextRequest } from "next/server";
import { refreshRedditIfNeeded } from "@/lib/tokens";
import { auth } from "@/auth";

async function getAppOnlyToken(): Promise<string | null> {
  const clientId = process.env.REDDIT_CLIENT_ID;
  const clientSecret = process.env.REDDIT_CLIENT_SECRET;
  if (!clientId || !clientSecret) return null;

  const creds = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
  const res = await fetch("https://www.reddit.com/api/v1/access_token", {
    method: "POST",
    headers: { Authorization: `Basic ${creds}`, "Content-Type": "application/x-www-form-urlencoded", "User-Agent": "web:socialhub:1.0.0" },
    body: "grant_type=client_credentials",
  });
  if (!res.ok) return null;
  const data = await res.json();
  return data.access_token ?? null;
}

export async function GET(req: NextRequest) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const topic = req.nextUrl.searchParams.get("topic")?.trim();
  if (!topic) return Response.json({ error: "topic required" }, { status: 400 });

  let accessToken = await refreshRedditIfNeeded(userId);
  if (!accessToken) accessToken = await getAppOnlyToken();
  if (!accessToken) return Response.json({ error: "reddit_not_configured" }, { status: 401 });

  const headers = { Authorization: `Bearer ${accessToken}`, "User-Agent": "web:socialhub:1.0.0", Accept: "application/json" };
  const q = encodeURIComponent(topic);

  const [srRes, postsRes] = await Promise.all([
    fetch(`https://oauth.reddit.com/search?q=${q}&type=sr&limit=8&sort=relevance`, { headers }),
    fetch(`https://oauth.reddit.com/search?q=${q}&sort=top&t=week&limit=10&type=link`, { headers }),
  ]);

  if (!srRes.ok || !postsRes.ok) return Response.json({ error: "Reddit API error" }, { status: 502 });

  const [srData, postsData] = await Promise.all([srRes.json(), postsRes.json()]);

  const subreddits = (srData.data?.children ?? [])
    .filter((c: { data: { over18: boolean } }) => !c.data.over18)
    .map((c: { data: { display_name: string; title: string; public_description: string; subscribers: number; url: string } }) => ({
      name: c.data.display_name,
      title: c.data.title,
      description: c.data.public_description,
      subscribers: c.data.subscribers,
      url: `https://reddit.com${c.data.url}`,
    }));

  const posts = (postsData.data?.children ?? []).map((c: { data: { title: string; subreddit: string; score: number; num_comments: number; permalink: string; author: string } }) => ({
    title: c.data.title,
    subreddit: c.data.subreddit,
    score: c.data.score,
    numComments: c.data.num_comments,
    url: `https://reddit.com${c.data.permalink}`,
    author: c.data.author,
  }));

  return Response.json({ subreddits, posts });
}
