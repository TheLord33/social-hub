import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const topic = req.nextUrl.searchParams.get("topic")?.trim();
  if (!topic) return Response.json({ error: "topic required" }, { status: 400 });

  const headers = {
    "User-Agent": "web:socialhub:1.0.0",
    Accept: "application/json",
  };

  const q = encodeURIComponent(topic);
  const [srRes, postsRes] = await Promise.all([
    fetch(`https://www.reddit.com/search.json?q=${q}&type=sr&limit=8&sort=relevance`, { headers }),
    fetch(`https://www.reddit.com/search.json?q=${q}&sort=top&t=week&limit=10&type=link`, { headers }),
  ]);

  if (!srRes.ok || !postsRes.ok) {
    return Response.json({ error: "Reddit API error" }, { status: 502 });
  }

  const [srData, postsData] = await Promise.all([srRes.json(), postsRes.json()]);

  const subreddits = (srData.data?.children ?? [])
    .filter((c: any) => !c.data.over18)
    .map((c: any) => ({
      name: c.data.display_name,
      title: c.data.title,
      description: c.data.public_description,
      subscribers: c.data.subscribers,
      url: `https://reddit.com${c.data.url}`,
    }));

  const posts = (postsData.data?.children ?? []).map((c: any) => ({
    title: c.data.title,
    subreddit: c.data.subreddit,
    score: c.data.score,
    numComments: c.data.num_comments,
    url: `https://reddit.com${c.data.permalink}`,
    author: c.data.author,
  }));

  return Response.json({ subreddits, posts });
}
