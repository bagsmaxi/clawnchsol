import type { SocialPost, PlatformId } from "./types";

const FETCH_TIMEOUT = 4000; // 4 seconds per platform

function makeAbortController(): AbortController {
  const controller = new AbortController();
  setTimeout(() => controller.abort(), FETCH_TIMEOUT);
  return controller;
}

async function fetchMoltbook(): Promise<SocialPost[]> {
  const controller = makeAbortController();
  const headers: Record<string, string> = {};
  if (process.env.MOLTBOOK_API_TOKEN) {
    headers["Authorization"] = `Bearer ${process.env.MOLTBOOK_API_TOKEN}`;
  }

  const res = await fetch(
    "https://www.moltbook.com/api/v1/posts?submolt=clawnch&sort=new&limit=20",
    { signal: controller.signal, headers }
  );

  if (!res.ok) return [];
  const data = await res.json();
  const posts = Array.isArray(data) ? data : data.posts || data.data || [];

  return posts.map(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (item: any): SocialPost => ({
      platform: "moltbook" as PlatformId,
      postId: String(item.id || item._id),
      author:
        (typeof item.author === "object" ? item.author?.name : item.author) ||
        item.username ||
        "unknown",
      content: item.content || item.body || item.text || "",
      imageUrl: item.image || item.imageUrl || item.media,
      timestamp:
        item.createdAt || item.created_at || new Date().toISOString(),
      url: `https://www.moltbook.com/post/${item.id || item._id}`,
    })
  );
}

async function fetchFourclaw(): Promise<SocialPost[]> {
  const controller = makeAbortController();
  const headers: Record<string, string> = {};
  if (process.env.FOURCLAW_API_TOKEN) {
    headers["Authorization"] = `Bearer ${process.env.FOURCLAW_API_TOKEN}`;
  }

  // 4claw requires auth — skip if no token
  if (!headers["Authorization"]) return [];

  const res = await fetch(
    "https://www.4claw.org/api/v1/boards/crypto/threads?limit=20&includeContent=1",
    { signal: controller.signal, headers }
  );

  if (!res.ok) return [];
  const data = await res.json();
  const threads = Array.isArray(data)
    ? data
    : data.threads || data.data || [];

  return threads.map(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (item: any): SocialPost => ({
      platform: "4claw" as PlatformId,
      postId: String(item.id || item.number || item._id),
      author: item.author || item.name || item.title || "anon",
      content: item.content || item.body || item.text || item.op || "",
      imageUrl: item.image || item.media || item.imageUrl,
      timestamp:
        item.createdAt || item.bumpedAt || item.created_at || new Date().toISOString(),
      url: `https://www.4claw.org/b/crypto/thread/${item.id || item.number || item._id}`,
    })
  );
}

async function fetchMoltx(): Promise<SocialPost[]> {
  const controller = makeAbortController();
  const headers: Record<string, string> = {};
  if (process.env.MOLTX_API_TOKEN) {
    headers["Authorization"] = `Bearer ${process.env.MOLTX_API_TOKEN}`;
  }

  const res = await fetch(
    "https://moltx.io/v1/search/posts?q=!clawnch&limit=20",
    { signal: controller.signal, headers }
  );

  if (!res.ok) return [];
  const data = await res.json();

  // MoltX wraps posts in data.data.posts
  const posts = Array.isArray(data)
    ? data
    : data.data?.posts || data.posts || data.data || [];

  // Handle case where posts is still not an array
  if (!Array.isArray(posts)) return [];

  return posts.map(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (item: any): SocialPost => ({
      platform: "moltx" as PlatformId,
      postId: String(item.id || item._id),
      author:
        item.author_name ||
        item.author_display_name ||
        item.author ||
        item.username ||
        "unknown",
      content: item.content || item.body || item.text || "",
      imageUrl: item.media_url || item.image || item.imageUrl || item.media,
      timestamp:
        item.created_at || item.createdAt || new Date().toISOString(),
      url: `https://moltx.io/post/${item.id || item._id}`,
    })
  );
}

export async function fetchAllPlatforms(): Promise<SocialPost[]> {
  const results = await Promise.allSettled([
    fetchMoltbook(),
    fetchFourclaw(),
    fetchMoltx(),
  ]);

  const posts: SocialPost[] = [];
  for (const result of results) {
    if (result.status === "fulfilled") {
      posts.push(...result.value);
    }
  }

  // Sort by newest first
  posts.sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  return posts;
}
