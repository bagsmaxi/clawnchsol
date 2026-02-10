import { NextRequest, NextResponse } from "next/server";
import { Connection } from "@solana/web3.js";

function getRpcUrl(): string {
  return process.env.SOLANA_RPC_URL || "https://api.mainnet-beta.solana.com";
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { transaction } = body;

    if (!transaction) {
      return NextResponse.json(
        { success: false, error: "transaction required" },
        { status: 400 }
      );
    }

    // Decode base64 transaction and send to Solana RPC
    const txBytes = Buffer.from(transaction, "base64");
    const connection = new Connection(getRpcUrl(), "confirmed");
    const signature = await connection.sendRawTransaction(txBytes, {
      skipPreflight: false,
      maxRetries: 2,
    });

    return NextResponse.json({ success: true, data: signature });
  } catch (error: unknown) {
    const msg =
      error instanceof Error ? error.message : "Send transaction failed";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
