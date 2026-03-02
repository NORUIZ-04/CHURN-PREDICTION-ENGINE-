import { useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis,
  Tooltip, CartesianGrid, ResponsiveContainer, Cell
} from "recharts";
import { api } from "../../api";
import { useDatasetStore } from "../../store/datasetStore";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Mono:wght@300;400;500&display=swap');

  .ttc-root { font-family:'DM Mono',monospace; color:#e2e8f4; animation:ttcFade 0.5s ease; }
  @keyframes ttcFade { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }

  .ttc-panel { background:#0f1218; border:1px solid #1e2530; border-radius:12px; padding:24px; }

  .ttc-header { display:flex; align-items:center; justify-content:space-between; margin-bottom:24px; padding-bottom:16px; border-bottom:1px solid #1e2530; }
  .ttc-title { font-family:'Syne',sans-serif; font-size:15px; font-weight:700; display:flex; align-items:center; gap:8px; }
  .ttc-badge { font-size:10px; color:#4a5568; padding:4px 10px; background:#161b24; border:1px solid #1e2530; border-radius:20px; letter-spacing:1px; text-transform:uppercase; }

  .ttc-btn { font-family:'Syne',sans-serif; font-size:12px; font-weight:700; padding:9px 20px; border-radius:9px; border:none; cursor:pointer; background:#00e5c3; color:#080b10; transition:all 0.2s; display:inline-flex; align-items:center; gap:6px; }
  .ttc-btn:hover:not(:disabled) { background:#00ffd5; transform:translateY(-1px); box-shadow:0 6px 18px rgba(0,229,195,0.25); }
  .ttc-btn:disabled { opacity:0.5; cursor:not-allowed; }

  .ttc-loading { display:flex; align-items:center; gap:10px; font-size:12px; color:#4a5568; padding:12px 0; }
  .ttc-spinner { width:14px; height:14px; border:2px solid #1e2530; border-top-color:#00e5c3; border-radius:50%; animation:spin 0.6s linear infinite; }
  @keyframes spin { to{transform:rotate(360deg)} }

  .ttc-empty { display:flex; flex-direction:column; align-items:center; justify-content:center; min-height:200px; gap:10px; color:#4a5568; font-size:12px; }
  .ttc-empty-icon { font-size:28px; opacity:0.3; }
`;

const BUCKET_COLORS = {
  "0–3":  "#ff4d6d",
  "3–6":  "#ffc107",
  "6–12": "#7c6aff",
  "12–24":"#00e5c3",
  "24+":  "#4a5568",
};

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0];
  return (
    <div style={{background:"#161b24",border:"1px solid #2d3748",borderRadius:8,padding:"10px 14px",fontFamily:"DM Mono,monospace",fontSize:12,color:"#e2e8f4"}}>
      <div style={{color:"#4a5568",fontSize:10,letterSpacing:"1px",textTransform:"uppercase",marginBottom:4}}>{d.payload.range} hrs</div>
      <div style={{color:BUCKET_COLORS[d.payload.range]||"#00e5c3",fontFamily:"Syne,sans-serif",fontWeight:700,fontSize:16}}>{d.value} customers</div>
    </div>
  );
};

export default function TtcTimelineChart() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const datasetPath = useDatasetStore(s => s.datasetPath);

  async function load() {
    if (!datasetPath) {
      alert("Upload a dataset first");
      return;
    }
    setLoading(true);
    try {
      const res = await api.get(`/timetochurn/summary/${datasetPath}`);
      const rows = res.data.urgent_customers || [];
      const buckets = { "0–3": 0, "3–6": 0, "6–12": 0, "12–24": 0, "24+": 0 };
      rows.forEach(r => {
        const t = r.time_to_churn ?? 999;
        if (t <= 3) buckets["0–3"]++;
        else if (t <= 6) buckets["3–6"]++;
        else if (t <= 12) buckets["6–12"]++;
        else if (t <= 24) buckets["12–24"]++;
        else buckets["24+"]++;
      });
      const chartData = Object.entries(buckets).map(([range, count]) => ({ range, count }));
      setData(chartData);
    } catch (e) {
      console.error(e);
      alert("Timeline load failed");
    }
    setLoading(false);
  }

  return (
    <>
      <style>{styles}</style>
      <div className="ttc-root">
        <div className="ttc-panel">
          <div className="ttc-header">
            <div className="ttc-title">
              <span style={{color:"#00e5c3"}}>⏳</span> Time-to-Churn Timeline
            </div>
            <div style={{display:"flex",alignItems:"center",gap:10}}>
              <span className="ttc-badge">Hours</span>
              <button className="ttc-btn" onClick={load} disabled={loading}>
                {loading ? <><span className="ttc-spinner"/>Computing…</> : <>⚡ Load Timeline</>}
              </button>
            </div>
          </div>

          {!loading && data.length === 0 && (
            <div className="ttc-empty">
              <div className="ttc-empty-icon">⏳</div>
              <div>Click Load Timeline to compute churn windows</div>
            </div>
          )}

          {loading && (
            <div className="ttc-loading">
              <span className="ttc-spinner"/>
              Computing timeline buckets…
            </div>
          )}

          {data.length > 0 && (
            <div style={{width:"100%",height:320}}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} barCategoryGap="30%">
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false}/>
                  <XAxis
                    dataKey="range"
                    tick={{fontSize:11,fill:"#4a5568",fontFamily:"DM Mono"}}
                    axisLine={{stroke:"#1e2530"}}
                    tickLine={false}
                    label={{value:"Hours to Churn",position:"insideBottom",offset:-2,fontSize:10,fill:"#2d3748",fontFamily:"DM Mono"}}
                  />
                  <YAxis
                    tick={{fontSize:10,fill:"#4a5568",fontFamily:"DM Mono"}}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip content={<CustomTooltip/>} cursor={{fill:"rgba(255,255,255,0.02)"}}/>
                  <Bar dataKey="count" radius={[4,4,0,0]}>
                    {data.map((entry) => (
                      <Cell key={entry.range} fill={BUCKET_COLORS[entry.range] || "#00e5c3"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {data.length > 0 && (
            <div style={{display:"flex",gap:16,marginTop:16,flexWrap:"wrap"}}>
              {Object.entries(BUCKET_COLORS).map(([range, color]) => (
                <div key={range} style={{display:"flex",alignItems:"center",gap:5,fontSize:11,color:"#6b7a95"}}>
                  <span style={{width:8,height:8,borderRadius:2,background:color,display:"inline-block"}}/>
                  {range} hrs
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
