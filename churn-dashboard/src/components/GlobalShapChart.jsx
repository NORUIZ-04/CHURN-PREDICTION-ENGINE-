import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid } from "recharts"

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Mono:wght@300;400;500&display=swap');
  .gsc-panel { background:#0f1218; border:1px solid #1e2530; border-radius:12px; padding:20px; font-family:'DM Mono',monospace; }
  .gsc-title { font-family:'Syne',sans-serif; font-size:13px; font-weight:700; margin-bottom:16px; padding-bottom:12px; border-bottom:1px solid #1e2530; color:#e2e8f4; display:flex; align-items:center; gap:7px; }
`;

const COLORS = ["#00e5c3","#7c6aff","#ffc107","#0080ff","#ff4d6d"];
const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{background:"#161b24",border:"1px solid #2d3748",borderRadius:8,padding:"10px 14px",fontFamily:"DM Mono,monospace",fontSize:12,color:"#e2e8f4"}}>
      <div style={{color:"#4a5568",fontSize:10,marginBottom:4}}>{payload[0].payload.feature}</div>
      <div style={{color:"#ffc107",fontFamily:"Syne,sans-serif",fontWeight:700}}>{Number(payload[0].value).toFixed(4)}</div>
    </div>
  );
};

export default function GlobalShapChart({ data }) {
  if (!data?.length) return null

  return (
    <>
      <style>{styles}</style>
      <div className="gsc-panel" style={{height:340}}>
        <div className="gsc-title"><span style={{color:"#ffc107"}}>◈</span> Global Feature Importance</div>
        <ResponsiveContainer width="100%" height={270}>
          <BarChart data={data} layout="vertical" margin={{left:10,right:10}}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" horizontal={false}/>
            <XAxis type="number" tick={{fontSize:10,fill:"#4a5568",fontFamily:"DM Mono"}} axisLine={{stroke:"#1e2530"}} tickLine={false}/>
            <YAxis dataKey="feature" type="category" width={140} tick={{fontSize:10,fill:"#6b7a95",fontFamily:"DM Mono"}} axisLine={false} tickLine={false}/>
            <Tooltip content={<CustomTooltip/>} cursor={{fill:"rgba(255,255,255,0.02)"}}/>
            <Bar dataKey="importance" radius={[0,4,4,0]}>
              {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]}/>)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </>
  )
}
