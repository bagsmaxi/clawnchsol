export type PlatformId = "moltbook" | "4claw" | "moltx";

export interface SocialPost {
  platform: PlatformId;
  postId: string;
  author: string;
  content: string;
  imageUrl?: string;
  timestamp: string;
  url: string;
}

export interface ParsedTokenRequest {
  name: string;
  symbol: string;
  description: string;
  imageUrl?: string;
  website?: string;
  twitter?: string;
  creatorWallet?: string;
  creatorBps?: number;
  sourcePost: SocialPost;
}

export interface ScanResult {
  platform: PlatformId;
  postId: string;
  status: "launched" | "duplicate" | "invalid" | "error";
  tokenMint?: string;
  signature?: string;
  error?: string;
  timestamp: string;
}

export interface ActivityEntry {
  platform: PlatformId;
  postId: string;
  postUrl: string;
  author: string;
  tokenName: string;
  tokenSymbol: string;
  tokenMint: string;
  signature: string;
  launchedAt: string;
}
