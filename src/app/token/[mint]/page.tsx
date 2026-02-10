"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { shortenAddress, formatSol } from "@/lib/format";

interface TokenData {
  tokenMint: string;
  lifetimeFees: string;
  creators: unknown[];
}

const SOL_MINT = "So11111111111111111111111111111111111111112";

export default function TokenDetailPage({
  params,
}: {
  params: Promise<{ mint: string }>;
}) {
  const { mint } = use(params);
  const [data, setData] = useState<TokenData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Trade form
  const [tradeAmount, setTradeAmount] = useState("");
  const [tradeDirection, setTradeDirection] = useState<"buy" | "sell">("buy");
  const [quoteResult, setQuoteResult] = useState<string>("");
  const [quoting, setQuoting] = useState(false);

  useEffect(() => {
    fetch(`/api/token/${mint}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setData(d.data);
        else setError(d.error);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [mint]);

  const handleQuote = async () => {
    if (!tradeAmount || parseFloat(tradeAmount) <= 0) return;
    setQuoting(true);
    setQuoteResult("");

    try {
      const amountLamports = Math.floor(
        parseFloat(tradeAmount) * 1_000_000_000
      );
      const inputMint = tradeDirection === "buy" ? SOL_MINT : mint;
      const outputMint = tradeDirection === "buy" ? mint : SOL_MINT;

      const res = await fetch(
        `/api/trade?inputMint=${inputMint}&outputMint=${outputMint}&amount=${amountLamports}`
      );
      const d = await res.json();
      if (d.success) {
        const out = d.data.outAmount;
        if (tradeDirection === "buy") {
          setQuoteResult(`You'll receive ~${Number(out).toLocaleString()} tokens`);
        } else {
          setQuoteResult(
            `You'll receive ~${(Number(out) / 1_000_000_000).toFixed(4)} SOL`
          );
        }
      } else {
        setQuoteResult(`Error: ${d.error}`);
      }
    } catch {
      setQuoteResult("Failed to get quote");
    } finally {
      setQuoting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ maxWidth: 800, margin: "0 auto", padding: "40px 20px" }}>
        <div
          className="loading-skeleton"
          style={{ width: 200, height: 32, marginBottom: 16 }}
        />
        <div
          className="loading-skeleton"
          style={{ width: "100%", height: 200, marginBottom: 16 }}
        />
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ maxWidth: 800, margin: "0 auto", padding: "40px 20px" }}>
        <p style={{ color: "var(--red)" }}>Error: {error}</p>
        <Link href="/" style={{ fontSize: 13, marginTop: 16, display: "block" }}>
          &larr; Back to tokens
        </Link>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: "40px 20px" }}>
      <Link
        href="/"
        style={{
          fontSize: 12,
          color: "var(--text-muted)",
          display: "inline-block",
          marginBottom: 20,
        }}
      >
        &larr; Back to Token Directory
      </Link>

      {/* Token Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 16,
          marginBottom: 24,
        }}
      >
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: 12,
            background: "var(--accent-dim)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 24,
            border: "2px solid var(--accent)",
          }}
        >
          🎒
        </div>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800 }}>
            {shortenAddress(mint, 8)}
          </h1>
          <div
            style={{
              fontSize: 12,
              color: "var(--text-muted)",
              display: "flex",
              gap: 8,
              marginTop: 4,
            }}
          >
            <a
              href={`https://solscan.io/token/${mint}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              Solscan
            </a>
            <span>|</span>
            <a
              href={`https://dexscreener.com/solana/${mint}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              DexScreener
            </a>
            <span>|</span>
            <a
              href={`https://birdeye.so/token/${mint}?chain=solana`}
              target="_blank"
              rel="noopener noreferrer"
            >
              Birdeye
            </a>
            <span>|</span>
            <a
              href={`https://pump.fun/coin/${mint}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              Pump.fun
            </a>
          </div>
        </div>
      </div>

      {/* Token Mint Full */}
      <div
        style={{
          background: "var(--bg-card)",
          border: "1px solid var(--border-color)",
          borderRadius: 8,
          padding: "12px 16px",
          marginBottom: 24,
          display: "flex",
          alignItems: "center",
          gap: 8,
          overflowX: "auto",
        }}
      >
        <span style={{ fontSize: 11, color: "var(--text-muted)", whiteSpace: "nowrap" }}>
          MINT:
        </span>
        <code style={{ fontSize: 12, color: "var(--accent)", wordBreak: "break-all" }}>
          {mint}
        </code>
        <button
          onClick={() => navigator.clipboard.writeText(mint)}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            fontSize: 14,
            flexShrink: 0,
          }}
        >
          📋
        </button>
      </div>

      {/* Stats Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: 12,
          marginBottom: 32,
        }}
      >
        <div className="stat-card">
          <div className="stat-label">Lifetime Fees</div>
          <div className="stat-value" style={{ fontSize: 18 }}>
            {data ? `${formatSol(data.lifetimeFees)} SOL` : "..."}
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Creators</div>
          <div className="stat-value" style={{ fontSize: 18 }}>
            {data ? data.creators.length : "..."}
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Protocol</div>
          <div className="stat-value" style={{ fontSize: 18 }}>
            Pump.fun
          </div>
        </div>
      </div>

      {/* Trade Box */}
      <div
        style={{
          background: "var(--bg-card)",
          border: "1px solid var(--border-color)",
          borderRadius: 12,
          padding: 24,
          marginBottom: 32,
        }}
      >
        <h3
          style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}
        >
          Trade
        </h3>
        <div
          style={{
            display: "flex",
            gap: 8,
            marginBottom: 16,
          }}
        >
          <button
            className={`filter-pill ${tradeDirection === "buy" ? "active" : ""}`}
            onClick={() => setTradeDirection("buy")}
          >
            Buy
          </button>
          <button
            className={`filter-pill ${tradeDirection === "sell" ? "active" : ""}`}
            onClick={() => setTradeDirection("sell")}
          >
            Sell
          </button>
        </div>

        <div style={{ marginBottom: 12 }}>
          <label
            style={{
              fontSize: 11,
              textTransform: "uppercase",
              letterSpacing: 1,
              color: "var(--text-muted)",
              display: "block",
              marginBottom: 6,
            }}
          >
            Amount ({tradeDirection === "buy" ? "SOL" : "Tokens"})
          </label>
          <input
            className="input-field"
            placeholder="0.0"
            value={tradeAmount}
            onChange={(e) => setTradeAmount(e.target.value)}
            type="number"
            min="0"
            step="0.001"
          />
        </div>

        <button
          className="btn-primary"
          onClick={handleQuote}
          disabled={quoting || !tradeAmount}
          style={{ width: "100%", marginBottom: 12 }}
        >
          {quoting ? "Getting Quote..." : "Get Quote"}
        </button>

        {quoteResult && (
          <div
            style={{
              fontSize: 13,
              color: quoteResult.startsWith("Error")
                ? "var(--red)"
                : "var(--green)",
              textAlign: "center",
              padding: 8,
            }}
          >
            {quoteResult}
          </div>
        )}

        <p
          style={{
            fontSize: 11,
            color: "var(--text-muted)",
            marginTop: 8,
            textAlign: "center",
          }}
        >
          View and trade on Pump.fun. Connect a wallet to execute trades.
        </p>
      </div>

      {/* Creators List */}
      {data && data.creators.length > 0 && (
        <div
          style={{
            background: "var(--bg-card)",
            border: "1px solid var(--border-color)",
            borderRadius: 12,
            padding: 20,
          }}
        >
          <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>
            Creators
          </h3>
          {data.creators.map((c: unknown, i: number) => (
            <div
              key={i}
              style={{
                fontSize: 12,
                padding: "8px 0",
                borderBottom:
                  i < data.creators.length - 1
                    ? "1px solid var(--border-color)"
                    : "none",
                color: "var(--text-secondary)",
              }}
            >
              {typeof c === "string"
                ? shortenAddress(c, 8)
                : JSON.stringify(c)}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
