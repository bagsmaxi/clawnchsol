import { NextRequest, NextResponse } from "next/server";
import { launchOnPumpFun } from "@/lib/pumpfun";
import { getPlatformKeypair } from "@/lib/scanner/wallet";
import { addPlatformToken } from "@/lib/scanner/redis";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, symbol, description, imageUrl, twitter, website } = body;

    if (!name || !symbol || !description || !imageUrl) {
      return NextResponse.json(
        { success: false, error: "name, symbol, description, and imageUrl are required" },
        { status: 400 }
      );
    }

    const walletKeypair = getPlatformKeypair();

    const result = await launchOnPumpFun({
      name: name.slice(0, 32),
      symbol: symbol.toUpperCase().slice(0, 10),
      description: description.slice(0, 1000),
      imageUrl,
      twitter,
      website,
      walletKeypair,
    });

    // Track token
    await addPlatformToken(result.tokenMint).catch(() => {});

    return NextResponse.json({
      success: true,
      data: {
        tokenMint: result.tokenMint,
        signature: result.signature,
        pumpFunUrl: `https://pump.fun/coin/${result.tokenMint}`,
      },
    });
  } catch (error: unknown) {
    const msg =
      error instanceof Error ? error.message : "Launch failed";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
