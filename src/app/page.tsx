import HeroSection from "@/components/HeroSection";
import StatsBar from "@/components/StatsBar";
import ActivityFeed from "@/components/ActivityFeed";
import ScannerStatus from "@/components/ScannerStatus";
import TokenList from "@/components/TokenList";

export default function Home() {
  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 20px" }}>
      <HeroSection />
      <StatsBar />

      <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
        <ScannerStatus />
      </div>

      <ActivityFeed />

      <div style={{ marginBottom: 16 }}>
        <h2
          style={{
            fontSize: 20,
            fontWeight: 800,
            marginBottom: 4,
          }}
        >
          Token Directory
        </h2>
        <p style={{ fontSize: 12, color: "var(--text-muted)" }}>
          Tokens launched on Pump.fun via Clawnch SOL
        </p>
      </div>

      <TokenList />
    </div>
  );
}
