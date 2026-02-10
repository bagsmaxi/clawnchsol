"use client";

import { useEffect, useState } from "react";

interface Stats {
  wallet: string;
  balanceSOL: string;
  tokensLaunched: number;
}

export default function StatsBar() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    fetch("/api/stats")
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setStats(d.data);
      })
      .catch(() => {});
  }, []);

  const statItems = [
    {
      label: "Tokens Launched",
      value: stats ? `${stats.tokensLaunched}` : "...",
      sub: "via Pump.fun",
    },
    {
      label: "Wallet Balance",
      value: stats ? `${stats.balanceSOL} SOL` : "...",
      sub: "platform wallet",
    },
    {
      label: "Network",
      value: "Solana",
      sub: "mainnet-beta",
    },
    {
      label: "Protocol",
      value: "Pump.fun",
      sub: "Token2022",
    },
  ];

  return (
    <div style={{ marginBottom: 32 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: 8,
          marginBottom: 12,
        }}
      >
        <span
          style={{
            fontSize: 10,
            textTransform: "uppercase",
            letterSpacing: 1,
            color: "var(--text-muted)",
          }}
        >
          Platform Stats
        </span>
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
          gap: 12,
        }}
      >
        {statItems.map((item) => (
          <div key={item.label} className="stat-card">
            <div className="stat-label">{item.label}</div>
            <div className="stat-value" style={{ fontSize: 20 }}>
              {item.value}
            </div>
            {item.sub && (
              <div
                style={{
                  fontSize: 9,
                  color: "var(--text-muted)",
                  marginTop: 4,
                }}
              >
                {item.sub}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
