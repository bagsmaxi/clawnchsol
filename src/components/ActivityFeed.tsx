"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
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

export default function ActivityFeed() {
  const [activity, setActivity] = useState<ActivityEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/activity?limit=10")
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setActivity(d.data.activity || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 12 }}>
          Recent Scanner Launches
        </h2>
        <div className="loading-skeleton" style={{ height: 80, borderRadius: 8 }} />
      </div>
    );
  }

  if (activity.length === 0) {
    return (
      <div style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 12 }}>
          Recent Scanner Launches
        </h2>
        <div
          style={{
            background: "var(--bg-card)",
            border: "1px solid var(--border-color)",
            borderRadius: 8,
            padding: "24px 16px",
            textAlign: "center",
            fontSize: 12,
            color: "var(--text-muted)",
          }}
        >
          No tokens auto-launched yet. Post <code style={{ color: "var(--accent)" }}>!clawnch</code> on
          Moltbook, 4claw, or MoltX to trigger the scanner.
        </div>
      </div>
    );
  }

  return (
    <div style={{ marginBottom: 32 }}>
      <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 12 }}>
        Recent Scanner Launches
      </h2>
      <div
        style={{
          background: "var(--bg-card)",
          border: "1px solid var(--border-color)",
          borderRadius: 8,
          overflow: "hidden",
        }}
      >
        {activity.map((entry, i) => {
          const platform = PLATFORM_LABELS[entry.platform] || {
            label: entry.platform,
            color: "#888",
          };
          return (
            <div
              key={`${entry.tokenMint}-${i}`}
              style={{
                display: "grid",
                gridTemplateColumns: "80px 1fr 120px 80px",
                gap: 8,
                padding: "10px 14px",
                borderBottom:
                  i < activity.length - 1
                    ? "1px solid var(--border-color)"
                    : "none",
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
                  padding: "2px 6px",
                  borderRadius: 4,
                  textAlign: "center",
                }}
              >
                {platform.label}
              </span>
              <div>
                <span style={{ fontWeight: 700 }}>
                  {entry.tokenName}
                </span>
                <span style={{ color: "var(--text-muted)", marginLeft: 6 }}>
                  ${entry.tokenSymbol}
                </span>
              </div>
              <Link
                href={`/token/${entry.tokenMint}`}
                style={{ color: "var(--accent)", fontSize: 11, fontFamily: "monospace" }}
              >
                {shortenAddress(entry.tokenMint)}
              </Link>
              <span style={{ color: "var(--text-muted)", fontSize: 10, textAlign: "right" }}>
                {timeAgo(entry.launchedAt)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
