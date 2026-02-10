const BAGS_API_BASE = "https://public-api-v2.bags.fm/api/v1";

function getApiKey(): string {
  const key = process.env.BAGS_API_KEY;
  if (!key) throw new Error("BAGS_API_KEY not set");
  return key;
}

function getRpcUrl(): string {
  return (
    process.env.SOLANA_RPC_URL || "https://api.mainnet-beta.solana.com"
  );
}

export function getPartnerConfigKey(): string {
  return process.env.PARTNER_CONFIG_KEY || "";
}

async function apiFetch<T>(
  path: string,
  options?: RequestInit
): Promise<T> {
  const url = `${BAGS_API_BASE}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      "x-api-key": getApiKey(),
      ...(options?.headers || {}),
    },
  });

  const data = await res.json();
  if (!data.success) {
    const errMsg =
      data.error ||
      data.message ||
      (typeof data.errors === "string" ? data.errors : null) ||
      (Array.isArray(data.errors) ? JSON.stringify(data.errors) : null) ||
      JSON.stringify(data);
    throw new Error(errMsg);
  }
  return data.response;
}

// ---- Pools / Token Listing ----

export interface BagsPool {
  tokenMint: string;
  dbcConfigKey: string;
  dbcPoolKey: string;
  dammV2PoolKey: string | null;
}

export async function getPools(
  onlyMigrated = false
): Promise<BagsPool[]> {
  return apiFetch<BagsPool[]>(
    `/solana/bags/pools?onlyMigrated=${onlyMigrated}`
  );
}

// ---- Token Info Creation ----

export interface TokenInfo {
  tokenMint: string;
  tokenMetadata: string;
  tokenLaunch: {
    name: string;
    symbol: string;
    description: string;
    image: string;
    tokenMint: string;
    status: string;
    createdAt: string;
    updatedAt: string;
  };
}

export async function createTokenInfo(formData: FormData): Promise<TokenInfo> {
  return apiFetch<TokenInfo>("/token-launch/create-token-info", {
    method: "POST",
    body: formData,
  });
}

// ---- Fee Share Config (with feeClaimers format from skill doc) ----

export interface FeeClaimer {
  user: string;
  userBps: number;
}

export interface FeeShareConfig {
  needsCreation: boolean;
  feeShareAuthority: string;
  meteoraConfigKey: string;
  transactions: Array<{ blockhash: unknown; transaction: string }>;
  bundles?: unknown[][];
}

export async function createFeeShareConfig(params: {
  payer: string;
  baseMint: string;
  feeClaimers: FeeClaimer[];
  partner?: string;
  partnerConfig?: string;
  additionalLookupTables?: string[];
  tipWallet?: string;
  tipLamports?: number;
}): Promise<FeeShareConfig> {
  // Build parallel arrays from feeClaimers for the API
  const claimersArray = params.feeClaimers.map((c) => c.user);
  const basisPointsArray = params.feeClaimers.map((c) => c.userBps);

  const body: Record<string, unknown> = {
    payer: params.payer,
    baseMint: params.baseMint,
    claimersArray,
    basisPointsArray,
  };

  // ALWAYS include partner config for royalties
  if (params.partner) body.partner = params.partner;
  if (params.partnerConfig) body.partnerConfig = params.partnerConfig;
  if (params.additionalLookupTables)
    body.additionalLookupTables = params.additionalLookupTables;
  if (params.tipWallet) body.tipWallet = params.tipWallet;
  if (params.tipLamports) body.tipLamports = params.tipLamports;

  return apiFetch<FeeShareConfig>("/fee-share/config", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

// ---- Social Identity Wallet Lookup ----

export async function lookupFeeShareWallet(
  provider: "moltbook" | "twitter" | "github",
  username: string
): Promise<string> {
  return apiFetch<string>(
    `/token-launch/fee-share/wallet/v2?provider=${provider}&username=${encodeURIComponent(username)}`
  );
}

export async function lookupFeeShareWalletBulk(
  lookups: Array<{ provider: string; username: string }>
): Promise<unknown[]> {
  return apiFetch<unknown[]>("/token-launch/fee-share/wallet/v2/bulk", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(lookups),
  });
}

// ---- Launch Transaction ----

export async function createLaunchTransaction(params: {
  metadataUrl: string;
  tokenMint: string;
  wallet: string;
  initialBuyLamports: number;
  configKey: string;
  tipWallet?: string;
  tipLamports?: number;
}): Promise<string> {
  // API expects "ipfs" instead of "metadataUrl"
  const { metadataUrl, ...rest } = params;
  return apiFetch<string>("/token-launch/create-launch-transaction", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...rest, ipfs: metadataUrl }),
  });
}

// ---- Send Transaction (via Bags API) ----

export async function sendTransaction(
  transaction: string
): Promise<string> {
  return apiFetch<string>("/solana/send-transaction", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ transaction }),
  });
}

// ---- Trade ----

export interface TradeQuote {
  requestId: string;
  inAmount: string;
  outAmount: string;
  minOutAmount: string;
  priceImpactPct: string;
  slippageBps: number;
  routePlan: unknown[];
  platformFee?: unknown;
  simulatedComputeUnits?: number;
}

export async function getTradeQuote(params: {
  inputMint: string;
  outputMint: string;
  amount: number;
  slippageMode?: string;
  slippageBps?: number;
}): Promise<TradeQuote> {
  const qs = new URLSearchParams({
    inputMint: params.inputMint,
    outputMint: params.outputMint,
    amount: params.amount.toString(),
    slippageMode: params.slippageMode || "auto",
  });
  if (params.slippageBps !== undefined)
    qs.set("slippageBps", params.slippageBps.toString());
  return apiFetch<TradeQuote>(`/trade/quote?${qs.toString()}`);
}

export interface SwapResult {
  transaction: string;
  computeUnitLimit: number;
  lastValidBlockHeight: number;
  prioritizationFeeLamports: number;
}

export async function createSwapTransaction(params: {
  quoteResponse: TradeQuote;
  userPublicKey: string;
}): Promise<SwapResult> {
  return apiFetch<SwapResult>("/trade/swap", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });
}

// ---- Fee Claiming ----

export interface ClaimablePosition {
  baseMint: string;
  isMigrated: boolean;
  totalClaimableLamportsUserShare: string;
}

export async function getClaimablePositions(
  wallet: string
): Promise<ClaimablePosition[]> {
  return apiFetch<ClaimablePosition[]>(
    `/token-launch/claimable-positions?wallet=${wallet}`
  );
}

export interface ClaimTxEntry {
  tx: string;
  blockhash: { blockhash: string; lastValidBlockHeight: number };
}

export async function getClaimTransactions(
  feeClaimer: string,
  tokenMint: string
): Promise<ClaimTxEntry[]> {
  return apiFetch<ClaimTxEntry[]>("/token-launch/claim-txs/v3", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ feeClaimer, tokenMint }),
  });
}

// ---- Analytics ----

export async function getTokenLifetimeFees(
  tokenMint: string
): Promise<string> {
  return apiFetch<string>(
    `/token-launch/lifetime-fees?tokenMint=${tokenMint}`
  );
}

export async function getTokenCreators(
  tokenMint: string
): Promise<unknown[]> {
  return apiFetch<unknown[]>(
    `/token-launch/creators?tokenMint=${tokenMint}`
  );
}

// ---- Partner ----

export interface PartnerStats {
  claimedFees: string;
  unclaimedFees: string;
}

export async function getPartnerStats(
  partner: string
): Promise<PartnerStats> {
  return apiFetch<PartnerStats>(
    `/fee-share/partner-config/stats?partner=${partner}`
  );
}

export async function getPartnerClaimTransactions(
  partner: string
): Promise<unknown> {
  return apiFetch<unknown>(
    `/fee-share/partner-config/claim-txs?partner=${partner}`
  );
}

// ---- Solana RPC helpers ----

export { getRpcUrl };
