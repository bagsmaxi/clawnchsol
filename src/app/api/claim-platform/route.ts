import { NextRequest, NextResponse } from "next/server";
import {
  getClaimablePositions,
  getClaimTransactions,
  sendTransaction,
} from "@/lib/bags";
import {
  getPlatformWalletAddress,
  signTransaction,
} from "@/lib/scanner/wallet";

export async function GET() {
  try {
    const wallet = getPlatformWalletAddress();
    const positions = await getClaimablePositions(wallet);

    const claimable = positions.filter(
      (p) => Number(p.totalClaimableLamportsUserShare) > 0
    );

    const totalLamports = claimable.reduce(
      (sum, p) => sum + Number(p.totalClaimableLamportsUserShare),
      0
    );

    return NextResponse.json({
      success: true,
      data: {
        wallet,
        totalPositions: positions.length,
        claimablePositions: claimable.length,
        totalClaimableLamports: totalLamports,
        totalClaimableSOL: (totalLamports / 1e9).toFixed(6),
        positions: claimable,
      },
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Failed to check claims";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    // Protect with CRON_SECRET
    const authHeader = req.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const wallet = getPlatformWalletAddress();
    const positions = await getClaimablePositions(wallet);

    const claimable = positions.filter(
      (p) => Number(p.totalClaimableLamportsUserShare) > 0
    );

    if (claimable.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No claimable fees",
        claimed: 0,
      });
    }

    const results: Array<{
      tokenMint: string;
      lamports: number;
      signatures: string[];
      error?: string;
    }> = [];

    for (const position of claimable) {
      try {
        const claimTxs = await getClaimTransactions(wallet, position.baseMint);

        const signatures: string[] = [];
        if (claimTxs?.length > 0) {
          for (const entry of claimTxs) {
            const signed = signTransaction(entry.tx);
            const sig = await sendTransaction(signed);
            signatures.push(sig);
          }
        }

        results.push({
          tokenMint: position.baseMint,
          lamports: Number(position.totalClaimableLamportsUserShare),
          signatures,
        });
      } catch (e) {
        results.push({
          tokenMint: position.baseMint,
          lamports: Number(position.totalClaimableLamportsUserShare),
          signatures: [],
          error: e instanceof Error ? e.message : String(e),
        });
      }
    }

    const totalClaimed = results
      .filter((r) => r.signatures.length > 0)
      .reduce((sum, r) => sum + r.lamports, 0);

    return NextResponse.json({
      success: true,
      totalClaimedLamports: totalClaimed,
      totalClaimedSOL: (totalClaimed / 1e9).toFixed(6),
      results,
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Claim failed";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
