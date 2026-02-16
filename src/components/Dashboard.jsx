import React, { useState, useRef, useEffect } from "react";
import { STRATEGIES, LST_OPTIONS, SOL_PRICE_USD } from "../utils/constants";

function AnimatedNumber({ value, decimals = 3, duration = 1200 }) {
  const [display, setDisplay] = useState(0);
  const ref = useRef(null);
  useEffect(() => {
    const start = display;
    const diff = value - start;
    const startTime = performance.now();
    function tick(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(start + diff * eased);
      if (progress < 1) ref.current = requestAnimationFrame(tick);
    }
    ref.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(ref.current);
  }, [value]);
  return <span>{display.toFixed(decimals)}</span>;
}

export default function Dashboard({ totalSaved, transactions, txCount, avgRoundUp, projectedMonthly, strategy, roundUpAmount, selectedLst, isMonitoring, onPause, onResume, onWithdraw }) {
  const [withdrawAmt, setWithdrawAmt] = useState("");
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [newTxFlash, setNewTxFlash] = useState(false);
  const prevTxCount = useRef(txCount);

  useEffect(() => {
    if (txCount > prevTxCount.current) { setNewTxFlash(true); setTimeout(() => setNewTxFlash(false), 800); }
    prevTxCount.current = txCount;
  }, [txCount]);

  const activeStrategy = STRATEGIES.find((s) => s.id === strategy);
  const activeLst = LST_OPTIONS.find((l) => l.id === selectedLst);
  const card = { background: "#ffffff06", border: "1px solid #ffffff10", borderRadius: 16, padding: 24, marginBottom: 16 };
  const label = { fontSize: 12, color: "#666", textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: 8, fontWeight: 600 };

  return (
    <>
      <div style={{ background: "linear-gradient(135deg, #00ffa308, #00ffa302)", border: "1px solid #00ffa320", borderRadius: 16, padding: "36px 24px", marginBottom: 16, textAlign: "center", position: "relative", overflow: "hidden" }}>
        {newTxFlash && <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, background: "radial-gradient(circle at center, #00ffa315, transparent 70%)", animation: "pulse 0.8s ease-out", pointerEvents: "none" }} />}
        <div style={label}>Total Saved</div>
        <div style={{ fontSize: 48, fontWeight: 700, letterSpacing: "-2px", lineHeight: 1.1 }}>
          <span style={{ color: "#00ffa3", textShadow: "0 0 20px #00ffa344" }}><AnimatedNumber value={totalSaved} /></span>
          <span style={{ fontSize: 20, color: "#00ffa380", marginLeft: 8 }}>SOL</span>
        </div>
        <div style={{ fontSize: 14, color: "#555", marginTop: 8 }}>≈ ${(totalSaved * SOL_PRICE_USD).toFixed(2)} USD</div>
        <div style={{ display: "flex", marginTop: 24, borderTop: "1px solid #00ffa315", paddingTop: 20 }}>
          {[{ v: txCount, l: "Round-ups" }, { v: avgRoundUp.toFixed(3), l: "Avg Save" }, { v: projectedMonthly.toFixed(1), l: "Est/Month" }].map((s, i) => (
            <React.Fragment key={i}>
              {i > 0 && <div style={{ width: 1, background: "#ffffff10", alignSelf: "stretch" }} />}
              <div style={{ flex: 1, textAlign: "center", padding: "16px 8px" }}>
                <div style={{ fontSize: 18, fontWeight: 700, color: "#fff" }}>{s.v}</div>
                <div style={{ fontSize: 11, color: "#555", marginTop: 4 }}>{s.l}</div>
              </div>
            </React.Fragment>
          ))}
        </div>
      </div>

      <div style={card}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={label}>Active Strategy</div>
            <div style={{ fontSize: 17, fontWeight: 600, color: "#fff" }}>{activeStrategy?.name}</div>
            {activeLst && <div style={{ fontSize: 13, color: "#00ffa3", marginTop: 4 }}>{activeLst.name} · {activeLst.apy} APY</div>}
            {!activeLst && <div style={{ fontSize: 12, color: "#555", marginTop: 4 }}>{activeStrategy?.desc}</div>}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ background: "#00ffa315", color: "#00ffa3", borderRadius: 6, padding: "3px 8px", fontSize: 11, fontWeight: 600 }}>Round to {roundUpAmount} SOL</div>
            <div style={{ width: 10, height: 10, borderRadius: "50%", background: isMonitoring ? "#00ffa3" : "#ff4444", boxShadow: isMonitoring ? "0 0 10px #00ffa366" : "0 0 10px #ff444466", animation: isMonitoring ? "blink 2s infinite" : "none" }} />
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
          <button onClick={isMonitoring ? onPause : onResume} style={{ flex: 1, background: isMonitoring ? "#ff444420" : "#00ffa320", color: isMonitoring ? "#ff4444" : "#00ffa3", border: isMonitoring ? "1px solid #ff444440" : "1px solid #00ffa340", borderRadius: 10, padding: "10px 16px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
            {isMonitoring ? "⏸ Pause" : "▶ Resume"}
          </button>
          <button onClick={() => setShowWithdraw(!showWithdraw)} style={{ flex: 1, background: "#ffffff08", color: "#ccc", border: "1px solid #ffffff15", borderRadius: 10, padding: "10px 16px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
            💰 Withdraw
          </button>
        </div>
        {showWithdraw && (
          <div style={{ marginTop: 12, background: "#ffffff04", border: "1px solid #ffffff10", borderRadius: 10, padding: 16 }}>
            <div style={{ fontSize: 12, color: "#666", marginBottom: 8 }}>Amount to withdraw (SOL)</div>
            <div style={{ display: "flex", gap: 8 }}>
              <input type="number" step="0.001" min="0" placeholder="0.000" value={withdrawAmt} onChange={(e) => setWithdrawAmt(e.target.value)} style={{ flex: 1, background: "#0a0a0f", border: "1px solid #ffffff15", borderRadius: 8, padding: "10px 12px", color: "#fff", fontSize: 14, outline: "none" }} />
              <button onClick={() => { setWithdrawAmt(totalSaved.toFixed(3)); }} style={{ background: "#ffffff08", color: "#888", border: "1px solid #ffffff15", borderRadius: 8, padding: "10px 12px", fontSize: 12, cursor: "pointer" }}>MAX</button>
              <button onClick={() => { if (withdrawAmt > 0) { onWithdraw(parseFloat(withdrawAmt)); setWithdrawAmt(""); setShowWithdraw(false); } }} style={{ background: "#00ffa3", color: "#0a0a0f", border: "none", borderRadius: 8, padding: "10px 16px", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>Confirm</button>
            </div>
          </div>
        )}
      </div>

      <div style={card}>
        <div style={label}>If you keep this up</div>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 12 }}>
          {[{ p: "1 month", a: projectedMonthly }, { p: "6 months", a: projectedMonthly * 6 }, { p: "1 year", a: projectedMonthly * 12 }].map((p, i) => (
            <div key={i} style={{ textAlign: "center", flex: 1 }}>
              <div style={{ fontSize: 20, fontWeight: 700, color: "#00ffa3" }}>{p.a.toFixed(1)}</div>
              <div style={{ fontSize: 11, color: "#555", marginTop: 4 }}>{p.p}</div>
              <div style={{ fontSize: 11, color: "#333" }}>≈${(p.a * SOL_PRICE_USD).toFixed(0)}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={card}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
          <div style={label}>Round-up History</div>
          <div style={{ fontSize: 12, color: isMonitoring ? "#00ffa3" : "#ff4444" }}>{isMonitoring ? "● Live" : "● Paused"}</div>
        </div>
        {transactions.length === 0 ? (
          <div style={{ textAlign: "center", padding: "32px 0", color: "#444", fontSize: 14 }}>Waiting for your first transaction...</div>
        ) : transactions.slice(0, 8).map((tx) => (
          <div key={tx.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 0", borderBottom: "1px solid #ffffff08", background: tx.time === "just now" ? "#00ffa308" : "transparent", borderRadius: tx.time === "just now" ? 8 : 0 }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 500, color: "#ccc" }}>{tx.detail}</div>
              <div style={{ fontSize: 12, color: "#444", marginTop: 2 }}>{tx.type} · {tx.time}</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 14, color: "#888" }}>{tx.amount.toFixed(3)} SOL</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#00ffa3", marginTop: 2 }}>+{tx.roundUp.toFixed(3)} saved</div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
