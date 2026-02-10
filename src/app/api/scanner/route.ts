import { NextRequest, NextResponse } from "next/server";
import { fetchAllPlatforms } from "@/lib/scanner/platforms";
import { parsePost } from "@/lib/scanner/parser";
import { launchToken } from "@/lib/scanner/launcher";
import {
  isProcessed,
  markProcessed,
  addActivity,
  setLastRun,
} from "@/lib/scanner/redis";
import type { ActivityEntry, ScanResult } from "@/lib/scanner/types";

export const maxDuration = 60; // Allow up to 60s on Pro, 10s on Hobby

export async function GET(req: NextRequest) {
  // Protect endpoint: verify cron secret (header or query param)
  const authHeader = req.headers.get("authorization");
  const querySecret = req.nextUrl.searchParams.get("secret");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}` && querySecret !== cronSecret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const debug = req.nextUrl.searchParams.get("debug") === "1";
  const results: ScanResult[] = [];
  let launchCount = 0;
  const MAX_LAUNCHES = 3; // Up to 3 launches per invocation
  const debugInfo: Record<string, unknown> = {};
  const errors: string[] = [];

  try {
    // 1. Fetch posts from all 3 platforms in parallel
    const posts = await fetchAllPlatforms();

    if (debug) {
      debugInfo.totalPosts = posts.length;
      debugInfo.platforms = posts.reduce((acc, p) => {
        acc[p.platform] = (acc[p.platform] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      debugInfo.firstPost = posts[0]
        ? {
            platform: posts[0].platform,
            postId: posts[0].postId,
            contentPreview: posts[0].content.slice(0, 200),
          }
        : null;
    }

    // 2. Process posts — per-post error handling so one failure doesn't kill the run
    for (const post of posts) {
      try {
        // Check if already processed
        if (await isProcessed(post.platform, post.postId)) {
          continue;
        }

        // Parse the post for token metadata
        const parsed = parsePost(post);
        if (!parsed) {
          await markProcessed(post.platform, post.postId);
          results.push({
            platform: post.platform,
            postId: post.postId,
            status: "invalid",
            timestamp: new Date().toISOString(),
          });
          continue;
        }

        // Stop if we've already launched enough
        if (launchCount >= MAX_LAUNCHES) break;

        // Launch the token
        const result = await launchToken(parsed);
        results.push(result);

        if (result.status === "launched") {
          await markProcessed(post.platform, post.postId);

          const activity: ActivityEntry = {
            platform: post.platform,
            postId: post.postId,
            postUrl: post.url,
            author: post.author,
            tokenName: parsed.name,
            tokenSymbol: parsed.symbol,
            tokenMint: result.tokenMint!,
            signature: result.signature!,
            launchedAt: result.timestamp,
          };
          await addActivity(activity);
          launchCount++;
        } else {
          // Launch failed — mark processed to avoid retrying the same broken post
          await markProcessed(post.platform, post.postId);
        }
      } catch (postError) {
        const msg = postError instanceof Error ? postError.message : String(postError);
        errors.push(`${post.platform}:${post.postId}: ${msg}`);
        // Mark as processed so we don't retry a permanently broken post
        try { await markProcessed(post.platform, post.postId); } catch { /* ignore */ }
        results.push({
          platform: post.platform,
          postId: post.postId,
          status: "error",
          error: msg,
          timestamp: new Date().toISOString(),
        });
      }
    }

    await setLastRun();
  } catch (error) {
    console.error("Scanner error:", error);
    if (debug) {
      debugInfo.error = error instanceof Error ? error.message : String(error);
    }
  }

  if (debug) {
    debugInfo.errors = errors;
  }

  return NextResponse.json({
    success: true,
    results,
    postsScanned: results.length,
    tokensLaunched: launchCount,
    ...(debug ? { debug: debugInfo } : {}),
  });
}
