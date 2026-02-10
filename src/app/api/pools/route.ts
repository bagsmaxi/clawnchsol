import { NextRequest, NextResponse } from "next/server";
import { getPools } from "@/lib/bags";
import { getPlatformTokens } from "@/lib/scanner/redis";

export async function GET(req: NextRequest) {
  try {
    const onlyMigrated =
      req.nextUrl.searchParams.get("onlyMigrated") === "true";

    // Fetch pools and our platform tokens in parallel
    const [pools, platformTokens] = await Promise.all([
      getPools(onlyMigrated),
      getPlatformTokens().catch(() => [] as string[]),
    ]);

    // If we have tracked platform tokens, filter to only show those
    // If Redis is empty/unavailable, show nothing (not all tokens)
    const tokenSet = new Set(platformTokens);
    const filtered = pools.filter((p) => tokenSet.has(p.tokenMint));

    return NextResponse.json({ success: true, data: filtered });
  } catch (error: unknown) {
    const msg =
      error instanceof Error ? error.message : "Failed to fetch pools";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
