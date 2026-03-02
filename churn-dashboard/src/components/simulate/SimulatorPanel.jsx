import { useState } from "react";
import { runSimulation } from "../../api/simulate";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Mono:wght@300;400;500&display=swap');

  .sim-root { font-family:'DM Mono',monospace; color:#e2e8f4; animation:simFade 0.4s ease; }
  @keyframes simFade { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }

  .sim-panel { background:#0f1218; border:1px solid #1e2530; border-radius:12px; padding:20px; }
  .sim-header { display:flex; align-items:center; justify-content:space-between; margin-bottom:16px; padding-bottom:14px; border-bottom:1px solid #1e2530; }
  .sim-title { font-family:'Syne',sans-serif; font-size:14px; font-weight:700; display:flex; align-items:center; gap:7px; }

  .sim-btn { font-family:'Syne',sans-serif; font-size:12px; font-weight:700; padding:8px 18px; border-radius:8px; border:none; cursor:pointer; background:#00e5c3; color:#080b10; transition:all 0.2s; display:inline-flex; align-items:center; gap:6px; }
  .sim-btn:hover:not(:disabled) { background:#00ffd5; transform:translateY(-1px); box-shadow:0 6px 16px rgba(0,229,195,0.25); }
  .sim-btn:disabled { opacity:0.5; cursor:not-allowed; }
  .sim-spinner { width:12px; height:12px; border:2px solid rgba(0,0,0,0.2); border-top-color:#080b10; border-radius:50%; animation:spin 0.6s linear infinite; }
  @keyframes spin { to{transform:rotate(360deg)} }

  .sim-results { display:grid; grid-template-columns:repeat(3,1fr); gap:10px; margin-top:4px; }
  .sim-kpi { background:#161b24; border:1px solid #1e2530; border-radius:10px; padding:14px 16px; position:relative; overflow:hidden; }
  .sim-kpi-top { position:absolute; top:0; left:0; right:0; height:2px; }
  .sim-kpi-label { font-size:9px; letter-spacing:1.5px; text-transform:uppercase; color:#4a5568; margin-bottom:8px; }
  .sim-kpi-value { font-family:'Syne',sans-serif; font-size:22px; font-weight:800; letter-spacing:-0.5px; line-height:1; }

  .sim-delta-pos { color:#00e5c3; }
  .sim-delta-neg { color:#ff4d6d; }

  .sim-empty { padding:24px 0; text-align:center; font-size:12px; color:#2d3748; }
`;

export default function SimulatorPanel({ row }) {
  const [out, setOut] = useState(null);
  const [loading, setLoading] = useState(false);

  const run = async () => {
    setLoading(true);
    try {
      const r = await runSimulation(row);
      console.log("SIM RESULT:", r.data); // keep for debug
      setOut(r.data);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const delta = out ? Number(out.delta ?? 0) : null;
  const deltaColor = delta !== null ? (delta <= 0 ? "#00e5c3" : "#ff4d6d") : "#e2e8f4";

  return (
    <>
      <style>{styles}</style>
      <div className="sim-root">
        <div className="sim-panel">
          <div className="sim-header">
            <div className="sim-title">
              <span style={{color:"#00e5c3"}}>⟳</span> Simulate Action
            </div>
            <button className="sim-btn" onClick={run} disabled={loading}>
              {loading ? <><span className="sim-spinner"/>Simulating…</> : <>⟳ Simulate</>}
            </button>
          </div>

          {!out && !loading && (
            <div className="sim-empty">Run simulation to preview churn probability change</div>
          )}

          {out && (
            <div className="sim-results">
              <div className="sim-kpi">
                <div className="sim-kpi-top" style={{background:"#4a5568"}}/>
                <div className="sim-kpi-label">Base Probability</div>
                <div className="sim-kpi-value" style={{color:"#6b7a95"}}>
                  {Number(out.base_probability).toFixed(3)}
                </div>
              </div>
              <div className="sim-kpi">
                <div className="sim-kpi-top" style={{background:"#00e5c3"}}/>
                <div className="sim-kpi-label">New Probability</div>
                <div className="sim-kpi-value" style={{color:"#00e5c3"}}>
                  {Number(out.simulated_probability).toFixed(3)}
                </div>
              </div>
              <div className="sim-kpi">
                <div className="sim-kpi-top" style={{background:deltaColor}}/>
                <div className="sim-kpi-label">Delta</div>
                <div className="sim-kpi-value" style={{color:deltaColor}}>
                  {delta !== null && delta >= 0 ? "+" : ""}{Number(out.delta).toFixed(3)}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
