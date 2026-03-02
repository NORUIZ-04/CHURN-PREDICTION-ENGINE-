import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, Cell } from "recharts";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Mono:wght@300;400;500&display=swap');
  .rp-panel { background:#0f1218; border:1px solid #1e2530; border-radius:12px; padding:20px; font-family:'DM Mono',monospace; }
  .rp-title { font-family:'Syne',sans-serif; font-size:13px; font-weight:700; margin-bottom:16px; color:#e2e8f4; display:flex; align-items:center; gap:7px; }
`;

const BUCKET_COLORS = {
  "0.0-0.2": "#00e5c3",
  "0.2-0.4": "#7c6aff",
  "0.4-0.6": "#ffc107",
  "0.6-0.8": "#ff6b35",
  "0.8-1.0": "#ff4d6d",
};

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{background:"#161b24",border:"1px solid #2d3748",borderRadius:8,padding:"10px 14px",fontFamily:"DM Mono,monospace",fontSize:12,color:"#e2e8f4"}}>
      <div style={{color:"#4a5568",fontSize:10,marginBottom:4}}>Bucket {payload[0].payload.bucket}</div>
      <div style={{color:"#ff4d6d",fontFamily:"Syne,sans-serif",fontWeight:700}}>{payload[0].value} customers</div>
    </div>
  );
};

export default function RiskHistogram({ data }) {
  return (
    <>
      <style>{styles}</style>
      <div className="rp-panel">
        <div className="rp-title"><span style={{color:"#ff4d6d"}}>⚡</span> Churn Risk Distribution</div>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data} barCategoryGap="20%">
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false}/>
            <XAxis dataKey="bucket" tick={{fontSize:10,fill:"#4a5568",fontFamily:"DM Mono"}} axisLine={{stroke:"#1e2530"}} tickLine={false}/>
            <YAxis tick={{fontSize:10,fill:"#4a5568",fontFamily:"DM Mono"}} axisLine={false} tickLine={false}/>
            <Tooltip content={<CustomTooltip/>} cursor={{fill:"rgba(255,255,255,0.02)"}}/>
            <Bar dataKey="count" radius={[6,6,0,0]}>
              {(data||[]).map((entry,i) => (
                <Cell key={i} fill={BUCKET_COLORS[entry.bucket] || "#ff4d6d"}/>
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </>
  );
}
