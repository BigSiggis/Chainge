import React, { useState, useRef, useEffect } from "react";
import { STRATEGIES, LST_OPTIONS, EMERGENCY_PENALTY } from "../utils/constants";
import { getSolPrice, fetchSolPrice } from "../utils/price";

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

function Countdown({ unlockDate }) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => { const i = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(i); }, []);
  const diff = unlockDate - now;
  if (diff <= 0) return <span style={{ color: "#00ffa3" }}>Unlocked!</span>;
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  const mins = Math.floor((diff % 3600000) / 60000);
  const secs = Math.floor((diff % 60000) / 1000);
  return <span>{days}d {hours}h {mins}m {secs}s</span>;
}

export default function Dashboard({ totalSaved, transactions, txCount, avgRoundUp, projectedMonthly, strategy, roundUpAmount, selectedLst, isMonitoring, onPause, onResume, onWithdraw, lockDays, lockStartTime }) {
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [showEmergency, setShowEmergency] = useState(false);
  const [withdrawAmt, setWithdrawAmt] = useState("");
  const [confirmText, setConfirmText] = useState("");
  const [newTxFlash, setNewTxFlash] = useState(false);
  const [solPrice, setSolPrice] = useState(getSolPrice());
  const prevTxCount = useRef(txCount);

  useEffect(() => {
    fetchSolPrice().then(setSolPrice);
    const i = setInterval(function() { fetchSolPrice().then(setSolPrice); }, 60000);
    return () => clearInterval(i);
  }, []);

  useEffect(() => {
    if (txCount > prevTxCount.current) { setNewTxFlash(true); setTimeout(() => setNewTxFlash(false), 800); }
    prevTxCount.current = txCount;
  }, [txCount]);

  const activeStrategy = STRATEGIES.find((s) => s.id === strategy);
  const activeLst = LST_OPTIONS.find((l) => l.id === selectedLst);
  const isLocked = lockDays > 0;
  const unlockDate = lockStartTime ? lockStartTime + (lockDays * 86400000) : 0;
  const isUnlocked = !isLocked || Date.now() >= unlockDate;
  const card = { background: "#ffffff06", border: "1px solid #ffffff10", borderRadius: 16, padding: 24, marginBottom: 16 };
  const label = { fontSize: 12, color: "#666", textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: 8, fontWeight: 600 };
  const penaltyAmount = withdrawAmt ? (parseFloat(withdrawAmt) * EMERGENCY_PENALTY).toFixed(3) : "0.000";
  const receiveAmount = withdrawAmt ? (parseFloat(withdrawAmt) * (1 - EMERGENCY_PENALTY)).toFixed(3) : "0.000";

  return (
    <>
      <div style={{ background: "linear-gradient(135deg, #00ffa308, #00ffa302)", border: "1px solid #00ffa320", borderRadius: 16, padding: "36px 24px", marginBottom: 16, textAlign: "center", position: "relative", overflow: "hidden" }}>
        {newTxFlash && <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, background: "radial-gradient(circle at center, #00ffa315, transparent 70%)", animation: "pulse 0.8s ease-out", pointerEvents: "none" }} />}
        <div style={label}>Total Saved</div>
        <div style={{ fontSize: 48, fontWeight: 700, letterSpacing: "-2px", lineHeight: 1.1 }}>
          <span style={{ color: "#00ffa3", textShadow: "0 0 20px #00ffa344" }}><AnimatedNumber value={totalSaved} /></span>
          <span style={{ fontSize: 20, color: "#00ffa380", marginLeft: 8 }}>SOL</span>
        </div>
        <div style={{ fontSize: 14, color: "#555", marginTop: 8 }}>≈ ${(totalSaved * solPrice).toFixed(2)} USD <span style={{ fontSize: 11, color: "#333" }}>(SOL ${solPrice.toFixed(2)})</span></div>
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

      {isLocked && (
        <div style={{ background: isUnlocked ? "#00ffa308" : "#ff444408", border: isUnlocked ? "1px solid #00ffa320" : "1px solid #ff444420", borderRadius: 16, padding: "16px 24px", marginBottom: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: 12, color: isUnlocked ? "#00ffa3" : "#ff4444", textTransform: "uppercase", letterSpacing: "1.5px", fontWeight: 600 }}>{isUnlocked ? "\uD83D\uDD13 Vault Unlocked" : "\uD83D\uDD10 Degen Lock Active"}</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: "#fff", marginTop: 4 }}><Countdown unlockDate={unlockDate} /></div>
          </div>
          <div style={{ fontSize: 12, color: "#555" }}>{lockDays} day lock</div>
        </div>
      )}

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
            {isMonitoring ? "\u23F8 Pause" : "\u25B6 Resume"}
          </button>
          {isUnlocked ? (
            <button onClick={() => { setShowWithdraw(!showWithdraw); setShowEmergency(false); }} style={{ flex: 1, background: "#ffffff08", color: "#ccc", border: "1px solid #ffffff15", borderRadius: 10, padding: "10px 16px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>\uD83D\uDCB0 Withdraw</button>
          ) : (
            <button onClick={() => { setShowEmergency(!showEmergency); setShowWithdraw(false); }} style={{ flex: 1, background: "#ff440015", color: "#ff4444", border: "1px solid #ff444430", borderRadius: 10, padding: "10px 16px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>\uD83D\uDEA8 Emergency</button>
          )}
        </div>

        {showWithdraw && (
          <div style={{ marginTop: 12, background: "#ffffff04", border: "1px solid #ffffff10", borderRadius: 10, padding: 16 }}>
            <div style={{ fontSize: 12, color: "#666", marginBottom: 8 }}>Amount to withdraw (SOL)</div>
            <div style={{ display: "flex", gap: 8 }}>
              <input type="number" step="0.001" min="0" placeholder="0.000" value={withdrawAmt} onChange={(e) => setWithdrawAmt(e.target.value)} style={{ flex: 1, background: "#0a0a0f", border: "1px solid #ffffff15", borderRadius: 8, padding: "10px 12px", color: "#fff", fontSize: 14, outline: "none" }} />
              <button onClick={() => setWithdrawAmt(totalSaved.toFixed(3))} style={{ background: "#ffffff08", color: "#888", border: "1px solid #ffffff15", borderRadius: 8, padding: "10px 12px", fontSize: 12, cursor: "pointer" }}>MAX</button>
              <button onClick={() => { if (withdrawAmt > 0) { onWithdraw(parseFloat(withdrawAmt)); setWithdrawAmt(""); setShowWithdraw(false); } }} style={{ background: "#00ffa3", color: "#0a0a0f", border: "none", borderRadius: 8, padding: "10px 16px", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>Confirm</button>
            </div>
          </div>
        )}

        {showEmergency && (
          <div style={{ marginTop: 12, background: "#ff440008", border: "1px solid #ff444030", borderRadius: 10, padding: 16 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#ff4444", marginBottom: 8 }}>\uD83D\uDEA8 Emergency Withdraw</div>
            <div style={{ fontSize: 13, color: "#888", marginBottom: 12 }}>Your vault is locked. Emergency withdraw costs a <span style={{ color: "#ff4444", fontWeight: 700 }}>15% penalty</span>.</div>
            <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
              <input type="number" step="0.001" min="0" placeholder="0.000" value={withdrawAmt} onChange={(e) => setWithdrawAmt(e.target.value)} style={{ flex: 1, background: "#0a0a0f", border: "1px solid #ff444030", borderRadius: 8, padding: "10px 12px", color: "#fff", fontSize: 14, outline: "none" }} />
              <button onClick={() => setWithdrawAmt(totalSaved.toFixed(3))} style={{ background: "#ff440010", color: "#ff4444", border: "1px solid #ff444030", borderRadius: 8, padding: "10px 12px", fontSize: 12, cursor: "pointer" }}>MAX</button>
            </div>
            {withdrawAmt > 0 && (
              <div style={{ background: "#0a0a0f", borderRadius: 8, padding: 12, marginBottom: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "#888", marginBottom: 4 }}><span>Withdraw</span><span>{withdrawAmt} SOL</span></div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "#ff4444", marginBottom: 4 }}><span>Penalty (15%)</span><span>-{penaltyAmount} SOL</span></div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, fontWeight: 700, color: "#fff", paddingTop: 8, borderTop: "1px solid #ffffff10" }}><span>You receive</span><span>{receiveAmount} SOL</span></div>
              </div>
            )}
            <div style={{ fontSize: 12, color: "#ff4444", marginBottom: 8 }}>Type "I AM WEAK" to confirm emergency withdraw</div>
            <input type="text" placeholder='Type "I AM WEAK"' value={confirmText} onChange={(e) => setConfirmText(e.target.value)} style={{ width: "100%", background: "#0a0a0f", border: "1px solid #ff444030", borderRadius: 8, padding: "10px 12px", color: "#ff4444", fontSize: 14, outline: "none", marginBottom: 12, boxSizing: "border-box" }} />
            <button onClick={() => { if (confirmText === "I AM WEAK" && withdrawAmt > 0) { onWithdraw(parseFloat(receiveAmount)); setWithdrawAmt(""); setConfirmText(""); setShowEmergency(false); } }} disabled={confirmText !== "I AM WEAK" || !withdrawAmt} style={{ width: "100%", background: confirmText === "I AM WEAK" ? "#ff4444" : "#ff444030", color: confirmText === "I AM WEAK" ? "#fff" : "#ff444060", border: "none", borderRadius: 8, padding: "12px 16px", fontSize: 14, fontWeight: 700, cursor: confirmText === "I AM WEAK" ? "pointer" : "not-allowed" }}>\u26A0 Emergency Withdraw</button>
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
              <div style={{ fontSize: 11, color: "#333" }}>≈${(p.a * solPrice).toFixed(0)}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={card}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
          <div style={label}>Round-up History</div>
          <div style={{ fontSize: 12, color: isMonitoring ? "#00ffa3" : "#ff4444" }}>{isMonitoring ? "\u25CF Live" : "\u25CF Paused"}</div>
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
