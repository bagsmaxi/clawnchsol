import { NextResponse } from "next/server";
import { getPlatformTokens } from "@/lib/scanner/redis";
import { Connection, PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { getPlatformWalletAddress } from "@/lib/scanner/wallet";

function getRpcUrl(): string {
  return process.env.SOLANA_RPC_URL || "https://api.mainnet-beta.solana.com";
}

export async function GET() {
  try {
    const wallet = getPlatformWalletAddress();
    const connection = new Connection(getRpcUrl(), "confirmed");

    // Get platform wallet SOL balance
    let balanceLamports = 0;
    try {
      balanceLamports = await connection.getBalance(new PublicKey(wallet));
    } catch { /* ignore */ }

    // Get count of tokens launched
    let tokensLaunched = 0;
    try {
      const tokens = await getPlatformTokens();
      tokensLaunched = tokens.length;
    } catch { /* ignore */ }

    return NextResponse.json({
      success: true,
      data: {
        wallet,
        balanceLamports: balanceLamports.toString(),
        balanceSOL: (balanceLamports / LAMPORTS_PER_SOL).toFixed(6),
        tokensLaunched,
      },
    });
  } catch (error: unknown) {
    const msg =
      error instanceof Error ? error.message : "Failed to fetch stats";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
