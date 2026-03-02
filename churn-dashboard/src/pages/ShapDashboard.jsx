import { useDatasetStore } from "../store/datasetStore"
import { useQuery } from "@tanstack/react-query"
import { datasetApi } from "../api/datasetApi"
import ShapGlobalChart from "../components/charts/ShapGlobalChart"

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Mono:wght@300;400;500&display=swap');
  .sd-root { font-family:'DM Mono',monospace; color:#e2e8f4; animation:sdFade 0.5s ease; padding:24px; }
  @keyframes sdFade { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
  .sd-panel { background:#0f1218; border:1px solid #1e2530; border-radius:12px; padding:24px; margin-bottom:20px; }
  .sd-header { display:flex; align-items:center; justify-content:space-between; margin-bottom:20px; padding-bottom:16px; border-bottom:1px solid #1e2530; }
  .sd-title { font-family:'Syne',sans-serif; font-size:18px; font-weight:800; display:flex; align-items:center; gap:10px; }
  .sd-badge { font-size:10px; color:#ffc107; padding:3px 10px; background:rgba(255,193,7,0.1); border:1px solid rgba(255,193,7,0.2); border-radius:20px; letter-spacing:1px; text-transform:uppercase; }
  .sd-loading-bar { height:2px; background:#1e2530; border-radius:1px; overflow:hidden; margin-bottom:20px; }
  .sd-loading-fill { height:100%; width:40%; background:linear-gradient(90deg,#ffc107,#00e5c3); animation:loadSlide 1.2s ease-in-out infinite; }
  @keyframes loadSlide { 0%{transform:translateX(-100%)} 100%{transform:translateX(350%)} }
  .sd-error { background:rgba(255,77,109,0.08); border:1px solid rgba(255,77,109,0.2); border-radius:8px; padding:14px 18px; font-size:13px; color:#ff4d6d; display:flex; align-items:center; gap:8px; }
  .sd-empty { display:flex; flex-direction:column; align-items:center; justify-content:center; min-height:55vh; text-align:center; gap:14px; }
  .sd-empty-icon { width:72px; height:72px; background:#0f1218; border:1px solid #1e2530; border-radius:18px; display:flex; align-items:center; justify-content:center; font-size:32px; }
`;

export default function ShapDashboard() {
  const path = useDatasetStore(s => s.datasetPath)

  if (!path) return (
    <>
      <style>{styles}</style>
      <div className="sd-root">
        <div className="sd-empty">
          <div className="sd-empty-icon">◈</div>
          <div style={{fontFamily:"Syne,sans-serif",fontSize:20,fontWeight:800}}>No Dataset Loaded</div>
          <div style={{fontSize:12,color:"#4a5568",lineHeight:1.9,maxWidth:340}}>Upload a dataset to explore <strong style={{color:"#00e5c3"}}>SHAP feature importance</strong>.</div>
        </div>
      </div>
    </>
  );

  const fileName = path.split("\\").pop().split("/").pop()

  const shapQ = useQuery({
    queryKey: ["shapGlobal", fileName],
    queryFn: () => datasetApi.globalShap(fileName).then(r => r.data),
    enabled: !!fileName
  })

  return (
    <>
      <style>{styles}</style>
      <div className="sd-root">
        <div className="sd-panel">
          <div className="sd-header">
            <div className="sd-title">
              <span style={{color:"#ffc107"}}>◈</span> SHAP Feature Importance
              <span className="sd-badge">Global</span>
            </div>
            <div style={{fontSize:11,color:"#4a5568",fontFamily:"DM Mono,monospace"}}>{fileName}</div>
          </div>

          {shapQ.isLoading && (
            <div>
              <div className="sd-loading-bar"><div className="sd-loading-fill"/></div>
              <div style={{fontSize:12,color:"#4a5568",textAlign:"center"}}>Computing SHAP values…</div>
            </div>
          )}

          {shapQ.isError && (
            <div className="sd-error">⚠ Error loading SHAP data — check backend connection</div>
          )}

          {shapQ.data && <ShapGlobalChart data={shapQ.data} />}
        </div>
      </div>
    </>
  );
}
