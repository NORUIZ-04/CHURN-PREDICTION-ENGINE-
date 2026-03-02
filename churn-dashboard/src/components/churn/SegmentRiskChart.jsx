import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, Cell } from "recharts";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Mono:wght@300;400;500&display=swap');
  .src-panel { background:#0f1218; border:1px solid #1e2530; border-radius:12px; padding:20px; font-family:'DM Mono',monospace; }
  .src-header { display:flex; align-items:center; justify-content:space-between; margin-bottom:16px; padding-bottom:12px; border-bottom:1px solid #1e2530; }
  .src-title { font-family:'Syne',sans-serif; font-size:13px; font-weight:700; color:#e2e8f4; display:flex; align-items:center; gap:7px; }
`;

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const risk = Number(payload[0].value);
  const color = risk > 0.6 ? "#ff4d6d" : risk > 0.35 ? "#ffc107" : "#00e5c3";
  return (
    <div style={{background:"#161b24",border:"1px solid #2d3748",borderRadius:8,padding:"10px 14px",fontFamily:"DM Mono,monospace",fontSize:12,color:"#e2e8f4"}}>
      <div style={{color:"#4a5568",fontSize:10,marginBottom:4}}>{payload[0].payload.segment}</div>
      <div style={{color,fontFamily:"Syne,sans-serif",fontWeight:700}}>Avg Risk: {risk.toFixed(3)}</div>
    </div>
  );
};

function getRiskColor(risk) {
  if (risk > 0.6) return "#ff4d6d";
  if (risk > 0.35) return "#ffc107";
  return "#00e5c3";
}

export default function SegmentRiskChart({ rows }) {
  if (!rows || rows.length === 0) return null;

  const segments = {};
  rows.forEach(r => {
    const key = r.plan_type || "Unknown";
    if (!segments[key]) segments[key] = [];
    segments[key].push(r.churn_probability);
  });

  const data = Object.entries(segments).map(([segment, values]) => ({
    segment,
    risk: values.reduce((a,b)=>a+b,0)/values.length
  }));

  return (
    <>
      <style>{styles}</style>
      <div className="src-panel">
        <div className="src-header">
          <div className="src-title"><span style={{color:"#ffc107"}}>▤</span> Avg Churn Risk by Segment</div>
          <div style={{fontSize:10,color:"#4a5568"}}>{data.length} segments</div>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data} barCategoryGap="25%">
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false}/>
            <XAxis dataKey="segment" tick={{fontSize:10,fill:"#4a5568",fontFamily:"DM Mono"}} axisLine={{stroke:"#1e2530"}} tickLine={false}/>
            <YAxis tick={{fontSize:10,fill:"#4a5568",fontFamily:"DM Mono"}} axisLine={false} tickLine={false} domain={[0,1]}/>
            <Tooltip content={<CustomTooltip/>} cursor={{fill:"rgba(255,255,255,0.02)"}}/>
            <Bar dataKey="risk" radius={[4,4,0,0]}>
              {data.map((entry, i) => <Cell key={i} fill={getRiskColor(entry.risk)}/>)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </>
  );
}
