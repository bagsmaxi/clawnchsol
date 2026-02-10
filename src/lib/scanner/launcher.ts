import { launchOnPumpFun } from "@/lib/pumpfun";
import { getPlatformKeypair } from "./wallet";
import { addPlatformToken } from "./redis";
import type { ParsedTokenRequest, ScanResult } from "./types";

export async function launchToken(
  request: ParsedTokenRequest
): Promise<ScanResult> {
  const post = request.sourcePost;

  try {
    if (!request.imageUrl) {
      throw new Error("imageUrl is required for Pump.fun launch");
    }

    const walletKeypair = getPlatformKeypair();

    const result = await launchOnPumpFun({
      name: request.name,
      symbol: request.symbol,
      description: request.description,
      imageUrl: request.imageUrl,
      twitter: request.twitter,
      website: request.website,
      walletKeypair,
    });

    // Track token as launched via our platform
    await addPlatformToken(result.tokenMint);

    return {
      platform: post.platform,
      postId: post.postId,
      status: "launched",
      tokenMint: result.tokenMint,
      signature: result.signature,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    return {
      platform: post.platform,
      postId: post.postId,
      status: "error",
      error: error instanceof Error ? error.message : "Launch failed",
      timestamp: new Date().toISOString(),
    };
  }
}
