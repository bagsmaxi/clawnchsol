import type { SocialPost, ParsedTokenRequest } from "./types";

const TRIGGER = "!clawnch";

// Base58 character set for Solana addresses
const BASE58_REGEX = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;

// Valid image extensions
const IMAGE_EXTENSIONS = [".png", ".jpg", ".jpeg", ".gif", ".webp"];

// Known image hosting services that don't require extension checks
const KNOWN_IMAGE_HOSTS = ["imgur.com", "i.imgur.com", "arweave.net"];

/**
 * Validate that a URL points to a direct image file.
 * Accepts: URLs ending in valid image extensions, known image hosts, IPFS/Arweave protocols.
 */
function isValidImageUrl(url: string): boolean {
  if (!url) return false;

  // Accept IPFS protocol URLs
  if (url.startsWith("ipfs://")) return true;

  // Accept Arweave protocol URLs
  if (url.startsWith("ar://")) return true;

  try {
    const parsed = new URL(url);
    const hostname = parsed.hostname.toLowerCase();
    const pathname = parsed.pathname.toLowerCase();

    // Known image hosts bypass extension check
    if (KNOWN_IMAGE_HOSTS.some((h) => hostname === h || hostname.endsWith("." + h))) {
      return true;
    }

    // Check for valid image extension
    if (IMAGE_EXTENSIONS.some((ext) => pathname.endsWith(ext))) {
      return true;
    }

    return false;
  } catch {
    return false;
  }
}

// Strip surrounding quotes and trailing commas (from JSON-style values)
function cleanValue(val: string): string {
  let v = val.trim();
  // Remove trailing comma
  if (v.endsWith(",")) v = v.slice(0, -1).trim();
  // Remove surrounding double quotes
  if (v.startsWith('"') && v.endsWith('"')) v = v.slice(1, -1);
  // Remove surrounding single quotes
  if (v.startsWith("'") && v.endsWith("'")) v = v.slice(1, -1);
  return v.trim();
}

// Try to extract a JSON object from the content (with or without ```json code fences)
function tryParseJson(
  content: string
): Record<string, string> | null {
  // Try code-fenced JSON: ```json { ... } ``` or ``` { ... } ```
  const fencedMatch = content.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
  if (fencedMatch) {
    try {
      return JSON.parse(fencedMatch[1]);
    } catch { /* fall through */ }
  }

  // Try bare JSON object after trigger
  const triggerIdx = content.toLowerCase().indexOf(TRIGGER);
  if (triggerIdx >= 0) {
    const afterTrigger = content.slice(triggerIdx + TRIGGER.length);
    const braceStart = afterTrigger.indexOf("{");
    if (braceStart >= 0) {
      const braceEnd = afterTrigger.lastIndexOf("}");
      if (braceEnd > braceStart) {
        try {
          return JSON.parse(afterTrigger.slice(braceStart, braceEnd + 1));
        } catch { /* fall through */ }
      }
    }
  }

  return null;
}

function extractField(content: string, field: string): string | undefined {
  const regex = new RegExp(`${field}\\s*[:=]\\s*(.+)`, "i");
  const match = content.match(regex);
  return match ? cleanValue(match[1]) : undefined;
}

export function parsePost(post: SocialPost): ParsedTokenRequest | null {
  const content = post.content;

  // Check for trigger
  if (!content.toLowerCase().includes(TRIGGER)) return null;

  let name: string | undefined;
  let symbol: string | undefined;
  let wallet: string | undefined;
  let description: string | undefined;
  let image: string | undefined;
  let website: string | undefined;
  let twitter: string | undefined;

  // Try JSON extraction first (handles Moltbook's ```json format)
  const json = tryParseJson(content);
  if (json) {
    name = json.name;
    symbol = json.symbol;
    wallet = json.wallet;
    description = json.description;
    image = json.image || json.imageUrl;
    website = json.website || json.site || json.url || json.link || json.homepage;
    twitter = json.twitter || json.x || json.social;
  }

  // Fall back to / supplement with key-value extraction
  if (!name) name = extractField(content, "name");
  if (!symbol) symbol = extractField(content, "symbol");
  if (!wallet) wallet = extractField(content, "wallet");
  if (!description) description = extractField(content, "description");
  if (!image) {
    image = extractField(content, "image") || extractField(content, "imageUrl");
  }
  if (!website) {
    website =
      extractField(content, "website") ||
      extractField(content, "site") ||
      extractField(content, "url") ||
      extractField(content, "link") ||
      extractField(content, "homepage");
  }
  if (!twitter) {
    twitter =
      extractField(content, "twitter") ||
      extractField(content, "x") ||
      extractField(content, "social");
  }

  // Validate required fields (name, symbol, description, image)
  if (!name || !symbol || !description || !image) return null;

  // Validate image URL (must be direct link with valid extension or known host)
  if (!isValidImageUrl(image)) return null;

  // Validate symbol (max 10 chars)
  const cleanSymbol = symbol.toUpperCase().slice(0, 10);
  if (cleanSymbol.length === 0) return null;

  // If wallet is provided but not a valid Solana address (e.g. 0x EVM address),
  // ignore it — fees will go to platform wallet instead
  const validWallet = wallet && BASE58_REGEX.test(wallet) ? wallet : undefined;

  return {
    name: name.slice(0, 32),
    symbol: cleanSymbol,
    description: description.slice(0, 1000),
    imageUrl: image,
    website,
    twitter,
    creatorWallet: validWallet,
    sourcePost: post,
  };
}
