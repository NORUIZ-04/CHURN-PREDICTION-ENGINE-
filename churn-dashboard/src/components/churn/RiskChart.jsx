import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Mono:wght@300;400;500&display=swap');
  .rc-panel { background:#0f1218; border:1px solid #1e2530; border-radius:12px; padding:20px; font-family:'DM Mono',monospace; }
  .rc-header { display:flex; align-items:center; justify-content:space-between; margin-bottom:16px; padding-bottom:12px; border-bottom:1px solid #1e2530; }
  .rc-title { font-family:'Syne',sans-serif; font-size:13px; font-weight:700; color:#e2e8f4; display:flex; align-items:center; gap:7px; }
  .rc-legend { display:flex; gap:16px; margin-top:16px; flex-wrap:wrap; }
  .rc-legend-item { display:flex; align-items:center; gap:6px; font-size:11px; color:#6b7a95; }
  .rc-legend-dot { width:8px; height:8px; border-radius:50%; }
`;

const SEGMENTS = [
  { name: "High Risk", key: "high", color: "#ff4d6d", threshold: v => v > 0.7 },
  { name: "Medium Risk", key: "medium", color: "#ffc107", threshold: v => v > 0.4 && v <= 0.7 },
  { name: "Low Risk", key: "low", color: "#00e5c3", threshold: v => v <= 0.4 },
];

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{background:"#161b24",border:"1px solid #2d3748",borderRadius:8,padding:"10px 14px",fontFamily:"DM Mono,monospace",fontSize:12,color:"#e2e8f4"}}>
      <div style={{color:"#4a5568",fontSize:10,marginBottom:4}}>{payload[0].name}</div>
      <div style={{color:payload[0].payload.fill,fontFamily:"Syne,sans-serif",fontWeight:700}}>{payload[0].value} customers</div>
    </div>
  );
};

export default function RiskChart({ rows }) {
  if (!rows || rows.length === 0) return null;

  const data = SEGMENTS.map(s => ({
    name: s.name,
    value: rows.filter(r => s.threshold(r.churn_probability)).length,
    fill: s.color
  }));

  return (
    <>
      <style>{styles}</style>
      <div className="rc-panel">
        <div className="rc-header">
          <div className="rc-title"><span style={{color:"#ff4d6d"}}>◑</span> Churn Risk Breakdown</div>
          <div style={{fontSize:10,color:"#4a5568"}}>{rows.length} customers</div>
        </div>
        <ResponsiveContainer width="100%" height={280}>
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="name" outerRadius={110} innerRadius={50}>
              {data.map((entry, i) => <Cell key={i} fill={entry.fill}/>)}
            </Pie>
            <Tooltip content={<CustomTooltip/>}/>
          </PieChart>
        </ResponsiveContainer>
        <div className="rc-legend">
          {SEGMENTS.map(s => (
            <div key={s.key} className="rc-legend-item">
              <span className="rc-legend-dot" style={{background:s.color}}/>
              {s.name}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
