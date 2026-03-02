import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid } from "recharts"

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Mono:wght@300;400;500&display=swap');
  .sbc-panel { background:#0f1218; border:1px solid #1e2530; border-radius:12px; padding:20px; font-family:'DM Mono',monospace; }
  .sbc-header { display:flex; align-items:center; justify-content:space-between; margin-bottom:16px; padding-bottom:12px; border-bottom:1px solid #1e2530; }
  .sbc-title { font-family:'Syne',sans-serif; font-size:13px; font-weight:700; color:#e2e8f4; display:flex; align-items:center; gap:7px; }
  .sbc-legend { display:flex; gap:14px; }
  .sbc-legend-item { display:flex; align-items:center; gap:5px; font-size:10px; color:#4a5568; }
  .sbc-legend-dot { width:8px; height:8px; border-radius:2px; }
`;

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const v = payload[0].value;
  const color = v >= 0 ? "#ff4d6d" : "#00e5c3";
  return (
    <div style={{background:"#161b24",border:"1px solid #2d3748",borderRadius:8,padding:"10px 14px",fontFamily:"DM Mono,monospace",fontSize:12,color:"#e2e8f4"}}>
      <div style={{color:"#4a5568",fontSize:10,marginBottom:4}}>{payload[0].payload.feature}</div>
      <div style={{color,fontFamily:"Syne,sans-serif",fontWeight:700}}>{v >= 0 ? "+" : ""}{Number(v).toFixed(4)}</div>
    </div>
  );
};

export default function ShapBarChart({ data = [] }) {
  if (!Array.isArray(data) || data.length === 0) return null

  const chartData = data
    .map(d => ({ feature: d.feature, impact: Number(d.impact) }))
    .sort((a, b) => Math.abs(b.impact) - Math.abs(a.impact))

  return (
    <>
      <style>{styles}</style>
      <div className="sbc-panel" style={{height:360}}>
        <div className="sbc-header">
          <div className="sbc-title"><span style={{color:"#ffc107"}}>◈</span> SHAP Feature Impact</div>
          <div className="sbc-legend">
            <div className="sbc-legend-item"><span className="sbc-legend-dot" style={{background:"#ff4d6d"}}/>Increases churn</div>
            <div className="sbc-legend-item"><span className="sbc-legend-dot" style={{background:"#00e5c3"}}/>Reduces churn</div>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={chartData} layout="vertical" margin={{left:10,right:10}}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" horizontal={false}/>
            <XAxis type="number" tick={{fontSize:10,fill:"#4a5568",fontFamily:"DM Mono"}} axisLine={{stroke:"#1e2530"}} tickLine={false}/>
            <YAxis dataKey="feature" type="category" width={160} tick={{fontSize:10,fill:"#6b7a95",fontFamily:"DM Mono"}} axisLine={false} tickLine={false}/>
            <Tooltip content={<CustomTooltip/>} cursor={{fill:"rgba(255,255,255,0.02)"}}/>
            <Bar dataKey="impact" radius={[0,4,4,0]}>
              {chartData.map((entry, i) => (
                <Cell key={i} fill={entry.impact >= 0 ? "#ff4d6d" : "#00e5c3"}/>
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </>
  )
}
