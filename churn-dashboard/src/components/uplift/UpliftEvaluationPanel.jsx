import { useState } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from "recharts";
import { api } from "../../api";
import { useDatasetStore } from "../../store/datasetStore";
import DecileLiftTable from "./DecileLiftTable";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Mono:wght@300;400;500&display=swap');
  .uep-root { font-family:'DM Mono',monospace; color:#e2e8f4; animation:uepFade 0.4s ease; }
  @keyframes uepFade { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }

  .uep-panel { background:#0f1218; border:1px solid #1e2530; border-radius:12px; padding:24px; margin-bottom:20px; }
  .uep-header { display:flex; align-items:center; justify-content:space-between; margin-bottom:20px; padding-bottom:16px; border-bottom:1px solid #1e2530; }
  .uep-title { font-family:'Syne',sans-serif; font-size:15px; font-weight:700; display:flex; align-items:center; gap:7px; }

  .uep-btn { font-family:'Syne',sans-serif; font-size:12px; font-weight:700; padding:10px 22px; border-radius:9px; border:none; cursor:pointer; background:#00e5c3; color:#080b10; transition:all 0.2s; display:inline-flex; align-items:center; gap:6px; }
  .uep-btn:hover:not(:disabled) { background:#00ffd5; transform:translateY(-1px); box-shadow:0 6px 18px rgba(0,229,195,0.25); }
  .uep-btn:disabled { opacity:0.5; cursor:not-allowed; }
  .uep-spinner { width:12px; height:12px; border:2px solid rgba(0,0,0,0.2); border-top-color:#080b10; border-radius:50%; animation:spin 0.6s linear infinite; }
  @keyframes spin{to{transform:rotate(360deg)}}

  .uep-loading-bar { height:2px; background:#1e2530; border-radius:1px; overflow:hidden; margin-bottom:12px; }
  .uep-loading-fill { height:100%; width:40%; background:linear-gradient(90deg,#00e5c3,#7c6aff); animation:loadSlide 1.2s ease-in-out infinite; }
  @keyframes loadSlide { 0%{transform:translateX(-100%)} 100%{transform:translateX(350%)} }

  .uep-metrics { display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-bottom:20px; }
  .uep-kpi { background:#161b24; border:1px solid #1e2530; border-radius:10px; padding:14px 16px; position:relative; overflow:hidden; }
  .uep-kpi-top { position:absolute; top:0; left:0; right:0; height:2px; }
  .uep-kpi-label { font-size:9px; letter-spacing:1.5px; text-transform:uppercase; color:#4a5568; margin-bottom:6px; }
  .uep-kpi-value { font-family:'Syne',sans-serif; font-size:22px; font-weight:800; }

  .uep-chart-panel { background:#0f1218; border:1px solid #1e2530; border-radius:12px; padding:20px; margin-bottom:16px; }
  .uep-chart-title { font-family:'Syne',sans-serif; font-size:13px; font-weight:700; margin-bottom:14px; display:flex; align-items:center; gap:7px; }

  .uep-empty { font-size:12px; color:#2d3748; padding:24px; text-align:center; }
`;

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{background:"#161b24",border:"1px solid #2d3748",borderRadius:8,padding:"10px 14px",fontFamily:"DM Mono,monospace",fontSize:12,color:"#e2e8f4"}}>
      <div style={{color:"#00e5c3",fontFamily:"Syne,sans-serif",fontWeight:700}}>{Number(payload[0].value).toFixed(4)}</div>
    </div>
  );
};

function getFilename(path) {
  if (!path) return null;
  return path.split("/").pop().split("\\").pop();
}

export default function UpliftEvaluationPanel() {
  const datasetPath = useDatasetStore(s => s.datasetPath);
  const [metrics, setMetrics] = useState(null);
  const [qiniData, setQiniData] = useState([]);
  const [gainData, setGainData] = useState([]);
  const [loading, setLoading] = useState(false);

  async function runEval() {
    if (!datasetPath) { alert("Upload dataset first"); return; }
    const filename = getFilename(datasetPath);
    setLoading(true);
    try {
      const res = await api.post(`/uplift/evaluate/${filename}`);
      console.log("EVAL RESPONSE:", res.data);
      const d = res.data;
      setMetrics({ auuc: d.metrics?.auuc ?? 0, qini: d.metrics?.qini ?? 0 });
      if (d.qini_curve?.x && d.qini_curve?.y) {
        setQiniData(d.qini_curve.x.map((v,i) => ({ x: v, y: d.qini_curve.y[i] })));
      }
      if (d.gain_curve?.x && d.gain_curve?.y) {
        setGainData(d.gain_curve.x.map((v,i) => ({ x: v, y: d.gain_curve.y[i] })));
      }
    } catch (e) {
      console.error("Eval error:", e.response?.data || e);
      alert("Evaluation failed — check console");
    }
    setLoading(false);
  }

  return (
    <>
      <style>{styles}</style>
      <div className="uep-root">
        <div className="uep-panel">
          <div className="uep-header">
            <div className="uep-title"><span style={{color:"#00e5c3"}}>◎</span> Uplift Model Evaluation</div>
            <button className="uep-btn" onClick={runEval} disabled={loading}>
              {loading ? <><span className="uep-spinner"/>Evaluating…</> : <>⚡ Run Evaluation</>}
            </button>
          </div>

          {loading && (
            <div>
              <div className="uep-loading-bar"><div className="uep-loading-fill"/></div>
              <div style={{fontSize:11,color:"#4a5568",textAlign:"center",marginBottom:12}}>Running uplift evaluation…</div>
            </div>
          )}

          {!metrics && !loading && <div className="uep-empty">Run evaluation to compute AUUC, Qini curve, and Gain curve</div>}

          {metrics && (
            <div className="uep-metrics">
              <div className="uep-kpi">
                <div className="uep-kpi-top" style={{background:"#00e5c3"}}/>
                <div className="uep-kpi-label">AUUC</div>
                <div className="uep-kpi-value" style={{color:"#00e5c3"}}>{metrics.auuc.toFixed(4)}</div>
              </div>
              <div className="uep-kpi">
                <div className="uep-kpi-top" style={{background:"#7c6aff"}}/>
                <div className="uep-kpi-label">Qini Score</div>
                <div className="uep-kpi-value" style={{color:"#7c6aff"}}>{metrics.qini.toFixed(4)}</div>
              </div>
            </div>
          )}
        </div>

        {qiniData.length > 0 && (
          <div className="uep-chart-panel">
            <div className="uep-chart-title"><span style={{color:"#7c6aff"}}>◑</span> Qini Curve</div>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={qiniData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)"/>
                <XAxis dataKey="x" tick={{fontSize:10,fill:"#4a5568",fontFamily:"DM Mono"}} axisLine={{stroke:"#1e2530"}} tickLine={false}/>
                <YAxis tick={{fontSize:10,fill:"#4a5568",fontFamily:"DM Mono"}} axisLine={false} tickLine={false}/>
                <Tooltip content={<CustomTooltip/>}/>
                <Line dataKey="y" stroke="#7c6aff" strokeWidth={2} dot={false}/>
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {gainData.length > 0 && (
          <div className="uep-chart-panel">
            <div className="uep-chart-title"><span style={{color:"#00e5c3"}}>↑</span> Gain Curve</div>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={gainData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)"/>
                <XAxis dataKey="x" tick={{fontSize:10,fill:"#4a5568",fontFamily:"DM Mono"}} axisLine={{stroke:"#1e2530"}} tickLine={false}/>
                <YAxis tick={{fontSize:10,fill:"#4a5568",fontFamily:"DM Mono"}} axisLine={false} tickLine={false}/>
                <Tooltip content={<CustomTooltip/>}/>
                <Line dataKey="y" stroke="#00e5c3" strokeWidth={2} dot={false}/>
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {datasetPath && <DecileLiftTable filename={getFilename(datasetPath)}/>}
      </div>
    </>
  );
}
