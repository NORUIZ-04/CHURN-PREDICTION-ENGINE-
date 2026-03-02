import { useEffect, useState } from "react";
import {
  ScatterChart, Scatter,
  XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer
} from "recharts";
import { api } from "../../api";
import { useDatasetStore } from "../../store/datasetStore";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Mono:wght@300;400;500&display=swap');

  .hm-root { font-family:'DM Mono',monospace; color:#e2e8f4; animation:hmFade 0.5s ease; }
  @keyframes hmFade { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }

  .hm-panel { background:#0f1218; border:1px solid #1e2530; border-radius:12px; padding:24px; }
  .hm-header { display:flex; align-items:center; justify-content:space-between; margin-bottom:24px; padding-bottom:16px; border-bottom:1px solid #1e2530; }
  .hm-title { font-family:'Syne',sans-serif; font-size:15px; font-weight:700; display:flex; align-items:center; gap:8px; }
  .hm-badge { font-size:10px; color:#4a5568; padding:4px 10px; background:#161b24; border:1px solid #1e2530; border-radius:20px; letter-spacing:1px; text-transform:uppercase; }

  .hm-btn { font-family:'Syne',sans-serif; font-size:12px; font-weight:700; padding:9px 20px; border-radius:9px; border:none; cursor:pointer; background:#161b24; color:#e2e8f4; border:1px solid #1e2530; transition:all 0.2s; display:inline-flex; align-items:center; gap:6px; }
  .hm-btn:hover { border-color:rgba(0,229,195,0.3); color:#00e5c3; }

  .hm-spinner { width:14px; height:14px; border:2px solid #1e2530; border-top-color:#ff4d6d; border-radius:50%; animation:spin 0.6s linear infinite; }
  @keyframes spin { to{transform:rotate(360deg)} }

  .hm-loading { display:flex; align-items:center; gap:10px; font-size:12px; color:#4a5568; padding:12px 0; }

  .hm-empty { display:flex; flex-direction:column; align-items:center; justify-content:center; min-height:200px; gap:10px; color:#4a5568; font-size:12px; }

  .hm-legend { display:flex; gap:20px; margin-top:16px; flex-wrap:wrap; }
  .hm-legend-item { display:flex; align-items:center; gap:6px; font-size:11px; color:#6b7a95; }
  .hm-legend-dot { width:10px; height:10px; border-radius:50%; }
`;

function getUrgencyColor(u) {
  if (u > 0.7) return "#ff4d6d";
  if (u > 0.4) return "#ffc107";
  return "#00e5c3";
}

function dotWithUrgency(props) {
  if (!props || !props.payload) return null;
  const { cx, cy, payload } = props;
  const fill = getUrgencyColor(payload.z ?? 0);
  return (
    <circle cx={cx} cy={cy} r={6} fill={fill} fillOpacity={0.85} stroke={fill} strokeWidth={1} strokeOpacity={0.4}/>
  );
}

function Tip({ active, payload }) {
  if (!active || !payload || payload.length === 0) return null;
  const p = payload[0].payload;
  const color = getUrgencyColor(p.z ?? 0);
  return (
    <div style={{background:"#161b24",border:"1px solid #2d3748",borderRadius:8,padding:"12px 14px",fontFamily:"DM Mono,monospace",fontSize:12,color:"#e2e8f4",minWidth:160}}>
      <div style={{color:"#4a5568",fontSize:10,letterSpacing:"1px",textTransform:"uppercase",marginBottom:8}}>Customer {p.id}</div>
      <div style={{display:"flex",flexDirection:"column",gap:4}}>
        <div style={{display:"flex",justifyContent:"space-between",gap:16}}><span style={{color:"#4a5568"}}>TTC</span><span style={{color:"#e2e8f4"}}>{p.x?.toFixed?.(1)} hrs</span></div>
        <div style={{display:"flex",justifyContent:"space-between",gap:16}}><span style={{color:"#4a5568"}}>Uplift</span><span style={{color:"#7c6aff"}}>{p.y?.toFixed?.(3)}</span></div>
        <div style={{display:"flex",justifyContent:"space-between",gap:16}}><span style={{color:"#4a5568"}}>Urgency</span><span style={{color}}>{p.z?.toFixed?.(2)}</span></div>
      </div>
    </div>
  );
}

function getFilename(path) {
  if (!path) return null;
  return path.split(/[\\/]/).pop();
}

export default function TtcUpliftHeatmap() {
  const [points, setPoints] = useState([]);
  const [loading, setLoading] = useState(false);

  const datasetPath = useDatasetStore(s => s.datasetPath);

  async function load() {
    const filename = getFilename(datasetPath);
    if (!filename) { alert("Dataset not selected"); return; }
    setLoading(true);
    try {
      const res = await api.get(`/timetochurn/summary/${filename}`);
      const rows = res.data?.urgent_customers || [];
      const p = rows.map(r => ({
        x: Number(r.time_to_churn ?? 0),
        y: Number(r.uplift ?? 0),
        z: Number(r.urgency_score ?? 0),
        id: r.customer_id
      }));
      setPoints(p);
    } catch (e) {
      console.error(e);
      alert("Heatmap load failed");
    }
    setLoading(false);
  }

  useEffect(() => {
    if (datasetPath) load();
  }, [datasetPath]);

  return (
    <>
      <style>{styles}</style>
      <div className="hm-root">
        <div className="hm-panel">
          <div className="hm-header">
            <div className="hm-title">
              <span style={{color:"#ff4d6d"}}>🔥</span> TTC × Uplift Priority Map
            </div>
            <div style={{display:"flex",alignItems:"center",gap:10}}>
              <span className="hm-badge">{points.length} points</span>
              <button className="hm-btn" onClick={load} disabled={loading}>
                {loading ? <><span className="hm-spinner"/>Loading…</> : <>↺ Reload</>}
              </button>
            </div>
          </div>

          {loading && (
            <div className="hm-loading">
              <span className="hm-spinner"/>Building priority map…
            </div>
          )}

          {!loading && points.length === 0 && (
            <div className="hm-empty">
              <div style={{fontSize:28,opacity:0.3}}>🔥</div>
              <div>No priority data available</div>
            </div>
          )}

          {points.length > 0 && (
            <div style={{width:"100%",height:380,background:"#0a0e14",borderRadius:8,border:"1px solid #1e2530",padding:"12px 8px"}}>
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{top:10,right:20,bottom:20,left:10}}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)"/>
                  <XAxis
                    type="number"
                    dataKey="x"
                    name="Time to Churn"
                    tick={{fontSize:10,fill:"#4a5568",fontFamily:"DM Mono"}}
                    axisLine={{stroke:"#1e2530"}}
                    tickLine={false}
                    label={{value:"Time to Churn (hrs)",position:"insideBottom",offset:-8,fontSize:10,fill:"#2d3748",fontFamily:"DM Mono"}}
                  />
                  <YAxis
                    type="number"
                    dataKey="y"
                    name="Uplift"
                    tick={{fontSize:10,fill:"#4a5568",fontFamily:"DM Mono"}}
                    axisLine={false}
                    tickLine={false}
                    label={{value:"Uplift Score",angle:-90,position:"insideLeft",offset:10,fontSize:10,fill:"#2d3748",fontFamily:"DM Mono"}}
                  />
                  <Tooltip content={<Tip/>} cursor={{strokeDasharray:"3 3",stroke:"#2d3748"}}/>
                  <Scatter data={points} shape={dotWithUrgency}/>
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          )}

          <div className="hm-legend">
            {[
              {color:"#ff4d6d",label:"High urgency (>0.7)"},
              {color:"#ffc107",label:"Medium urgency (0.4–0.7)"},
              {color:"#00e5c3",label:"Low urgency (<0.4)"},
            ].map(({color,label}) => (
              <div key={label} className="hm-legend-item">
                <span className="hm-legend-dot" style={{background:color}}/>
                {label}
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
