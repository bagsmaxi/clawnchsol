import { Keypair, Connection, VersionedTransaction } from "@solana/web3.js";

const PUMP_IPFS_URL = "https://pump.fun/api/ipfs";
const PUMPPORTAL_LOCAL_URL = "https://pumpportal.fun/api/trade-local";

function getRpcUrl(): string {
  return (
    process.env.SOLANA_RPC_URL || "https://api.mainnet-beta.solana.com"
  );
}

/**
 * Download an image from a URL and return it as a Blob with proper filename.
 */
async function fetchImageAsBlob(
  url: string
): Promise<{ blob: Blob; filename: string }> {
  const res = await fetch(url, { signal: AbortSignal.timeout(10000) });
  if (!res.ok) throw new Error(`Failed to fetch image: ${res.status}`);
  const contentType = res.headers.get("content-type") || "image/png";
  const buffer = await res.arrayBuffer();
  const ext = contentType.includes("jpeg") || contentType.includes("jpg")
    ? "jpg"
    : contentType.includes("gif")
      ? "gif"
      : contentType.includes("webp")
        ? "webp"
        : "png";
  const blob = new Blob([buffer], { type: contentType });
  return { blob, filename: `token.${ext}` };
}

/**
 * Upload token metadata + image to Pump.fun IPFS.
 * Returns the metadataUri to use in the create transaction.
 */
export async function uploadMetadata(params: {
  name: string;
  symbol: string;
  description: string;
  imageUrl: string;
  twitter?: string;
  telegram?: string;
  website?: string;
}): Promise<{ metadataUri: string; metadata: { name: string; symbol: string } }> {
  // Download the image
  const { blob, filename } = await fetchImageAsBlob(params.imageUrl);

  const formData = new FormData();
  formData.append("file", blob, filename);
  formData.append("name", params.name);
  formData.append("symbol", params.symbol);
  formData.append("description", params.description);
  if (params.twitter) formData.append("twitter", params.twitter);
  if (params.telegram) formData.append("telegram", params.telegram);
  if (params.website) formData.append("website", params.website);
  formData.append("showName", "true");

  const res = await fetch(PUMP_IPFS_URL, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`IPFS upload failed (${res.status}): ${text}`);
  }

  const data = await res.json();
  if (!data.metadataUri) {
    throw new Error(`IPFS upload returned no metadataUri: ${JSON.stringify(data)}`);
  }

  return {
    metadataUri: data.metadataUri,
    metadata: data.metadata || { name: params.name, symbol: params.symbol },
  };
}

/**
 * Get an unsigned token creation transaction from PumpPortal.
 * Returns raw transaction bytes ready to be signed.
 */
export async function createTokenTransaction(params: {
  publicKey: string;
  name: string;
  symbol: string;
  metadataUri: string;
  mintPublicKey: string;
}): Promise<Uint8Array> {
  const res = await fetch(PUMPPORTAL_LOCAL_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      publicKey: params.publicKey,
      action: "create",
      tokenMetadata: {
        name: params.name,
        symbol: params.symbol,
        uri: params.metadataUri,
      },
      mint: params.mintPublicKey,
      denominatedInSol: "true",
      amount: 0,
      slippage: 10,
      priorityFee: 0.0005,
      pool: "pump",
    }),
  });

  if (res.status !== 200) {
    const text = await res.text().catch(() => "");
    throw new Error(`PumpPortal create failed (${res.status}): ${text}`);
  }

  const data = await res.arrayBuffer();
  return new Uint8Array(data);
}

/**
 * Full token launch flow on Pump.fun:
 * 1. Upload metadata to IPFS
 * 2. Generate mint keypair
 * 3. Get unsigned create transaction
 * 4. Sign with mint + wallet keypairs
 * 5. Send to Solana RPC
 *
 * Returns the token mint address and transaction signature.
 */
export async function launchOnPumpFun(params: {
  name: string;
  symbol: string;
  description: string;
  imageUrl: string;
  twitter?: string;
  website?: string;
  walletKeypair: Keypair;
}): Promise<{ tokenMint: string; signature: string }> {
  // Step 1: Upload metadata
  const ipfs = await uploadMetadata({
    name: params.name,
    symbol: params.symbol,
    description: params.description,
    imageUrl: params.imageUrl,
    twitter: params.twitter,
    website: params.website,
  });

  // Step 2: Generate mint keypair
  const mintKeypair = Keypair.generate();

  // Step 3: Get unsigned transaction
  const txBytes = await createTokenTransaction({
    publicKey: params.walletKeypair.publicKey.toBase58(),
    name: ipfs.metadata.name,
    symbol: ipfs.metadata.symbol,
    metadataUri: ipfs.metadataUri,
    mintPublicKey: mintKeypair.publicKey.toBase58(),
  });

  // Step 4: Sign transaction
  const tx = VersionedTransaction.deserialize(txBytes);
  tx.sign([mintKeypair, params.walletKeypair]);

  // Step 5: Send to Solana RPC
  const connection = new Connection(getRpcUrl(), "confirmed");
  const signature = await connection.sendTransaction(tx, {
    skipPreflight: false,
    maxRetries: 2,
  });

  // Wait for confirmation
  const latestBlockhash = await connection.getLatestBlockhash();
  await connection.confirmTransaction(
    {
      signature,
      blockhash: latestBlockhash.blockhash,
      lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
    },
    "confirmed"
  );

  return {
    tokenMint: mintKeypair.publicKey.toBase58(),
    signature,
  };
}
