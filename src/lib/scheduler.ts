import { getPendingDue, markPublished, markFailed } from "./scheduled-store";
import { publishAll } from "./post-engine";

let started = false;

async function processDue() {
  const due = await getPendingDue();
  if (due.length === 0) return;

  console.log(`[SocialHub scheduler] Processing ${due.length} due post(s)`);

  for (const post of due) {
    try {
      const results = await publishAll({
        content: post.content,
        platforms: post.platforms,
        mediaType: post.mediaType,
        mediaUrl: post.mediaUrl,
        redditSubreddit: post.redditSubreddit,
        redditTitle: post.redditTitle,
      });

      if (results.some((r) => r.success)) {
        await markPublished(post.id, results);
        console.log(`[SocialHub scheduler] Published ${post.id}`);
      } else {
        await markFailed(post.id, results);
        console.log(`[SocialHub scheduler] Failed ${post.id}`);
      }
    } catch (err) {
      await markFailed(post.id, [{ platform: "all", success: false, error: String(err) }]);
    }
  }
}

export function startScheduler() {
  if (started) return;
  started = true;
  console.log("[SocialHub scheduler] Started — checking every 30s");
  processDue();
  setInterval(processDue, 30_000);
}
