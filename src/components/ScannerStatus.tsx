"use client";

import { useEffect, useState } from "react";

export default function ScannerStatus() {
  const [lastRun, setLastRun] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/activity?limit=1")
      .then((r) => r.json())
      .then((d) => {
        if (d.success && d.data.lastRun) {
          setLastRun(d.data.lastRun);
        }
      })
      .catch(() => {});
  }, []);

  const getStatusText = () => {
    if (!lastRun) return "Scanner idle";
    const diff = Date.now() - new Date(lastRun).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 2) return "Scanner active";
    if (mins < 10) return `Scanner active — ${mins}m ago`;
    return `Scanner idle — last run ${mins}m ago`;
  };

  const isActive = lastRun
    ? Date.now() - new Date(lastRun).getTime() < 600000
    : false;

  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        fontSize: 10,
        color: "var(--text-muted)",
      }}
    >
      <span
        style={{
          width: 6,
          height: 6,
          borderRadius: "50%",
          background: isActive ? "#22c55e" : "#666",
          display: "inline-block",
        }}
      />
      {getStatusText()}
    </div>
  );
}
