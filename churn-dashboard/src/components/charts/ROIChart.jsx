import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid } from "recharts";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Mono:wght@300;400;500&display=swap');
  .roi-panel { background:#0f1218; border:1px solid #1e2530; border-radius:12px; padding:20px; font-family:'DM Mono',monospace; }
  .roi-title { font-family:'Syne',sans-serif; font-size:13px; font-weight:700; margin-bottom:16px; color:#e2e8f4; display:flex; align-items:center; gap:7px; }
`;

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{background:"#161b24",border:"1px solid #2d3748",borderRadius:8,padding:"10px 14px",fontFamily:"DM Mono,monospace",fontSize:12,color:"#e2e8f4"}}>
      <div style={{color:"#4a5568",fontSize:10,marginBottom:4}}>Customer {payload[0].payload.customer_id}</div>
      <div style={{color:"#7c6aff",fontFamily:"Syne,sans-serif",fontWeight:700}}>ROI: ₹{Number(payload[0].value).toFixed(2)}</div>
    </div>
  );
};

export default function ROIChart({ data }) {
  return (
    <>
      <style>{styles}</style>
      <div className="roi-panel">
        <div className="roi-title"><span style={{color:"#7c6aff"}}>₹</span> ROI — Top Customers</div>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data} barCategoryGap="20%">
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false}/>
            <XAxis dataKey="customer_id" tick={{fontSize:10,fill:"#4a5568",fontFamily:"DM Mono"}} axisLine={{stroke:"#1e2530"}} tickLine={false}/>
            <YAxis tick={{fontSize:10,fill:"#4a5568",fontFamily:"DM Mono"}} axisLine={false} tickLine={false}/>
            <Tooltip content={<CustomTooltip/>} cursor={{fill:"rgba(255,255,255,0.02)"}}/>
            <Bar dataKey="roi" radius={[6,6,0,0]}>
              {(data||[]).map((entry, i) => (
                <Cell key={i} fill={Number(entry.roi) > 0 ? "#7c6aff" : "#ff4d6d"}/>
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </>
  );
}
