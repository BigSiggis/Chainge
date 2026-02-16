import React, { useState, useCallback } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useChainge } from "./hooks/useChainge";
import Landing from "./components/Landing";
import Config from "./components/Config";
import Dashboard from "./components/Dashboard";

export default function App() {
  const { connected } = useWallet();
  const chainge = useChainge();
  const [screen, setScreen] = useState("landing");
  const [animateIn, setAnimateIn] = useState(true);
  const [selectedLst, setSelectedLst] = useState(null);

  const navigate = useCallback((s) => {
    setAnimateIn(false);
    setTimeout(() => { setScreen(s); setAnimateIn(true); }, 300);
  }, []);

  const handleConnected = useCallback(() => { navigate("config"); }, [navigate]);

  const handleActivate = useCallback((lstChoice) => {
    setSelectedLst(lstChoice);
    chainge.activate();
    navigate("dashboard");
  }, [chainge, navigate]);

  React.useEffect(() => {
    if (!connected && screen !== "landing") { navigate("landing"); }
  }, [connected, screen, navigate]);

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0f", color: "#e8e8e8", fontFamily: "'DM Sans', 'Sora', sans-serif", overflow: "hidden", position: "relative" }}>
      <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.03'/%3E%3C/svg%3E")`, pointerEvents: "none", zIndex: 0 }} />
      <div style={{ position: "fixed", top: "-30%", right: "-20%", width: "60vw", height: "60vw", borderRadius: "50%", background: "radial-gradient(circle, #00ffa320 0%, transparent 70%)", filter: "blur(80px)", pointerEvents: "none", zIndex: 0 }} />
      <div style={{ position: "fixed", bottom: "-20%", left: "-10%", width: "40vw", height: "40vw", borderRadius: "50%", background: "radial-gradient(circle, #9945ff18 0%, transparent 70%)", filter: "blur(60px)", pointerEvents: "none", zIndex: 0 }} />

      <div style={{ position: "relative", zIndex: 1, maxWidth: 520, margin: "0 auto", padding: "0 20px", opacity: animateIn ? 1 : 0, transform: animateIn ? "translateY(0)" : "translateY(20px)", transition: "all 0.4s cubic-bezier(0.16, 1, 0.3, 1)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "24px 0" }}>
          <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: "-0.5px", cursor: "pointer" }} onClick={() => navigate("landing")}>
            <span style={{ color: "#00ffa3" }}>Chain</span>ge
          </div>
          {connected && (
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              {screen === "dashboard" && (
                <div style={{ background: "#ffffff08", border: "1px solid #ffffff12", borderRadius: 8, padding: "6px 14px", fontSize: 13, color: "#888", cursor: "pointer" }} onClick={() => navigate("config")}>⚙</div>
              )}
              <div style={{ background: "#ffffff08", border: "1px solid #ffffff12", borderRadius: 8, padding: "6px 14px", fontSize: 13, color: "#888", fontFamily: "'DM Mono', monospace" }}>{chainge.walletAddress}</div>
            </div>
          )}
          {!connected && <div style={{ fontSize: 13, color: "#444" }}>Solana</div>}
        </div>

        {screen === "landing" && <Landing onConnected={handleConnected} />}

        {screen === "config" && (
          <Config
            roundUpAmount={chainge.roundUpAmount}
            setRoundUpAmount={chainge.setRoundUpAmount}
            strategy={chainge.strategy}
            setStrategy={chainge.setStrategy}
            onActivate={handleActivate}
          />
        )}

        {screen === "dashboard" && (
          <Dashboard
            totalSaved={chainge.totalSaved}
            transactions={chainge.transactions}
            txCount={chainge.txCount}
            avgRoundUp={chainge.avgRoundUp}
            projectedMonthly={chainge.projectedMonthly}
            strategy={chainge.strategy}
            roundUpAmount={chainge.roundUpAmount}
            selectedLst={selectedLst}
            isMonitoring={chainge.isMonitoring}
            onPause={chainge.deactivate}
            onResume={chainge.activate}
            onWithdraw={chainge.withdrawFunds}
          />
        )}

        <div style={{ textAlign: "center", padding: "40px 0", fontSize: 13, color: "#333" }}>open source · permissionless · no vc funding</div>
      </div>
    </div>
  );
}
