import { useEffect, useState } from "react";
import { api } from "../api";
import { useDatasetStore } from "../store/datasetStore";
import TtcPanel from "../components/ttc/TtcPanel";
import TtcTimelineChart from "../components/ttc/TtcTimelineChart";
import TtcUpliftHeatmap from "../components/ttc/TtcUpliftHeatmap";
import UrgentDecisionPanel from "../components/ttc/UrgentDecisionPanel";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Mono:wght@300;400;500&display=swap');
  .ttcc-root { font-family:'DM Mono',monospace; color:#e2e8f4; animation:ttccFade 0.5s ease; padding:24px; }
  @keyframes ttccFade { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }

  .ttcc-page-header { display:flex; align-items:flex-start; justify-content:space-between; margin-bottom:24px; }
  .ttcc-page-title { font-family:'Syne',sans-serif; font-size:22px; font-weight:800; display:flex; align-items:center; gap:10px; margin-bottom:4px; }
  .ttcc-page-sub { font-size:12px; color:#4a5568; }

  .ttcc-btn { font-family:'Syne',sans-serif; font-size:12px; font-weight:700; padding:10px 22px; border-radius:9px; border:none; cursor:pointer; background:#00e5c3; color:#080b10; transition:all 0.2s; display:inline-flex; align-items:center; gap:6px; }
  .ttcc-btn:hover:not(:disabled) { background:#00ffd5; transform:translateY(-1px); box-shadow:0 6px 18px rgba(0,229,195,0.25); }
  .ttcc-btn:disabled { opacity:0.5; cursor:not-allowed; }
  .ttcc-spinner { width:13px; height:13px; border:2px solid rgba(0,0,0,0.2); border-top-color:#080b10; border-radius:50%; animation:spin 0.6s linear infinite; }
  @keyframes spin{to{transform:rotate(360deg)}}

  .ttcc-kpi-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:14px; margin-bottom:24px; }
  .ttcc-kpi { background:#0f1218; border:1px solid #1e2530; border-radius:12px; padding:20px 18px; position:relative; overflow:hidden; transition:all 0.2s; }
  .ttcc-kpi:hover { border-color:rgba(0,229,195,0.2); transform:translateY(-2px); }
  .ttcc-kpi-top { position:absolute; top:0; left:0; right:0; height:2px; }
  .ttcc-kpi-label { font-size:10px; letter-spacing:1.5px; text-transform:uppercase; color:#4a5568; margin-bottom:10px; }
  .ttcc-kpi-value { font-family:'Syne',sans-serif; font-size:26px; font-weight:800; letter-spacing:-0.5px; line-height:1; }

  .ttcc-main-grid { display:grid; grid-template-columns:1fr 1fr; gap:20px; }
  .ttcc-col { display:flex; flex-direction:column; gap:20px; }

  .ttcc-card { background:#0f1218; border:1px solid #1e2530; border-radius:12px; padding:20px; }
  .ttcc-card-title { font-family:'Syne',sans-serif; font-size:14px; font-weight:700; margin-bottom:16px; padding-bottom:12px; border-bottom:1px solid #1e2530; display:flex; align-items:center; gap:7px; }

  .ttcc-loading { display:flex; align-items:center; gap:10px; font-size:12px; color:#4a5568; padding:48px; justify-content:center; }

  .ttcc-empty { display:flex; flex-direction:column; align-items:center; justify-content:center; min-height:55vh; text-align:center; gap:14px; }
`;

const KPI_COLORS = ["#00e5c3","#ff4d6d","#ffc107","#7c6aff"];
const KPI_ICONS = ["⏱","⬇","🔥","◎"];

function KpiCard({ label, value, colorIdx }) {
  return (
    <div className="ttcc-kpi">
      <div className="ttcc-kpi-top" style={{background:KPI_COLORS[colorIdx]}}/>
      <div className="ttcc-kpi-label">{label}</div>
      <div className="ttcc-kpi-value" style={{color:KPI_COLORS[colorIdx]}}>{value ?? "—"}</div>
    </div>
  );
}

function getFilename(path) {
  if (!path) return null;
  return path.split(/[\\/]/).pop();
}

export default function TtcCommandCenter() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const datasetPath = useDatasetStore(s => s.datasetPath);

  async function loadSummary() {
    if (!datasetPath) { alert("Upload dataset first"); return; }
    const filename = getFilename(datasetPath);
    setLoading(true);
    try {
      const res = await api.get(`/timetochurn/summary/${filename}`);
      setSummary(res.data);
    } catch (e) {
      console.error(e);
      alert("Failed to load TTC summary");
    }
    setLoading(false);
  }

  useEffect(() => { loadSummary(); }, [datasetPath]);

  if (!datasetPath) return (
    <>
      <style>{styles}</style>
      <div className="ttcc-root">
        <div className="ttcc-empty">
          <div style={{width:72,height:72,background:"#0f1218",border:"1px solid #1e2530",borderRadius:18,display:"flex",alignItems:"center",justifyContent:"center",fontSize:32}}>⏱</div>
          <div style={{fontFamily:"Syne,sans-serif",fontSize:20,fontWeight:800}}>No Dataset Loaded</div>
          <div style={{fontSize:12,color:"#4a5568",lineHeight:1.9,maxWidth:340}}>Upload a dataset to access the <strong style={{color:"#00e5c3"}}>TTC Command Center</strong>.</div>
        </div>
      </div>
    </>
  );

  return (
    <>
      <style>{styles}</style>
      <div className="ttcc-root">
        {/* HEADER */}
        <div className="ttcc-page-header">
          <div>
            <div className="ttcc-page-title">
              <span style={{color:"#00e5c3"}}>⏱</span> TTC Command Center
            </div>
            <div className="ttcc-page-sub">Executive churn risk & intervention intelligence view</div>
          </div>
          <button className="ttcc-btn" onClick={loadSummary} disabled={loading}>
            {loading ? <><span className="ttcc-spinner"/>Refreshing…</> : <>↺ Refresh</>}
          </button>
        </div>

        {/* KPI STRIP */}
        {summary && (
          <div className="ttcc-kpi-grid">
            <KpiCard label="Avg Time to Churn" value={summary.avg_time_to_churn?.toFixed(1)} colorIdx={0}/>
            <KpiCard label="Min Time to Churn" value={summary.min_time_to_churn?.toFixed(1)} colorIdx={1}/>
            <KpiCard label="Urgent Customers" value={summary.urgent_customers?.length || 0} colorIdx={2}/>
            <KpiCard label="System Status" value={loading ? "Updating…" : "Ready"} colorIdx={3}/>
          </div>
        )}

        {loading && (
          <div className="ttcc-loading">
            <span className="ttcc-spinner" style={{borderTopColor:"#00e5c3",borderColor:"#1e2530"}}/>
            Loading TTC intelligence…
          </div>
        )}

        {/* MAIN GRID */}
        <div className="ttcc-main-grid">
          <div className="ttcc-col">
            <div className="ttcc-card">
              <div className="ttcc-card-title"><span style={{color:"#ff4d6d"}}>🔥</span> Urgency Intelligence</div>
              <TtcPanel />
            </div>
            <div className="ttcc-card">
              <div className="ttcc-card-title"><span style={{color:"#00e5c3"}}>⏳</span> TTC Timeline Distribution</div>
              <TtcTimelineChart />
            </div>
          </div>
          <div className="ttcc-col">
            <div className="ttcc-card">
              <div className="ttcc-card-title"><span style={{color:"#ffc107"}}>◎</span> TTC × Uplift Priority Map</div>
              <TtcUpliftHeatmap />
            </div>
            <div className="ttcc-card">
              <div className="ttcc-card-title"><span style={{color:"#7c6aff"}}>⚡</span> Budget-Constrained Urgent Decisions</div>
              <UrgentDecisionPanel />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
