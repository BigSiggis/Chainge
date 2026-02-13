import React from "react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { useWallet } from "@solana/wallet-adapter-react";

export default function Landing({ onConnected }) {
  const { setVisible } = useWalletModal();
  const { connected } = useWallet();
  React.useEffect(() => { if (connected) onConnected(); }, [connected, onConnected]);

  return (
    <div style={{ paddingTop: 80, paddingBottom: 60 }}>
      <div style={{ fontSize: 13, color: "#00ffa3", letterSpacing: "2px", textTransform: "uppercase", marginBottom: 20, fontWeight: 600 }}>
        Spare Change Protocol
      </div>
      <h1 style={{ fontSize: 52, fontWeight: 800, lineHeight: 1.05, letterSpacing: "-2.5px", margin: "0 0 24px 0", fontFamily: "'Sora', sans-serif" }}>
        Your round-ups.<br />
        <span style={{ color: "#00ffa3", textShadow: "0 0 20px #00ffa344, 0 0 40px #00ffa322" }}>Auto-compounding.</span>
      </h1>
      <p style={{ fontSize: 17, color: "#777", lineHeight: 1.6, margin: "0 0 48px 0", maxWidth: 400 }}>
        Every Solana transaction you make, the spare change gets swept into yield. No bank. No KYC. Pure DeFi savings on autopilot.
      </p>
      <button onClick={() => setVisible(true)} style={{ background: "#00ffa3", color: "#0a0a0f", border: "none", borderRadius: 12, padding: "16px 32px", fontSize: 16, fontWeight: 700, cursor: "pointer", width: "100%", letterSpacing: "-0.3px" }}>
        Connect Wallet
      </button>
      <div style={{ display: "flex", justifyContent: "center", gap: 32, marginTop: 48, paddingTop: 32, borderTop: "1px solid #ffffff08" }}>
        {[{ n: "0%", l: "Fees" }, { n: "100%", l: "On-chain" }, { n: "24/7", l: "Autopilot" }].map((s, i) => (
          <div key={i} style={{ textAlign: "center" }}>
            <div style={{ fontSize: 20, fontWeight: 700, color: "#fff" }}>{s.n}</div>
            <div style={{ fontSize: 12, color: "#555", marginTop: 4 }}>{s.l}</div>
          </div>
        ))}
      </div>
      <div style={{ background: "#ffffff06", border: "1px solid #ffffff10", borderRadius: 16, padding: 24, marginTop: 48 }}>
        <div style={{ fontSize: 14, color: "#888", marginBottom: 16 }}>How it works</div>
        {[
          { step: "01", text: "You swap 0.341 SOL for POPCAT" },
          { step: "02", text: "Chainge rounds up → 0.159 SOL spare change" },
          { step: "03", text: "0.159 SOL auto-deposits into JitoSOL liquid staking" },
          { step: "04", text: "Your spare change earns 7.2% APY from validator rewards + MEV" },
        ].map((s, i) => (
          <div key={i} style={{ display: "flex", gap: 16, padding: "12px 0", borderBottom: i < 3 ? "1px solid #ffffff06" : "none" }}>
            <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 12, color: "#00ffa3" }}>{s.step}</span>
            <span style={{ fontSize: 15, color: "#aaa" }}>{s.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
