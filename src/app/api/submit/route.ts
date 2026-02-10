import { NextRequest, NextResponse } from "next/server";
import { isProcessed, markProcessed, addActivity } from "@/lib/scanner/redis";
import { launchToken } from "@/lib/scanner/launcher";
import type { ParsedTokenRequest, ActivityEntry } from "@/lib/scanner/types";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { platform, postId, name, symbol, wallet, description, imageUrl, website, twitter } =
      body;

    // Validate required fields
    if (!name || !symbol || !description || !imageUrl) {
      return NextResponse.json(
        { success: false, error: "name, symbol, description, and imageUrl are required" },
        { status: 400 }
      );
    }

    // Check for duplicate if postId provided
    const effectivePostId = postId || `manual-${Date.now()}`;
    const effectivePlatform = platform || "manual";

    if (postId && (await isProcessed(effectivePlatform, postId))) {
      return NextResponse.json(
        { success: false, error: "Post already processed" },
        { status: 409 }
      );
    }

    const request: ParsedTokenRequest = {
      name: name.slice(0, 32),
      symbol: symbol.toUpperCase().slice(0, 10),
      description: description.slice(0, 1000),
      imageUrl,
      website,
      twitter,
      creatorWallet: wallet || undefined,
      sourcePost: {
        platform: effectivePlatform,
        postId: effectivePostId,
        author: "manual",
        content: "",
        timestamp: new Date().toISOString(),
        url: "",
      },
    };

    const result = await launchToken(request);

    if (result.status === "launched") {
      await markProcessed(effectivePlatform, effectivePostId);
      const activity: ActivityEntry = {
        platform: effectivePlatform,
        postId: effectivePostId,
        postUrl: "",
        author: "manual",
        tokenName: name,
        tokenSymbol: symbol.toUpperCase().slice(0, 10),
        tokenMint: result.tokenMint!,
        signature: result.signature!,
        launchedAt: result.timestamp,
      };
      await addActivity(activity);
    }

    return NextResponse.json({
      success: result.status === "launched",
      data: result,
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Submit failed";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
