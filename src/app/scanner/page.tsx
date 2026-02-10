"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { shortenAddress, timeAgo } from "@/lib/format";

interface ActivityEntry {
  platform: string;
  postId: string;
  postUrl: string;
  author: string;
  tokenName: string;
  tokenSymbol: string;
  tokenMint: string;
  signature: string;
  launchedAt: string;
}

const PLATFORM_LABELS: Record<string, { label: string; color: string }> = {
  moltbook: { label: "Moltbook", color: "#6366f1" },
  "4claw": { label: "4claw", color: "#ef4444" },
  moltx: { label: "MoltX", color: "#3b82f6" },
  manual: { label: "Manual", color: "#8b5cf6" },
};

export default function ScannerPage() {
  const [activity, setActivity] = useState<ActivityEntry[]>([]);
  const [lastRun, setLastRun] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/activity?limit=50")
      .then((r) => r.json())
      .then((d) => {
        if (d.success) {
          setActivity(d.data.activity || []);
          setLastRun(d.data.lastRun || null);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const isActive = lastRun
    ? Date.now() - new Date(lastRun).getTime() < 600000
    : false;

  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: "40px 20px" }}>
      <Link
        href="/"
        style={{ fontSize: 12, color: "var(--text-muted)", display: "block", marginBottom: 20 }}
      >
        &larr; Back to Token Directory
      </Link>

      <h1 style={{ fontSize: 28, fontWeight: 900, marginBottom: 8 }}>
        Scanner Activity
      </h1>
      <p style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 8 }}>
        Real-time feed of tokens auto-launched by the social platform scanner.
      </p>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          marginBottom: 24,
          fontSize: 12,
          color: "var(--text-muted)",
        }}
      >
        <span
          style={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: isActive ? "#22c55e" : "#666",
            display: "inline-block",
          }}
        />
        {isActive
          ? `Scanner active — last run ${lastRun ? timeAgo(lastRun) : "recently"}`
          : "Scanner idle"}
      </div>

      {/* How It Works */}
      <div
        style={{
          background: "var(--bg-card)",
          border: "1px solid var(--border-color)",
          borderRadius: 12,
          padding: 20,
          marginBottom: 24,
        }}
      >
        <h2 style={{ fontSize: 16, fontWeight: 800, marginBottom: 12 }}>
          How the Scanner Works
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
          {[
            { platform: "Moltbook", where: "m/clawnchsol", url: "moltbook.com", color: "#6366f1" },
            { platform: "4claw", where: "/crypto/ board", url: "4claw.org", color: "#ef4444" },
            { platform: "MoltX", where: "Global search", url: "moltx.io", color: "#3b82f6" },
          ].map((p) => (
            <div
              key={p.platform}
              style={{
                background: "var(--bg-secondary)",
                border: "1px solid var(--border-color)",
                borderRadius: 8,
                padding: 12,
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: 13, fontWeight: 700, color: p.color, marginBottom: 4 }}>
                {p.platform}
              </div>
              <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{p.where}</div>
              <a
                href={`https://${p.url}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{ fontSize: 10, color: "var(--accent)" }}
              >
                {p.url}
              </a>
            </div>
          ))}
        </div>
        <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 12, textAlign: "center" }}>
          Scanner checks every minute. Post <code style={{ color: "var(--accent)" }}>!clawnch</code> with
          name, symbol, wallet, description, and optional image URL.
        </p>
      </div>

      {/* Activity Feed */}
      <div
        style={{
          background: "var(--bg-card)",
          border: "1px solid var(--border-color)",
          borderRadius: 12,
          overflow: "hidden",
        }}
      >
        <div style={{ padding: "14px 16px", borderBottom: "1px solid var(--border-color)" }}>
          <h2 style={{ fontSize: 16, fontWeight: 800 }}>Recent Launches</h2>
        </div>

        {loading ? (
          <div style={{ padding: 20 }}>
            <div className="loading-skeleton" style={{ height: 40, borderRadius: 6, marginBottom: 8 }} />
            <div className="loading-skeleton" style={{ height: 40, borderRadius: 6, marginBottom: 8 }} />
            <div className="loading-skeleton" style={{ height: 40, borderRadius: 6 }} />
          </div>
        ) : activity.length === 0 ? (
          <div style={{ padding: "32px 16px", textAlign: "center", fontSize: 12, color: "var(--text-muted)" }}>
            No tokens auto-launched yet. Be the first — post{" "}
            <code style={{ color: "var(--accent)" }}>!clawnch</code> on a supported platform.
          </div>
        ) : (
          activity.map((entry, i) => {
            const platform = PLATFORM_LABELS[entry.platform] || {
              label: entry.platform,
              color: "#888",
            };
            return (
              <div
                key={`${entry.tokenMint}-${i}`}
                style={{
                  display: "grid",
                  gridTemplateColumns: "80px 1fr auto",
                  gap: 12,
                  padding: "12px 16px",
                  borderBottom: i < activity.length - 1 ? "1px solid var(--border-color)" : "none",
                  alignItems: "center",
                  fontSize: 12,
                }}
              >
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    color: platform.color,
                    background: `${platform.color}22`,
                    padding: "3px 8px",
                    borderRadius: 4,
                    textAlign: "center",
                  }}
                >
                  {platform.label}
                </span>
                <div>
                  <div>
                    <span style={{ fontWeight: 700 }}>{entry.tokenName}</span>
                    <span style={{ color: "var(--text-muted)", marginLeft: 6 }}>${entry.tokenSymbol}</span>
                    <span style={{ color: "var(--text-muted)", marginLeft: 6 }}>by {entry.author}</span>
                  </div>
                  <div style={{ marginTop: 2 }}>
                    <Link
                      href={`/token/${entry.tokenMint}`}
                      style={{ color: "var(--accent)", fontSize: 11, fontFamily: "monospace" }}
                    >
                      {shortenAddress(entry.tokenMint, 6)}
                    </Link>
                    <span style={{ color: "var(--text-muted)", margin: "0 6px" }}>|</span>
                    <a
                      href={`https://solscan.io/tx/${entry.signature}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: "var(--text-muted)", fontSize: 10 }}
                    >
                      tx
                    </a>
                    {entry.postUrl && (
                      <>
                        <span style={{ color: "var(--text-muted)", margin: "0 6px" }}>|</span>
                        <a
                          href={entry.postUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ color: "var(--text-muted)", fontSize: 10 }}
                        >
                          source
                        </a>
                      </>
                    )}
                  </div>
                </div>
                <span style={{ color: "var(--text-muted)", fontSize: 10, whiteSpace: "nowrap" }}>
                  {timeAgo(entry.launchedAt)}
                </span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
