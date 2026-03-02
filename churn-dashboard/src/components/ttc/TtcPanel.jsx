import { useState } from "react";
import { api } from "../../api";
import { useDatasetStore } from "../../store/datasetStore";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Mono:wght@300;400;500&display=swap');

  .ttcp-root { font-family: 'DM Mono', monospace; color: #e2e8f4; }

  /* CONTROLS */
  .ttcp-controls {
    display: flex; align-items: flex-end; gap: 16px;
    flex-wrap: wrap; margin-bottom: 20px;
  }
  .ttcp-ctrl-group { display: flex; flex-direction: column; gap: 6px; }
  .ttcp-ctrl-label { font-size: 10px; letter-spacing: 1.5px; text-transform: uppercase; color: #4a5568; }
  .ttcp-select {
    font-family: 'DM Mono', monospace; font-size: 12px; color: #e2e8f4;
    background: #161b24; border: 1px solid #1e2530;
    border-radius: 8px; padding: 8px 12px; outline: none; cursor: pointer;
    transition: border-color 0.2s; min-width: 140px;
  }
  .ttcp-select:focus { border-color: #00e5c3; }
  .ttcp-select option { background: #161b24; }
  .ttcp-input {
    font-family: 'DM Mono', monospace; font-size: 12px; color: #e2e8f4;
    background: #161b24; border: 1px solid #1e2530;
    border-radius: 8px; padding: 8px 12px; outline: none;
    transition: border-color 0.2s; width: 110px;
  }
  .ttcp-input:focus { border-color: #00e5c3; box-shadow: 0 0 0 3px rgba(0,229,195,0.08); }

  /* LOAD BTN */
  .ttcp-btn {
    font-family: 'Syne', sans-serif; font-size: 13px; font-weight: 700;
    padding: 10px 22px; border-radius: 9px; border: none; cursor: pointer;
    transition: all 0.2s; letter-spacing: -0.3px;
    background: #00e5c3; color: #080b10;
    display: inline-flex; align-items: center; gap: 8px;
  }
  .ttcp-btn:hover:not(:disabled) { background: #00ffd5; transform: translateY(-1px); box-shadow: 0 8px 20px rgba(0,229,195,0.25); }
  .ttcp-btn:disabled { opacity: 0.5; cursor: not-allowed; }
  .ttcp-spinner { width:14px;height:14px;border:2px solid rgba(0,0,0,0.2);border-top-color:#080b10;border-radius:50%;animation:spin 0.6s linear infinite; }
  @keyframes spin{to{transform:rotate(360deg)}}

  /* KPI ROW */
  .ttcp-kpi-row { display: grid; grid-template-columns: repeat(3,1fr); gap: 14px; margin-bottom: 20px; }
  .ttcp-kpi {
    background: #161b24; border: 1px solid #1e2530; border-radius: 10px; padding: 16px;
    position: relative; overflow: hidden;
  }
  .ttcp-kpi-top { position: absolute; top:0;left:0;right:0;height:2px; }
  .ttcp-kpi-label { font-size:10px;letter-spacing:1.5px;text-transform:uppercase;color:#4a5568;margin-bottom:8px; }
  .ttcp-kpi-val { font-family:'Syne',sans-serif;font-size:22px;font-weight:800; }

  /* TABLE */
  .ttcp-table-wrap { overflow-x:auto;max-height:380px;overflow-y:auto; }
  .ttcp-table-wrap::-webkit-scrollbar { width:4px;height:4px; }
  .ttcp-table-wrap::-webkit-scrollbar-track { background:transparent; }
  .ttcp-table-wrap::-webkit-scrollbar-thumb { background:#1e2530;border-radius:2px; }

  .ttcp-table { width:100%;border-collapse:collapse;font-size:12px; }
  .ttcp-table thead th {
    font-size:10px;letter-spacing:1.5px;text-transform:uppercase;
    color:#4a5568;padding:10px 14px;text-align:left;font-weight:500;
    border-bottom:1px solid #1e2530;background:#161b24;position:sticky;top:0;z-index:1;
  }
  .ttcp-table tbody tr { border-bottom:1px solid rgba(255,255,255,0.03);transition:background 0.15s; }
  .ttcp-table tbody tr:hover { background:rgba(255,255,255,0.02); }
  .ttcp-table tbody tr:last-child { border-bottom:none; }
  .ttcp-table td { padding:10px 14px; color:#e2e8f4; }
  .ttcp-td-muted { color:#4a5568;font-size:11px; }

  /* BAR IN TABLE */
  .ttcp-bar-wrap { display:flex;align-items:center;gap:8px; }
  .ttcp-bar-track { width:54px;height:4px;background:#1e2530;border-radius:2px;overflow:hidden; }
  .ttcp-bar-fill  { height:100%;border-radius:2px; }

  /* URGENCY PILL */
  .ttcp-pill { display:inline-flex;align-items:center;gap:4px;padding:3px 9px;border-radius:20px;font-size:11px; }
  .ttcp-pill-dot { width:5px;height:5px;border-radius:50%;background:currentColor; }

  /* EMPTY */
  .ttcp-empty { text-align:center;padding:32px 20px;color:#4a5568;font-size:12px; }
`;

function num(v, d = 2) {
  return typeof v === "number" ? v.toFixed(d) : "—";
}

function urgencyStyle(score) {
  if (score >= 0.7) return { bg: "rgba(255,77,109,0.1)",  color: "#ff4d6d", label: "High"   };
  if (score >= 0.4) return { bg: "rgba(255,193,7,0.1)",   color: "#ffc107", label: "Medium" };
  return                    { bg: "rgba(0,229,195,0.1)",   color: "#00e5c3", label: "Low"    };
}

export default function TtcPanel() {
  const datasetPath = useDatasetStore(s => s.datasetPath);
  const [data, setData]                   = useState(null);
  const [loading, setLoading]             = useState(false);
  const [urgencyFilter, setUrgencyFilter] = useState("all");
  const [maxTtc, setMaxTtc]               = useState(999);
  const [minRisk, setMinRisk]             = useState(0);

  async function load() {
    if (!datasetPath) return;
    setLoading(true);
    try {
      const filename = datasetPath.split("\\").pop().split("/").pop();
      const res = await api.get(`/timetochurn/summary/${filename}`);
      if (res.data.status === "ok") setData(res.data);
      else alert(res.data.message);
    } catch(e) { console.error(e); }
    setLoading(false);
  }

  const filtered = (data?.urgent_customers || []).filter(r => {
    if (r.time_to_churn > maxTtc) return false;
    if (r.risk < minRisk) return false;
    if (urgencyFilter === "high")   return r.urgency_score >= 0.7;
    if (urgencyFilter === "medium") return r.urgency_score >= 0.4 && r.urgency_score < 0.7;
    if (urgencyFilter === "low")    return r.urgency_score < 0.4;
    return true;
  });

  return (
    <>
      <style>{styles}</style>
      <div className="ttcp-root">

        {/* CONTROLS ROW */}
        <div className="ttcp-controls">
          <div className="ttcp-ctrl-group">
            <div className="ttcp-ctrl-label">Urgency Filter</div>
            <select className="ttcp-select" value={urgencyFilter} onChange={e=>setUrgencyFilter(e.target.value)}>
              <option value="all">All Urgency</option>
              <option value="high">High ≥ 0.7</option>
              <option value="medium">Medium 0.4–0.7</option>
              <option value="low">Low &lt; 0.4</option>
            </select>
          </div>
          <div className="ttcp-ctrl-group">
            <div className="ttcp-ctrl-label">Max TTC (months)</div>
            <input className="ttcp-input" type="number" value={maxTtc} onChange={e=>setMaxTtc(Number(e.target.value))} />
          </div>
          <div className="ttcp-ctrl-group">
            <div className="ttcp-ctrl-label">Min Risk Score</div>
            <input className="ttcp-input" type="number" step="0.05" value={minRisk} onChange={e=>setMinRisk(Number(e.target.value))} />
          </div>
          <button className="ttcp-btn" onClick={load} disabled={loading || !datasetPath}>
            {loading ? <><div className="ttcp-spinner"/>Computing...</> : <>⚡ Load TTC Insights</>}
          </button>
        </div>

        {/* KPIs */}
        {data && (
          <div className="ttcp-kpi-row">
            <div className="ttcp-kpi">
              <div className="ttcp-kpi-top" style={{background:"#7c6aff",opacity:0.6}}/>
              <div className="ttcp-kpi-label">Avg TTC</div>
              <div className="ttcp-kpi-val" style={{color:"#7c6aff"}}>{num(data.avg_time_to_churn,1)} <span style={{fontSize:13}}>mo</span></div>
            </div>
            <div className="ttcp-kpi">
              <div className="ttcp-kpi-top" style={{background:"#ff4d6d",opacity:0.6}}/>
              <div className="ttcp-kpi-label">Min TTC</div>
              <div className="ttcp-kpi-val" style={{color:"#ff4d6d"}}>{num(data.min_time_to_churn,1)} <span style={{fontSize:13}}>mo</span></div>
            </div>
            <div className="ttcp-kpi">
              <div className="ttcp-kpi-top" style={{background:"#ffc107",opacity:0.6}}/>
              <div className="ttcp-kpi-label">Urgent Customers</div>
              <div className="ttcp-kpi-val" style={{color:"#ffc107"}}>{filtered.length.toLocaleString()}</div>
            </div>
          </div>
        )}

        {/* TABLE */}
        {!data && !loading && (
          <div className="ttcp-empty">Click <strong style={{color:"#00e5c3"}}>Load TTC Insights</strong> to run survival analysis</div>
        )}

        {filtered.length > 0 && (
          <div className="ttcp-table-wrap">
            <table className="ttcp-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Customer</th>
                  <th>Risk</th>
                  <th>Uplift</th>
                  <th>TTC</th>
                  <th>Urgency</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r, i) => {
                  const us = urgencyStyle(r.urgency_score ?? 0);
                  return (
                    <tr key={i}>
                      <td className="ttcp-td-muted">{String(i+1).padStart(2,"0")}</td>
                      <td style={{fontWeight:500}}>{r.customer_id}</td>
                      <td>
                        <div className="ttcp-bar-wrap">
                          <div className="ttcp-bar-track"><div className="ttcp-bar-fill" style={{width:`${(r.risk??0)*100}%`,background:"#ff4d6d"}}/></div>
                          <span style={{color:"#ff4d6d",fontSize:11}}>{num(r.risk,3)}</span>
                        </div>
                      </td>
                      <td>
                        <div className="ttcp-bar-wrap">
                          <div className="ttcp-bar-track"><div className="ttcp-bar-fill" style={{width:`${(r.uplift??0)*100}%`,background:"#00e5c3"}}/></div>
                          <span style={{color:"#00e5c3",fontSize:11}}>{num(r.uplift,3)}</span>
                        </div>
                      </td>
                      <td style={{color:"#7c6aff"}}>{num(r.time_to_churn,1)} <span style={{color:"#4a5568",fontSize:10}}>mo</span></td>
                      <td>
                        <span className="ttcp-pill" style={{background:us.bg,color:us.color}}>
                          <span className="ttcp-pill-dot"/>
                          {us.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
