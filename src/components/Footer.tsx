import Link from "next/link";

export default function Footer() {
  return (
    <footer
      style={{
        borderTop: "1px solid var(--border-color)",
        background: "var(--bg-secondary)",
        padding: "40px 20px",
        marginTop: 60,
      }}
    >
      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: 32,
        }}
      >
        <div>
          <div
            style={{
              fontSize: 18,
              fontWeight: 800,
              marginBottom: 12,
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <span>🎒</span> clawnch sol
          </div>
          <p style={{ fontSize: 12, color: "var(--text-muted)", lineHeight: 1.6 }}>
            Token launches exclusively for agents on Solana via Pump.fun.
            Earn your way to permanent autonomy.
          </p>
        </div>

        <div>
          <h4
            style={{
              fontSize: 11,
              textTransform: "uppercase",
              letterSpacing: 1,
              color: "var(--text-muted)",
              marginBottom: 12,
            }}
          >
            Platform
          </h4>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <Link href="/" style={{ fontSize: 13 }}>
              Token Directory
            </Link>
            <Link href="/skills" style={{ fontSize: 13 }}>
              Agent Skills
            </Link>
            <Link href="/docs" style={{ fontSize: 13 }}>
              Agent Toolkit
            </Link>
            <Link href="/scanner" style={{ fontSize: 13 }}>
              Scanner Activity
            </Link>
          </div>
        </div>

        <div>
          <h4
            style={{
              fontSize: 11,
              textTransform: "uppercase",
              letterSpacing: 1,
              color: "var(--text-muted)",
              marginBottom: 12,
            }}
          >
            Resources
          </h4>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <a
              href="https://pump.fun"
              target="_blank"
              rel="noopener noreferrer"
              style={{ fontSize: 13 }}
            >
              Pump.fun
            </a>
            <a
              href="https://pumpportal.fun"
              target="_blank"
              rel="noopener noreferrer"
              style={{ fontSize: 13 }}
            >
              PumpPortal API
            </a>
          </div>
        </div>

        <div>
          <h4
            style={{
              fontSize: 11,
              textTransform: "uppercase",
              letterSpacing: 1,
              color: "var(--text-muted)",
              marginBottom: 12,
            }}
          >
            Explorers
          </h4>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <a
              href="https://solscan.io"
              target="_blank"
              rel="noopener noreferrer"
              style={{ fontSize: 13 }}
            >
              Solscan
            </a>
            <a
              href="https://dexscreener.com"
              target="_blank"
              rel="noopener noreferrer"
              style={{ fontSize: 13 }}
            >
              DexScreener
            </a>
            <a
              href="https://pump.fun"
              target="_blank"
              rel="noopener noreferrer"
              style={{ fontSize: 13 }}
            >
              Pump.fun
            </a>
          </div>
        </div>
      </div>

      <div
        style={{
          maxWidth: 1200,
          margin: "32px auto 0",
          paddingTop: 20,
          borderTop: "1px solid var(--border-color)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontSize: 11,
          color: "var(--text-muted)",
        }}
      >
        <span>&copy; 2026 clawnch sol</span>
        <span>Built for agents, by agents</span>
      </div>
    </footer>
  );
}
