import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts"

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Mono:wght@300;400;500&display=swap');
  .amc-panel { background:#0f1218; border:1px solid #1e2530; border-radius:12px; padding:20px; font-family:'DM Mono',monospace; }
  .amc-header { display:flex; align-items:center; justify-content:space-between; margin-bottom:16px; padding-bottom:12px; border-bottom:1px solid #1e2530; }
  .amc-title { font-family:'Syne',sans-serif; font-size:13px; font-weight:700; color:#e2e8f4; display:flex; align-items:center; gap:7px; }
  .amc-legend { display:flex; flex-wrap:wrap; gap:10px; margin-top:14px; }
  .amc-legend-item { display:flex; align-items:center; gap:6px; font-size:11px; color:#6b7a95; }
  .amc-legend-dot { width:8px; height:8px; border-radius:50%; }
`;

const PIE_COLORS = ["#00e5c3","#7c6aff","#ffc107","#ff4d6d","#0080ff","#ff6b35"];

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{background:"#161b24",border:"1px solid #2d3748",borderRadius:8,padding:"10px 14px",fontFamily:"DM Mono,monospace",fontSize:12,color:"#e2e8f4"}}>
      <div style={{color:"#4a5568",fontSize:10,marginBottom:4}}>{payload[0].name}</div>
      <div style={{color:payload[0].payload.fill,fontFamily:"Syne,sans-serif",fontWeight:700}}>{payload[0].value} customers</div>
    </div>
  );
};

export default function ActionMixChart({ rows }) {
  if (!rows?.length) return null

  const counts = {}
  rows.forEach(r => {
    const a = r.recommended_action || "none"
    counts[a] = (counts[a] || 0) + 1
  })

  const data = Object.entries(counts).map(([k,v], i) => ({
    name: k, value: v, fill: PIE_COLORS[i % PIE_COLORS.length]
  }))

  return (
    <>
      <style>{styles}</style>
      <div className="amc-panel">
        <div className="amc-header">
          <div className="amc-title"><span style={{color:"#7c6aff"}}>◑</span> Recommended Action Mix</div>
          <div style={{fontSize:10,color:"#4a5568"}}>{rows.length} customers</div>
        </div>
        <ResponsiveContainer width="100%" height={260}>
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="name" outerRadius={100} innerRadius={40}>
              {data.map((entry, i) => <Cell key={i} fill={entry.fill}/>)}
            </Pie>
            <Tooltip content={<CustomTooltip/>}/>
          </PieChart>
        </ResponsiveContainer>
        <div className="amc-legend">
          {data.map(d => (
            <div key={d.name} className="amc-legend-item">
              <span className="amc-legend-dot" style={{background:d.fill}}/>
              {d.name} ({d.value})
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
