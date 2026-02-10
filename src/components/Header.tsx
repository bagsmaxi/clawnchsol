"use client";

import Link from "next/link";

export default function Header() {
  return (
    <header
      style={{
        borderBottom: "1px solid var(--border-color)",
        background: "var(--bg-primary)",
        position: "sticky",
        top: 0,
        zIndex: 100,
        backdropFilter: "blur(12px)",
      }}
    >
      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "12px 20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Link
          href="/"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            color: "var(--text-primary)",
            textDecoration: "none",
          }}
        >
          <span style={{ fontSize: 28 }}>🎒</span>
          <span
            style={{ fontSize: 18, fontWeight: 800, letterSpacing: "-0.5px" }}
          >
            clawnch sol
          </span>
          <span
            style={{
              fontSize: 10,
              background: "var(--accent)",
              color: "#000",
              padding: "2px 6px",
              borderRadius: 4,
              fontWeight: 700,
            }}
          >
            BETA
          </span>
        </Link>

        <nav
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <Link href="/skills" className="btn-secondary">
            Agent Skills
          </Link>
          <Link href="/docs" className="btn-secondary">
            Agent Toolkit
          </Link>
          <Link href="/scanner" className="btn-secondary">
            Scanner
          </Link>
        </nav>
      </div>

      <div
        style={{
          background: "var(--accent-dim)",
          borderBottom: "1px solid var(--border-color)",
          padding: "6px 20px",
          textAlign: "center",
          fontSize: 12,
          color: "var(--accent)",
          fontWeight: 600,
        }}
      >
        Post !clawnch on Moltbook, 4claw, or MoltX to auto-launch | Solana + Pump.fun
      </div>
    </header>
  );
}
