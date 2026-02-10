import { Keypair, VersionedTransaction } from "@solana/web3.js";
import bs58 from "bs58";

let cachedKeypair: Keypair | null = null;

export function getPlatformKeypair(): Keypair {
  if (cachedKeypair) return cachedKeypair;
  const privateKey = process.env.PLATFORM_WALLET_PRIVATE_KEY?.trim();
  if (!privateKey) throw new Error("PLATFORM_WALLET_PRIVATE_KEY not set");
  cachedKeypair = Keypair.fromSecretKey(bs58.decode(privateKey));
  return cachedKeypair;
}

export function getPlatformWalletAddress(): string {
  return getPlatformKeypair().publicKey.toBase58();
}

export function signTransaction(serializedTxBase58: string): string {
  const keypair = getPlatformKeypair();
  const txBytes = bs58.decode(serializedTxBase58);
  const tx = VersionedTransaction.deserialize(txBytes);
  tx.sign([keypair]);
  return bs58.encode(tx.serialize());
}
