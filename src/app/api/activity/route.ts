import { NextRequest, NextResponse } from "next/server";
import { getRecentActivity, getLastRun } from "@/lib/scanner/redis";

export async function GET(req: NextRequest) {
  try {
    const limit = parseInt(
      req.nextUrl.searchParams.get("limit") || "20",
      10
    );
    const [activity, lastRun] = await Promise.all([
      getRecentActivity(Math.min(limit, 50)),
      getLastRun(),
    ]);
    return NextResponse.json({ success: true, data: { activity, lastRun } });
  } catch (error) {
    const msg =
      error instanceof Error ? error.message : "Failed to fetch activity";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
