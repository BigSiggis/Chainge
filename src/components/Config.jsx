import React, { useState } from "react";
import { ROUND_OPTIONS, STRATEGIES, LST_OPTIONS } from "../utils/constants";

export default function Config({ roundUpAmount, setRoundUpAmount, strategy, setStrategy, onActivate }) {
  const [selectedLst, setSelectedLst] = useState("jito");
  const [lstOpen, setLstOpen] = useState(false);

  function handleStrategyClick(id) {
    if (id === strategy && id === "stake") {
      setLstOpen(!lstOpen);
    } else {
      setStrategy(id);
      setLstOpen(id === "stake");
    }
  }

  return (
    <div style={{ paddingTop: 40, paddingBottom: 20 }}>
      <h2 style={{ fontSize: 28, fontWeight: 700, letterSpacing: "-1px", margin: "0 0 8px 0", fontFamily: "'Sora', sans-serif" }}>Set your rules</h2>
      <p style={{ fontSize: 15, color: "#666", margin: "0 0 40px 0" }}>Configure how your spare change gets swept.</p>
      <div style={{ marginBottom: 32 }}>
        <div style={{ fontSize: 12, color: "#666", textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: 8, fontWeight: 600 }}>Round up to nearest</div>
        <div style={{ display: "flex", gap: 8 }}>
          {ROUND_OPTIONS.map((opt) => (
            <div key={opt.value} onClick={() => setRoundUpAmount(opt.value)} style={{ flex: 1, padding: "12px 8px", borderRadius: 10, border: roundUpAmount === opt.value ? "1px solid #00ffa350" : "1px solid #ffffff12", background: roundUpAmount === opt.value ? "#00ffa310" : "#ffffff04", color: roundUpAmount === opt.value ? "#00ffa3" : "#888", textAlign: "center", cursor: "pointer", fontSize: 14, fontWeight: 600 }}>
              {opt.label}
            </div>
          ))}
        </div>
        <div style={{ fontSize: 13, color: "#555", marginTop: 10 }}>
          Example: You spend 0.067 SOL → <span style={{ color: "#00ffa3" }}>{(roundUpAmount - (0.067 % roundUpAmount)).toFixed(3)} SOL</span> gets swept
        </div>
      </div>
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 12, color: "#666", textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: 8, fontWeight: 600 }}>Where does it go?</div>
        {STRATEGIES.map((st) => (
          <div key={st.id}>
            <div onClick={() => handleStrategyClick(st.id)} style={{ display: "flex", alignItems: "center", gap: 16, padding: "16px 20px", borderRadius: 12, border: strategy === st.id ? "1px solid #00ffa340" : "1px solid #ffffff10", background: strategy === st.id ? "#00ffa308" : "#ffffff04", cursor: "pointer", marginBottom: 8 }}>
              <div style={{ fontSize: 24, width: 44, height: 44, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 10, background: "#ffffff08" }}>{st.icon}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 15, fontWeight: 600, color: strategy === st.id ? "#fff" : "#aaa" }}>{st.name}</div>
                <div style={{ fontSize: 13, color: "#555", marginTop: 2 }}>{st.desc}</div>
                {st.risk && strategy === st.id && (<div style={{ fontSize: 11, color: "#ff9900", marginTop: 6, padding: "6px 10px", background: "#ff990008", border: "1px solid #ff990020", borderRadius: 6, lineHeight: 1.4 }}>⚠ {st.risk}</div>)}
              </div>
              {st.apy !== "—" && <div style={{ background: "#00ffa315", color: "#00ffa3", borderRadius: 6, padding: "3px 8px", fontSize: 11, fontWeight: 600 }}>{st.apy} APY</div>}
            </div>
            {strategy === st.id && st.hasLstPicker && lstOpen && (
              <div style={{ background: "#ffffff04", border: "1px solid #ffffff10", borderRadius: 12, padding: 16, marginBottom: 8, marginTop: -4, marginLeft: 20 }}>
                <div style={{ fontSize: 11, color: "#666", textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: 10, fontWeight: 600 }}>Choose your LST</div>
                {LST_OPTIONS.map((lst) => (
                  <div key={lst.id} onClick={() => setSelectedLst(lst.id)} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 14px", borderRadius: 10, cursor: "pointer", marginBottom: 4, border: selectedLst === lst.id ? "1px solid #00ffa340" : "1px solid #ffffff08", background: selectedLst === lst.id ? "#00ffa310" : "transparent" }}>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: selectedLst === lst.id ? "#00ffa3" : "#ccc" }}>{lst.name}</div>
                      <div style={{ fontSize: 12, color: "#555", marginTop: 2 }}>{lst.desc}</div>
                    </div>
                    <div style={{ background: selectedLst === lst.id ? "#00ffa320" : "#ffffff08", color: selectedLst === lst.id ? "#00ffa3" : "#666", borderRadius: 6, padding: "3px 8px", fontSize: 11, fontWeight: 600, whiteSpace: "nowrap" }}>{lst.apy}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
      <button onClick={() => onActivate(strategy === "stake" ? selectedLst : null)} style={{ background: "#00ffa3", color: "#0a0a0f", border: "none", borderRadius: 12, padding: "16px 32px", fontSize: 16, fontWeight: 700, cursor: "pointer", width: "100%", letterSpacing: "-0.3px", marginTop: 24 }}>Activate Chainge</button>
      <div style={{ textAlign: "center", fontSize: 13, color: "#444", marginTop: 16 }}>You can change these anytime</div>
    </div>
  );
}
