import { useState } from "react"
import { datasetApi } from "../api/datasetApi"

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Mono:wght@300;400;500&display=swap');

  .as-root { font-family:'DM Mono',monospace; color:#e2e8f4; animation:asFade 0.4s ease; }
  @keyframes asFade { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }

  .as-panel { background:#0f1218; border:1px solid #1e2530; border-radius:12px; padding:20px; }
  .as-header { display:flex; align-items:center; justify-content:space-between; margin-bottom:16px; padding-bottom:14px; border-bottom:1px solid #1e2530; }
  .as-title { font-family:'Syne',sans-serif; font-size:14px; font-weight:700; display:flex; align-items:center; gap:7px; }

  .as-control-row { display:flex; align-items:center; gap:12px; margin-bottom:16px; flex-wrap:wrap; }
  .as-label { font-size:11px; color:#4a5568; letter-spacing:0.5px; white-space:nowrap; }

  .as-input { font-family:'DM Mono',monospace; font-size:13px; color:#e2e8f4; background:#161b24; border:1px solid #1e2530; border-radius:8px; padding:9px 12px; outline:none; width:90px; transition:border-color 0.2s; }
  .as-input:focus { border-color:rgba(0,229,195,0.4); }

  .as-pct { font-size:12px; color:#4a5568; }

  .as-btn { font-family:'Syne',sans-serif; font-size:12px; font-weight:700; padding:9px 20px; border-radius:8px; border:none; cursor:pointer; background:#00e5c3; color:#080b10; transition:all 0.2s; display:inline-flex; align-items:center; gap:6px; }
  .as-btn:hover:not(:disabled) { background:#00ffd5; transform:translateY(-1px); box-shadow:0 6px 16px rgba(0,229,195,0.25); }
  .as-btn:disabled { opacity:0.5; cursor:not-allowed; }
  .as-spinner { width:12px; height:12px; border:2px solid rgba(0,0,0,0.2); border-top-color:#080b10; border-radius:50%; animation:spin 0.6s linear infinite; }
  @keyframes spin { to{transform:rotate(360deg)} }

  .as-loading { font-size:11px; color:#4a5568; display:flex; align-items:center; gap:8px; margin-bottom:12px; }
  .as-loading-spin { width:11px; height:11px; border:1.5px solid #1e2530; border-top-color:#00e5c3; border-radius:50%; animation:spin 0.6s linear infinite; }

  .as-results { display:grid; grid-template-columns:repeat(3,1fr); gap:10px; }
  .as-kpi { background:#161b24; border:1px solid #1e2530; border-radius:10px; padding:14px 16px; position:relative; overflow:hidden; }
  .as-kpi-top { position:absolute; top:0; left:0; right:0; height:2px; }
  .as-kpi-label { font-size:9px; letter-spacing:1.5px; text-transform:uppercase; color:#4a5568; margin-bottom:8px; }
  .as-kpi-value { font-family:'Syne',sans-serif; font-size:21px; font-weight:800; letter-spacing:-0.5px; line-height:1; }
`;

export default function ActionSimulator({ row }) {
  const [discount, setDiscount] = useState(10)
  const [sim, setSim] = useState(null)
  const [loading, setLoading] = useState(false)

  if (!row) return null

  const runSim = async () => {
    setLoading(true)
    try {
      const res = await datasetApi.simulate({ row, discount_percent: Number(discount) })
      console.log("SIM RES:", res.data)
      setSim(res.data)
    } catch (e) {
      console.error("Sim failed", e)
      alert("Simulation failed — check backend logs")
    }
    setLoading(false)
  }

  const delta = sim ? Number(sim.delta ?? 0) : null;
  const deltaColor = delta !== null ? (delta <= 0 ? "#00e5c3" : "#ff4d6d") : "#e2e8f4";

  return (
    <>
      <style>{styles}</style>
      <div className="as-root">
        <div className="as-panel">
          <div className="as-header">
            <div className="as-title">
              <span style={{color:"#00e5c3"}}>⚡</span> Action Simulator
            </div>
          </div>

          <div className="as-control-row">
            <span className="as-label">Discount</span>
            <input
              type="number"
              className="as-input"
              value={discount}
              onChange={e => setDiscount(e.target.value)}
            />
            <span className="as-pct">%</span>
            <button className="as-btn" onClick={runSim} disabled={loading}>
              {loading ? <><span className="as-spinner"/>Running…</> : <>⚡ Simulate</>}
            </button>
          </div>

          {loading && (
            <div className="as-loading">
              <span className="as-loading-spin"/>Running simulation…
            </div>
          )}

          {sim && (
            <div className="as-results">
              <div className="as-kpi">
                <div className="as-kpi-top" style={{background:"#4a5568"}}/>
                <div className="as-kpi-label">Base Probability</div>
                <div className="as-kpi-value" style={{color:"#6b7a95"}}>
                  {Number(sim.base_probability ?? 0).toFixed(3)}
                </div>
              </div>
              <div className="as-kpi">
                <div className="as-kpi-top" style={{background:"#00e5c3"}}/>
                <div className="as-kpi-label">New Probability</div>
                <div className="as-kpi-value" style={{color:"#00e5c3"}}>
                  {Number(sim.simulated_probability ?? 0).toFixed(10)}
                </div>
              </div>
              <div className="as-kpi">
                <div className="as-kpi-top" style={{background:deltaColor}}/>
                <div className="as-kpi-label">Delta</div>
                <div className="as-kpi-value" style={{color:deltaColor}}>
                  {delta !== null && delta >= 0 ? "+" : ""}{Number(sim.delta ?? 0).toFixed(10)}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
