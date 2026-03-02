import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, Cell } from "recharts"
import { useDrilldownStore } from "../../store/drilldownStore"

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Mono:wght@300;400;500&display=swap');
  .ptbc-panel { background:#0f1218; border:1px solid #1e2530; border-radius:12px; padding:20px; font-family:'DM Mono',monospace; }
  .ptbc-title { font-family:'Syne',sans-serif; font-size:13px; font-weight:700; margin-bottom:16px; color:#e2e8f4; display:flex; align-items:center; gap:7px; }
`;

const SEGMENT_COLORS = ["#00e5c3","#7c6aff","#ffc107","#ff4d6d","#0080ff","#4a5568"];

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{background:"#161b24",border:"1px solid #2d3748",borderRadius:8,padding:"10px 14px",fontFamily:"DM Mono,monospace",fontSize:12,color:"#e2e8f4"}}>
      <div style={{color:"#4a5568",fontSize:10,marginBottom:4}}>{payload[0].payload.segment}</div>
      <div style={{color:"#00e5c3",fontFamily:"Syne,sans-serif",fontWeight:700}}>{payload[0].value}</div>
    </div>
  );
};

export default function SegmentBarChart({ segments, column }) {
  const openDrill = useDrilldownStore(s => s.openDrill)

  if (!segments) return null

  return (
    <>
      <style>{styles}</style>
      <div className="ptbc-panel">
        <div className="ptbc-title"><span style={{color:"#00e5c3"}}>▤</span> {column || "Segment"} Distribution</div>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={segments} barCategoryGap="25%" onClick={(d) => d?.activePayload && openDrill(column, d.activePayload[0]?.payload?.segment)}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false}/>
            <XAxis dataKey="segment" tick={{fontSize:10,fill:"#4a5568",fontFamily:"DM Mono"}} axisLine={{stroke:"#1e2530"}} tickLine={false}/>
            <YAxis tick={{fontSize:10,fill:"#4a5568",fontFamily:"DM Mono"}} axisLine={false} tickLine={false}/>
            <Tooltip content={<CustomTooltip/>} cursor={{fill:"rgba(255,255,255,0.02)"}}/>
            <Bar dataKey="count" radius={[4,4,0,0]} style={{cursor:"pointer"}}>
              {segments.map((_, i) => (
                <Cell key={i} fill={SEGMENT_COLORS[i % SEGMENT_COLORS.length]}/>
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </>
  )
}
