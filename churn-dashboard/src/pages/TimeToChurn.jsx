import { useEffect, useMemo, useState } from "react";
import { api } from "../api";
import { useDatasetStore } from "../store/datasetStore";
import { getFilename } from "../utils/getFilename";

import TtcPanel from "../components/ttc/TtcPanel";
import UrgentDecisionPanel from "../components/ttc/UrgentDecisionPanel";
import TtcTimelineChart from "../components/ttc/TtcTimelineChart";
import TtcUpliftHeatmap from "../components/ttc/TtcUpliftHeatmap";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Mono:wght@300;400;500&display=swap');

  .ttc-root {
    font-family: 'DM Mono', monospace;
    color: #e2e8f4;
    animation: ttcFade 0.5s ease;
  }
  @keyframes ttcFade { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }

  /* HEADER */
  .ttc-header {
    display: flex; align-items: flex-start; justify-content: space-between;
    margin-bottom: 32px; flex-wrap: wrap; gap: 14px;
  }
  .ttc-title {
    font-family: 'Syne', sans-serif;
    font-size: 28px; font-weight: 800;
    letter-spacing: -1px; line-height: 1.1;
  }
  .ttc-title span { color: #00e5c3; }
  .ttc-subtitle { font-size: 12px; color: #4a5568; margin-top: 6px; }
  .ttc-live-badge {
    display: flex; align-items: center; gap: 7px;
    font-size: 11px; color: #00e5c3;
    padding: 7px 14px;
    background: rgba(0,229,195,0.06);
    border: 1px solid rgba(0,229,195,0.18);
    border-radius: 20px; align-self: flex-start;
  }
  .ttc-pulse { width:7px;height:7px;background:#00e5c3;border-radius:50%;animation:ttcPulse 2s infinite; }
  @keyframes ttcPulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:0.3;transform:scale(0.7)}}

  /* KPI STRIP */
  .ttc-kpi-grid {
    display: grid; grid-template-columns: repeat(4,1fr);
    gap: 14px; margin-bottom: 24px;
  }
  .ttc-kpi {
    background: #0f1218; border: 1px solid #1e2530;
    border-radius: 12px; padding: 20px 18px;
    position: relative; overflow: hidden; transition: all 0.2s;
  }
  .ttc-kpi:hover { border-color: rgba(0,229,195,0.2); transform: translateY(-2px); }
  .ttc-kpi-top { position:absolute;top:0;left:0;right:0;height:2px; }
  .ttc-kpi-label { font-size:10px;letter-spacing:1.5px;text-transform:uppercase;color:#4a5568;margin-bottom:10px; }
  .ttc-kpi-value { font-family:'Syne',sans-serif;font-size:26px;font-weight:800;letter-spacing:-0.5px;line-height:1; }
  .ttc-kpi-sub { font-size:10px;color:#2d3748;margin-top:6px; }

  /* FILTER BAR */
  .ttc-filter-bar {
    background: #0f1218; border: 1px solid #1e2530;
    border-radius: 12px; padding: 16px 22px;
    display: flex; align-items: center; gap: 16px;
    margin-bottom: 20px; flex-wrap: wrap;
  }
  .ttc-filter-label { font-size:10px;letter-spacing:1.5px;text-transform:uppercase;color:#4a5568; }
  .ttc-select {
    font-family: 'DM Mono', monospace; font-size:12px; color:#e2e8f4;
    background: #161b24; border: 1px solid #1e2530;
    border-radius: 8px; padding: 8px 14px;
    outline: none; cursor: pointer; transition: border-color 0.2s;
  }
  .ttc-select:focus { border-color: #00e5c3; }
  .ttc-select option { background:#161b24; }

  .ttc-filter-pills { display:flex;gap:6px; }
  .ttc-pill {
    font-family:'DM Mono',monospace; font-size:11px;
    padding: 5px 14px; border-radius:20px; cursor:pointer;
    border: 1px solid #1e2530; background:transparent; color:#4a5568;
    transition: all 0.15s;
  }
  .ttc-pill:hover { color:#e2e8f4; border-color:#2d3748; }
  .ttc-pill.active { background:rgba(0,229,195,0.1); border-color:rgba(0,229,195,0.3); color:#00e5c3; }
  .ttc-pill.high   { }
  .ttc-pill.active.high   { background:rgba(255,77,109,0.1);  border-color:rgba(255,77,109,0.3);  color:#ff4d6d; }
  .ttc-pill.active.medium { background:rgba(255,193,7,0.1);   border-color:rgba(255,193,7,0.3);   color:#ffc107; }
  .ttc-pill.active.low    { background:rgba(0,229,195,0.1);   border-color:rgba(0,229,195,0.3);   color:#00e5c3; }

  .ttc-count { font-size:12px;color:#4a5568;margin-left:auto; }
  .ttc-count span { color:#e2e8f4;font-weight:600; }

  /* TABLE PANEL */
  .ttc-panel {
    background: #0f1218; border: 1px solid #1e2530;
    border-radius: 12px; overflow: hidden; margin-bottom: 20px;
  }
  .ttc-panel-header {
    display:flex;align-items:center;justify-content:space-between;
    padding: 18px 22px; border-bottom: 1px solid #1e2530;
  }
  .ttc-panel-title {
    font-family:'Syne',sans-serif; font-size:15px; font-weight:700; letter-spacing:-0.3px;
  }
  .ttc-panel-badge {
    font-size:10px;color:#4a5568;
    padding:4px 10px;background:#161b24;border:1px solid #1e2530;border-radius:20px;
  }

  .ttc-table-wrap { overflow-x:auto; max-height:400px; overflow-y:auto; }
  .ttc-table-wrap::-webkit-scrollbar { width:4px;height:4px; }
  .ttc-table-wrap::-webkit-scrollbar-track { background:transparent; }
  .ttc-table-wrap::-webkit-scrollbar-thumb { background:#1e2530;border-radius:2px; }

  .ttc-table { width:100%;border-collapse:collapse;font-size:12px; }
  .ttc-table thead th {
    font-size:10px;letter-spacing:1.5px;text-transform:uppercase;
    color:#4a5568;padding:10px 16px;text-align:left;font-weight:500;
    border-bottom:1px solid #1e2530;background:#0f1218;
    position:sticky;top:0;z-index:1;
  }
  .ttc-table tbody tr { border-bottom:1px solid rgba(255,255,255,0.03);transition:background 0.15s;cursor:pointer; }
  .ttc-table tbody tr:hover { background:rgba(255,255,255,0.02); }
  .ttc-table tbody tr:last-child { border-bottom:none; }
  .ttc-table td { padding:11px 16px;color:#e2e8f4; }
  .ttc-td-muted { color:#4a5568;font-size:11px; }

  /* TIME BADGE */
  .ttc-time-badge {
    display:inline-flex;align-items:center;gap:5px;
    padding:3px 10px;border-radius:20px;font-size:11px;
  }
  .ttc-time-dot { width:5px;height:5px;border-radius:50%;background:currentColor; }

  /* URGENCY BAR */
  .ttc-urg-wrap { display:flex;align-items:center;gap:8px; }
  .ttc-urg-track { width:60px;height:4px;background:#1e2530;border-radius:2px;overflow:hidden; }
  .ttc-urg-fill { height:100%;border-radius:2px; }

  /* CHART PANELS */
  .ttc-chart-panel {
    background: #0f1218; border: 1px solid #1e2530;
    border-radius: 12px; padding: 24px; margin-bottom: 20px;
    transition: border-color 0.2s;
  }
  .ttc-chart-panel:hover { border-color: rgba(0,229,195,0.1); }
  .ttc-chart-header {
    display:flex;align-items:center;justify-content:space-between;margin-bottom:20px;
  }
  .ttc-chart-title { font-family:'Syne',sans-serif;font-size:15px;font-weight:700;letter-spacing:-0.3px; }
  .ttc-chart-badge { font-size:10px;color:#4a5568;padding:4px 10px;background:#161b24;border:1px solid #1e2530;border-radius:20px; }

  /* EMPTY */
  .ttc-empty {
    display:flex;flex-direction:column;align-items:center;justify-content:center;
    min-height:60vh;text-align:center;gap:14px;
  }
  .ttc-empty-icon { width:72px;height:72px;background:#0f1218;border:1px solid #1e2530;border-radius:18px;display:flex;align-items:center;justify-content:center;font-size:32px;margin-bottom:8px; }
  .ttc-empty-title { font-family:'Syne',sans-serif;font-size:20px;font-weight:800;color:#e2e8f4; }
  .ttc-empty-sub { font-size:12px;color:#4a5568;line-height:1.9;max-width:340px; }
`;

function timeBucket(v) {
  if (v <= 6)  return "SOON";
  if (v <= 18) return "MID";
  return "LATE";
}
function urgencyBucket(v) {
  if (v >= 0.7) return "HIGH";
  if (v >= 0.4) return "MEDIUM";
  return "LOW";
}
function timeBadgeStyle(bucket) {
  if (bucket === "SOON") return { bg:"rgba(255,77,109,0.1)",  color:"#ff4d6d",  label:"Soon"   };
  if (bucket === "MID")  return { bg:"rgba(255,193,7,0.1)",   color:"#ffc107",  label:"Medium" };
  return                        { bg:"rgba(0,229,195,0.1)",   color:"#00e5c3",  label:"Late"   };
}
function urgencyColor(v) {
  if (v >= 0.7) return "#ff4d6d";
  if (v >= 0.4) return "#ffc107";
  return "#00e5c3";
}

const TIME_FILTERS   = ["ALL","SOON","MID","LATE"];
const URGENCY_FILTERS = ["ALL","HIGH","MEDIUM","LOW"];

export default function TimeToChurn() {
  const datasetPath = useDatasetStore(s => s.datasetPath);
  const [rows, setRows]               = useState([]);
  const [timeFilter, setTimeFilter]   = useState("ALL");
  const [urgencyFilter, setUrgencyFilter] = useState("ALL");

  useEffect(() => {
    if (!datasetPath) return;
    const filename = getFilename(datasetPath);
    api.get(`/predict/file/${filename}`)
      .then(r => setRows(r.data || []))
      .catch(e => console.error("TTC load failed:", e));
  }, [datasetPath]);

  const filtered = useMemo(() => rows.filter(r => {
    const t = r.time_to_churn ?? 999;
    const u = r.urgency_score ?? 0;
    return (timeFilter === "ALL" || timeBucket(t) === timeFilter)
        && (urgencyFilter === "ALL" || urgencyBucket(u) === urgencyFilter);
  }), [rows, timeFilter, urgencyFilter]);

  // KPIs
  const soon   = rows.filter(r => timeBucket(r.time_to_churn ?? 999) === "SOON").length;
  const mid    = rows.filter(r => timeBucket(r.time_to_churn ?? 999) === "MID").length;
  const late   = rows.filter(r => timeBucket(r.time_to_churn ?? 999) === "LATE").length;
  const avgTtc = rows.length ? rows.reduce((s,r)=>s+(r.time_to_churn??0),0)/rows.length : 0;

  if (!datasetPath) return (
    <><style>{styles}</style>
    <div className="ttc-empty">
      <div className="ttc-empty-icon">⏱</div>
      <div className="ttc-empty-title">No Dataset Loaded</div>
      <div className="ttc-empty-sub">Go to <strong style={{color:"#00e5c3"}}>Data Source</strong> and upload a dataset to run survival analysis.</div>
    </div></>
  );

  return (
    <><style>{styles}</style>
    <div className="ttc-root">

      {/* HEADER */}
      <div className="ttc-header">
        <div>
          <div className="ttc-title">Time to <span>Churn</span></div>
          <div className="ttc-subtitle">Survival analysis · Urgency scoring · Intervention windows</div>
        </div>
        <div className="ttc-live-badge"><div className="ttc-pulse"/>Survival Model Active</div>
      </div>

      {/* KPI STRIP */}
      <div className="ttc-kpi-grid">
        <div className="ttc-kpi">
          <div className="ttc-kpi-top" style={{background:"#7c6aff",opacity:0.6}}/>
          <div className="ttc-kpi-label">Total Customers</div>
          <div className="ttc-kpi-value" style={{color:"#7c6aff"}}>{rows.length.toLocaleString()}</div>
          <div className="ttc-kpi-sub">With TTC predictions</div>
        </div>
        <div className="ttc-kpi">
          <div className="ttc-kpi-top" style={{background:"#ff4d6d",opacity:0.6}}/>
          <div className="ttc-kpi-label">Churn Soon (≤6mo)</div>
          <div className="ttc-kpi-value" style={{color:"#ff4d6d"}}>{soon.toLocaleString()}</div>
          <div className="ttc-kpi-sub">Immediate action needed</div>
        </div>
        <div className="ttc-kpi">
          <div className="ttc-kpi-top" style={{background:"#ffc107",opacity:0.6}}/>
          <div className="ttc-kpi-label">Medium Window (7–18mo)</div>
          <div className="ttc-kpi-value" style={{color:"#ffc107"}}>{mid.toLocaleString()}</div>
          <div className="ttc-kpi-sub">Plan retention campaign</div>
        </div>
        <div className="ttc-kpi">
          <div className="ttc-kpi-top" style={{background:"#00e5c3",opacity:0.6}}/>
          <div className="ttc-kpi-label">Avg Time to Churn</div>
          <div className="ttc-kpi-value" style={{color:"#00e5c3"}}>{avgTtc.toFixed(1)}<span style={{fontSize:14}}> mo</span></div>
          <div className="ttc-kpi-sub">Fleet average</div>
        </div>
      </div>

      {/* FILTER BAR */}
      <div className="ttc-filter-bar">
        <span className="ttc-filter-label">Time Window</span>
        <div className="ttc-filter-pills">
          {TIME_FILTERS.map(f => (
            <button
              key={f}
              className={`ttc-pill${timeFilter===f?" active":""} ${f.toLowerCase()}`}
              onClick={() => setTimeFilter(f)}
            >{f === "ALL" ? "All" : f === "SOON" ? "Soon ≤6mo" : f === "MID" ? "Mid 7–18mo" : "Late >18mo"}</button>
          ))}
        </div>

        <span className="ttc-filter-label" style={{marginLeft:12}}>Urgency</span>
        <div className="ttc-filter-pills">
          {URGENCY_FILTERS.map(f => (
            <button
              key={f}
              className={`ttc-pill${urgencyFilter===f?" active":""} ${f.toLowerCase()}`}
              onClick={() => setUrgencyFilter(f)}
            >{f === "ALL" ? "All" : f}</button>
          ))}
        </div>

        <div className="ttc-count">Showing <span>{filtered.length}</span> of {rows.length}</div>
      </div>

      {/* TABLE */}
      <div className="ttc-panel">
        <div className="ttc-panel-header">
          <div className="ttc-panel-title">Customer Survival Timeline</div>
          <div className="ttc-panel-badge">{filtered.length} customers · top 100 shown</div>
        </div>
        <div className="ttc-table-wrap">
          <table className="ttc-table">
            <thead>
              <tr>
                <th>Customer ID</th>
                <th>Time to Churn</th>
                <th>Window</th>
                <th>Churn Risk</th>
                <th>Urgency Score</th>
              </tr>
            </thead>
            <tbody>
              {filtered.slice(0, 100).map(r => {
                const bucket = timeBucket(r.time_to_churn ?? 999);
                const bs     = timeBadgeStyle(bucket);
                const uc     = urgencyColor(r.urgency_score ?? 0);
                return (
                  <tr key={r.customer_id}>
                    <td style={{fontWeight:500}}>{r.customer_id}</td>
                    <td style={{color:"#e2e8f4"}}>{r.time_to_churn?.toFixed(1)} <span style={{color:"#4a5568",fontSize:10}}>mo</span></td>
                    <td>
                      <span className="ttc-time-badge" style={{background:bs.bg,color:bs.color}}>
                        <span className="ttc-time-dot"/>
                        {bs.label}
                      </span>
                    </td>
                    <td style={{color: r.churn_probability > 0.7 ? "#ff4d6d" : r.churn_probability > 0.4 ? "#ffc107" : "#00e5c3", fontWeight:600}}>
                      {r.churn_probability?.toFixed(3)}
                    </td>
                    <td>
                      <div className="ttc-urg-wrap">
                        <div className="ttc-urg-track">
                          <div className="ttc-urg-fill" style={{width:`${(r.urgency_score??0)*100}%`,background:uc}}/>
                        </div>
                        <span style={{fontSize:11,color:uc}}>{(r.urgency_score??0).toFixed(2)}</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* TTC PANELS — wrapped in dark containers */}
      <div className="ttc-chart-panel">
        <div className="ttc-chart-header">
          <div className="ttc-chart-title">Survival Summary</div>
          <div className="ttc-chart-badge">All customers</div>
        </div>
        <TtcPanel rows={rows} />
      </div>

      <div className="ttc-chart-panel">
        <div className="ttc-chart-header">
          <div className="ttc-chart-title">Churn Timeline Distribution</div>
          <div className="ttc-chart-badge">Time buckets</div>
        </div>
        <TtcTimelineChart rows={rows} />
      </div>

      <div className="ttc-chart-panel">
        <div className="ttc-chart-header">
          <div className="ttc-chart-title">TTC × Uplift Heatmap</div>
          <div className="ttc-chart-badge">Risk vs treatability</div>
        </div>
        <TtcUpliftHeatmap rows={rows} />
      </div>

      <div className="ttc-chart-panel">
        <div className="ttc-chart-header">
          <div className="ttc-chart-title">Urgent Decision Panel</div>
          <div className="ttc-chart-badge">Act now customers</div>
        </div>
        <UrgentDecisionPanel rows={rows} />
      </div>

    </div></>
  );
}
