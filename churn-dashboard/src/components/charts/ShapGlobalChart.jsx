import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid } from "recharts"

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Mono:wght@300;400;500&display=swap');
  .sgc-panel { background:#0f1218; border:1px solid #1e2530; border-radius:12px; padding:20px; font-family:'DM Mono',monospace; }
  .sgc-header { display:flex; align-items:center; justify-content:space-between; margin-bottom:16px; padding-bottom:12px; border-bottom:1px solid #1e2530; }
  .sgc-title { font-family:'Syne',sans-serif; font-size:13px; font-weight:700; color:#e2e8f4; display:flex; align-items:center; gap:7px; }
  .sgc-badge { font-size:10px; color:#ffc107; padding:3px 10px; background:rgba(255,193,7,0.1); border:1px solid rgba(255,193,7,0.2); border-radius:20px; }
`;

const IMPORTANCE_COLORS = ["#00e5c3","#7c6aff","#ffc107","#0080ff","#ff4d6d","#00e5c3","#7c6aff","#ffc107","#0080ff","#ff4d6d","#00e5c3","#7c6aff","#ffc107","#0080ff","#ff4d6d"];

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{background:"#161b24",border:"1px solid #2d3748",borderRadius:8,padding:"10px 14px",fontFamily:"DM Mono,monospace",fontSize:12,color:"#e2e8f4"}}>
      <div style={{color:"#4a5568",fontSize:10,marginBottom:4}}>{payload[0].payload.feature}</div>
      <div style={{color:"#ffc107",fontFamily:"Syne,sans-serif",fontWeight:700}}>{Number(payload[0].value).toFixed(4)}</div>
    </div>
  );
};

export default function ShapGlobalChart({ data = [] }) {
  const safe = Array.isArray(data)
    ? data.map(d => ({ feature: String(d.feature ?? ""), importance: Number(d.importance ?? 0) }))
        .sort((a,b) => b.importance - a.importance).slice(0, 15)
    : []

  return (
    <>
      <style>{styles}</style>
      <div className="sgc-panel" style={{height:420}}>
        <div className="sgc-header">
          <div className="sgc-title"><span style={{color:"#ffc107"}}>◈</span> SHAP Global Feature Importance</div>
          <span className="sgc-badge">Top {safe.length}</span>
        </div>
        <ResponsiveContainer width="100%" height={340}>
          <BarChart data={safe} layout="vertical" margin={{left:10,right:20}}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" horizontal={false}/>
            <XAxis type="number" tick={{fontSize:10,fill:"#4a5568",fontFamily:"DM Mono"}} axisLine={{stroke:"#1e2530"}} tickLine={false}/>
            <YAxis type="category" dataKey="feature" width={180} tick={{fontSize:10,fill:"#6b7a95",fontFamily:"DM Mono"}} axisLine={false} tickLine={false}/>
            <Tooltip content={<CustomTooltip/>} cursor={{fill:"rgba(255,255,255,0.02)"}}/>
            <Bar dataKey="importance" radius={[0,4,4,0]}>
              {safe.map((_, i) => <Cell key={i} fill={IMPORTANCE_COLORS[i % IMPORTANCE_COLORS.length]}/>)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </>
  )
}
