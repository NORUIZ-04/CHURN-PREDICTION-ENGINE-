import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, Cell } from "recharts";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Mono:wght@300;400;500&display=swap');
  .ubc-panel { background:#0f1218; border:1px solid #1e2530; border-radius:12px; padding:20px; font-family:'DM Mono',monospace; }
  .ubc-title { font-family:'Syne',sans-serif; font-size:13px; font-weight:700; margin-bottom:16px; padding-bottom:12px; border-bottom:1px solid #1e2530; color:#e2e8f4; display:flex; align-items:center; gap:7px; }
`;

const TREATMENT_COLORS = ["#00e5c3","#7c6aff","#ffc107","#ff4d6d","#0080ff"];

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{background:"#161b24",border:"1px solid #2d3748",borderRadius:8,padding:"10px 14px",fontFamily:"DM Mono,monospace",fontSize:12,color:"#e2e8f4"}}>
      <div style={{color:"#4a5568",fontSize:10,marginBottom:4}}>{payload[0].payload.treatment}</div>
      <div style={{color:"#00e5c3",fontFamily:"Syne,sans-serif",fontWeight:700}}>Uplift: {Number(payload[0].value).toFixed(4)}</div>
    </div>
  );
};

export default function UpliftBarChart({ data }) {
  if (!data?.length) return null;
  return (
    <>
      <style>{styles}</style>
      <div className="ubc-panel">
        <div className="ubc-title"><span style={{color:"#00e5c3"}}>↑</span> Uplift by Treatment</div>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={data} barCategoryGap="30%">
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false}/>
            <XAxis dataKey="treatment" tick={{fontSize:11,fill:"#4a5568",fontFamily:"DM Mono"}} axisLine={{stroke:"#1e2530"}} tickLine={false}/>
            <YAxis tick={{fontSize:10,fill:"#4a5568",fontFamily:"DM Mono"}} axisLine={false} tickLine={false}/>
            <Tooltip content={<CustomTooltip/>} cursor={{fill:"rgba(255,255,255,0.02)"}}/>
            <Bar dataKey="uplift" radius={[4,4,0,0]}>
              {data.map((_, i) => <Cell key={i} fill={TREATMENT_COLORS[i % TREATMENT_COLORS.length]}/>)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </>
  );
}
