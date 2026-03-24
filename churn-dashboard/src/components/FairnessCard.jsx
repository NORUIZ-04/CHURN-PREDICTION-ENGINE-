import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid } from "recharts";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Mono:wght@300;400;500&display=swap');

  .fc-card {
    background: #0f1218;
    border: 1px solid #1e2530;
    border-radius: 12px;
    padding: 18px;
    font-family: 'DM Mono', monospace;
    position: relative;
    overflow: hidden;
    transition: border-color 0.2s;
  }
  .fc-card:hover { border-color: rgba(124,106,255,0.2); }

  .fc-top-bar {
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 2px;
  }

  .fc-header {
    margin-bottom: 14px;
    padding-bottom: 12px;
    border-bottom: 1px solid #1e2530;
  }

  .fc-attr {
    font-family: 'Syne', sans-serif;
    font-size: 13px;
    font-weight: 700;
    color: #e2e8f4;
    margin-bottom: 10px;
    display: flex;
    align-items: center;
    gap: 7px;
  }

  .fc-status-row {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  }

  .fc-pill {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 3px 9px;
    border-radius: 20px;
    font-size: 10px;
    letter-spacing: 0.5px;
  }

  .fc-pill-label {
    color: #4a5568;
    font-size: 9px;
    letter-spacing: 1px;
    text-transform: uppercase;
    margin-right: 2px;
  }

  .fc-dot { width:5px; height:5px; border-radius:50%; display:inline-block; }

  .fc-rate-row {
    display: flex;
    justify-content: space-between;
    font-size: 11px;
    color: #4a5568;
    margin-bottom: 8px;
  }

  .fc-rate-val {
    color: #e2e8f4;
    font-weight: 500;
  }
`;

function getStatusStyle(status) {
  if (status === "COMPLIANT" || status === "PASS")
    return { bg:"rgba(0,229,195,0.08)", color:"#00e5c3", border:"rgba(0,229,195,0.2)", label:"PASS" };
  if (status === "WARNING")
    return { bg:"rgba(255,193,7,0.08)", color:"#ffc107", border:"rgba(255,193,7,0.2)", label:"WARN" };
  return { bg:"rgba(255,77,109,0.08)", color:"#ff4d6d", border:"rgba(255,77,109,0.2)", label:"FAIL" };
}

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{background:"#161b24",border:"1px solid #2d3748",borderRadius:8,padding:"8px 12px",fontFamily:"DM Mono,monospace",fontSize:12,color:"#e2e8f4"}}>
      <div style={{color:"#4a5568",fontSize:10,marginBottom:3}}>{payload[0].payload.name}</div>
      <div style={{color:"#7c6aff",fontFamily:"Syne,sans-serif",fontWeight:700}}>{(payload[0].value * 100).toFixed(1)}%</div>
    </div>
  );
};

export default function FairnessCard({
  attribute_name,
  group_0_positive_rate,
  group_1_positive_rate,
  dp_status,
  eo_status
}) {
  const dpStyle = getStatusStyle(dp_status);
  const eoStyle = getStatusStyle(eo_status);

  const allPass = dpStyle.label === "PASS" && eoStyle.label === "PASS";
  const topColor = allPass ? "#00e5c3" : dpStyle.label === "FAIL" || eoStyle.label === "FAIL" ? "#ff4d6d" : "#ffc107";

  const data = [
    { name: "Group 0", value: group_0_positive_rate ?? 0 },
    { name: "Group 1", value: group_1_positive_rate ?? 0 },
  ];

  const barColors = ["#7c6aff", "#00e5c3"];

  return (
    <>
      <style>{styles}</style>
      <div className="fc-card">
        <div className="fc-top-bar" style={{background: topColor}}/>

        <div className="fc-header">
          <div className="fc-attr">
            <span style={{color:"#7c6aff"}}>◈</span>
            {attribute_name}
          </div>
          <div className="fc-status-row">
            <span>
              <span className="fc-pill-label">DP</span>
              <span
                className="fc-pill"
                style={{background:dpStyle.bg, color:dpStyle.color, border:`1px solid ${dpStyle.border}`}}
              >
                <span className="fc-dot" style={{background:dpStyle.color}}/>
                {dpStyle.label}
              </span>
            </span>
            <span>
              <span className="fc-pill-label">EO</span>
              <span
                className="fc-pill"
                style={{background:eoStyle.bg, color:eoStyle.color, border:`1px solid ${eoStyle.border}`}}
              >
                <span className="fc-dot" style={{background:eoStyle.color}}/>
                {eoStyle.label}
              </span>
            </span>
          </div>
        </div>

        <div className="fc-rate-row">
          <span>Group 0 Rate</span>
          <span className="fc-rate-val">{((group_0_positive_rate ?? 0) * 100).toFixed(1)}%</span>
        </div>
        <div className="fc-rate-row" style={{marginBottom:12}}>
          <span>Group 1 Rate</span>
          <span className="fc-rate-val">{((group_1_positive_rate ?? 0) * 100).toFixed(1)}%</span>
        </div>

        <ResponsiveContainer width="100%" height={90}>
          <BarChart data={data} barCategoryGap="35%" margin={{top:0,right:0,bottom:0,left:0}}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false}/>
            <XAxis dataKey="name" tick={{fontSize:9,fill:"#4a5568",fontFamily:"DM Mono"}} axisLine={false} tickLine={false}/>
            <YAxis hide domain={[0,1]}/>
            <Tooltip content={<CustomTooltip/>} cursor={{fill:"rgba(255,255,255,0.02)"}}/>
            <Bar dataKey="value" radius={[3,3,0,0]}>
              {data.map((_,i) => <Cell key={i} fill={barColors[i]}/>)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </>
  );
}
