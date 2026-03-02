import { useEffect, useState } from "react"
import { datasetApi } from "../api/datasetApi"
import { useDatasetStore } from "../store/datasetStore"
import KpiCard from "../components/KpiCard"
import GlobalShapChart from "../components/GlobalShapChart"
import ActionMixChart from "../components/ActionMixChart"
import TopTargetsTable from "../components/TopTargetsTable"

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Mono:wght@300;400;500&display=swap');
  .rd-root { font-family:'DM Mono',monospace; color:#e2e8f4; animation:rdFade 0.5s ease; padding:24px; }
  @keyframes rdFade { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
  .rd-page-title { font-family:'Syne',sans-serif; font-size:22px; font-weight:800; margin-bottom:20px; display:flex; align-items:center; gap:10px; }
  .rd-kpi-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:14px; margin-bottom:20px; }
  .rd-chart-grid { display:grid; grid-template-columns:1fr 1fr; gap:20px; margin-bottom:20px; }
  .rd-loading { display:flex; align-items:center; gap:10px; font-size:12px; color:#4a5568; padding:40px; justify-content:center; }
  .rd-spinner { width:16px; height:16px; border:2px solid #1e2530; border-top-color:#00e5c3; border-radius:50%; animation:spin 0.6s linear infinite; }
  @keyframes spin{to{transform:rotate(360deg)}}
`;

function fmtCount(val) {
  const n = Number(val);
  if (!isFinite(n)) return "—";
  if (n >= 1_000_000) return `${(n/1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n/1_000).toFixed(1)}K`;
  return n.toLocaleString();
}

export default function RetentionDashboard() {
  const datasetPath = useDatasetStore(s => s.datasetPath);
  const filename = datasetPath;

  const [shap, setShap] = useState([])
  const [decisions, setDecisions] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!filename) return;
    setLoading(true);
    Promise.all([
      datasetApi.getGlobalShap(filename).then(r => setShap(r.data)),
      datasetApi.getDecisions(filename, 5000, 20).then(r => setDecisions(r.data))
    ]).finally(() => setLoading(false));
  }, [filename])

  const highRisk = decisions.filter(d => d.risk > 0.7).length
  const avgRisk = decisions.length ? decisions.reduce((a,b)=>a+b.risk,0)/decisions.length : 0
  const totalROI = decisions.reduce((a,b)=>a+(b.roi||0),0)

  if (!datasetPath) return (
    <>
      <style>{styles}</style>
      <div className="rd-root">
        <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",minHeight:"55vh",gap:14,textAlign:"center"}}>
          <div style={{width:72,height:72,background:"#0f1218",border:"1px solid #1e2530",borderRadius:18,display:"flex",alignItems:"center",justifyContent:"center",fontSize:32}}>🛡</div>
          <div style={{fontFamily:"Syne,sans-serif",fontSize:20,fontWeight:800}}>No Dataset Loaded</div>
          <div style={{fontSize:12,color:"#4a5568",lineHeight:1.9,maxWidth:340}}>Upload a dataset to view the <strong style={{color:"#00e5c3"}}>Retention Control Center</strong>.</div>
        </div>
      </div>
    </>
  );

  return (
    <>
      <style>{styles}</style>
      <div className="rd-root">
        <div className="rd-page-title">
          <span style={{color:"#00e5c3"}}>🛡</span> Retention Control Center
        </div>

        {loading ? (
          <div className="rd-loading"><span className="rd-spinner"/>Loading retention data…</div>
        ) : (
          <>
            <div className="rd-kpi-grid">
              <KpiCard title="Customers Reviewed" value={fmtCount(decisions.length)} color="#00e5c3"/>
              <KpiCard title="High Risk" value={fmtCount(highRisk)} color="#ff4d6d"/>
              <KpiCard title="Avg Risk Score" value={avgRisk.toFixed(3)} color="#ffc107"/>
              <KpiCard title="Total ROI" value={`₹${fmtCount(totalROI)}`} color="#7c6aff"/>
            </div>
            <div className="rd-chart-grid">
              <GlobalShapChart data={shap} />
              <ActionMixChart rows={decisions} />
            </div>
            <TopTargetsTable rows={decisions.slice(0,10)} />
          </>
        )}
      </div>
    </>
  );
}
