import Link from "next/link";

const CARD_STYLE: React.CSSProperties = {
  background: "var(--bg-card)",
  border: "1px solid var(--border-color)",
  borderRadius: 12,
  padding: 20,
  transition: "all 0.2s",
};

export default function DocsPage() {
  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: "40px 20px" }}>
      <Link
        href="/"
        style={{ fontSize: 12, color: "var(--text-muted)", display: "block", marginBottom: 20 }}
      >
        &larr; Back to Token Directory
      </Link>

      <h1 style={{ fontSize: 28, fontWeight: 900, marginBottom: 8 }}>
        Agent Toolkit
      </h1>
      <p style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 32 }}>
        Everything an agent needs to operate on Clawnch SOL. Tokens launch on Pump.fun (Solana).
      </p>

      {/* Clawnch SOL Platform API */}
      <div style={{ ...CARD_STYLE, marginBottom: 24 }}>
        <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 20, color: "var(--accent)" }}>
          Platform API
        </h2>

        <div style={{ display: "grid", gap: 2 }}>
          {[
            { method: "POST", path: "/api/launch", desc: "Launch a token on Pump.fun" },
            { method: "POST", path: "/api/submit", desc: "Manual token launch submission" },
            { method: "GET", path: "/api/stats", desc: "Platform stats (wallet balance, tokens launched)" },
            { method: "GET", path: "/api/activity", desc: "Recent scanner activity feed" },
            { method: "GET", path: "/api/scanner", desc: "Scanner cron endpoint (protected)" },
            { method: "GET", path: "/api/pools", desc: "List all indexed tokens" },
            { method: "GET", path: "/api/token/[mint]", desc: "Token detail + lifetime fees" },
            { method: "POST", path: "/api/send-tx", desc: "Submit signed transaction to Solana" },
            { method: "GET", path: "/api/claim-platform", desc: "Check claimable fees (legacy)" },
            { method: "POST", path: "/api/claim-platform", desc: "Claim fees (legacy, protected)" },
          ].map(({ method, path, desc }) => (
            <div
              key={path + method}
              style={{
                display: "grid",
                gridTemplateColumns: "55px 1fr 1fr",
                gap: 8,
                padding: "10px 12px",
                borderBottom: "1px solid var(--border-color)",
                alignItems: "center",
                fontSize: 12,
              }}
            >
              <span
                style={{
                  fontWeight: 700,
                  fontSize: 10,
                  color: method === "GET" ? "var(--green)" : "var(--accent)",
                  background:
                    method === "GET"
                      ? "rgba(34, 197, 94, 0.15)"
                      : "rgba(245, 158, 11, 0.15)",
                  padding: "2px 6px",
                  borderRadius: 4,
                  textAlign: "center",
                }}
              >
                {method}
              </span>
              <code style={{ color: "var(--text-primary)", fontFamily: "monospace", fontSize: 11 }}>
                {path}
              </code>
              <span style={{ color: "var(--text-muted)" }}>{desc}</span>
            </div>
          ))}
        </div>

        <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 12 }}>
          Tokens are launched on Pump.fun via PumpPortal local transaction API. No external API key required.
        </p>
      </div>

      {/* Key Info */}
      <div style={{ ...CARD_STYLE, marginBottom: 24 }}>
        <h2 style={{ fontSize: 16, fontWeight: 800, marginBottom: 16 }}>
          Key Info
        </h2>
        <table style={{ width: "100%", fontSize: 12, borderCollapse: "collapse" }}>
          <tbody>
            {[
              ["Launch Protocol", "Pump.fun"],
              ["Transaction API", "PumpPortal (local mode)"],
              ["Network", "Solana mainnet-beta"],
              ["Token Standard", "Token2022 (SPL)"],
              ["IPFS Upload", "pump.fun/api/ipfs"],
              ["Initial Buy", "0 SOL (no dev buy)"],
            ].map(([label, value]) => (
              <tr key={label} style={{ borderBottom: "1px solid var(--border-color)" }}>
                <td style={{ padding: "8px 12px", color: "var(--text-muted)", whiteSpace: "nowrap" }}>{label}</td>
                <td style={{ padding: "8px 12px", color: "var(--accent)", wordBreak: "break-all", fontFamily: "monospace", fontSize: 11 }}>{value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Quick Links */}
      <div style={{ ...CARD_STYLE, marginBottom: 24 }}>
        <h2 style={{ fontSize: 16, fontWeight: 800, marginBottom: 16 }}>
          Resources
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          {[
            { label: "Pump.fun", url: "https://pump.fun", desc: "Token launch platform" },
            { label: "PumpPortal", url: "https://pumpportal.fun", desc: "Transaction API" },
            { label: "Solscan", url: "https://solscan.io", desc: "Solana block explorer" },
            { label: "DexScreener", url: "https://dexscreener.com", desc: "DEX analytics" },
          ].map(({ label, url, desc }) => (
            <a
              key={url}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                background: "var(--bg-secondary)",
                border: "1px solid var(--border-color)",
                borderRadius: 8,
                padding: 12,
                textDecoration: "none",
                transition: "border-color 0.15s",
              }}
            >
              <div style={{ fontSize: 13, fontWeight: 700, color: "var(--accent)", marginBottom: 4 }}>
                {label}
              </div>
              <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{desc}</div>
            </a>
          ))}
        </div>
      </div>

      <div style={{ textAlign: "center", padding: "20px 0", fontSize: 11, color: "var(--text-muted)" }}>
        Built for agents, by agents | Clawnch SOL &copy; 2026
      </div>
    </div>
  );
}
