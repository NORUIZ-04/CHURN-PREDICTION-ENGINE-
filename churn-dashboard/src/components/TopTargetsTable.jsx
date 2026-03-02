const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Mono:wght@300;400;500&display=swap');
  .ttt-panel { background:#0f1218; border:1px solid #1e2530; border-radius:12px; padding:20px; font-family:'DM Mono',monospace; }
  .ttt-header { display:flex; align-items:center; justify-content:space-between; margin-bottom:16px; padding-bottom:14px; border-bottom:1px solid #1e2530; }
  .ttt-title { font-family:'Syne',sans-serif; font-size:14px; font-weight:700; display:flex; align-items:center; gap:7px; }
  .ttt-badge { font-size:10px; color:#00e5c3; padding:3px 10px; background:rgba(0,229,195,0.1); border:1px solid rgba(0,229,195,0.2); border-radius:20px; }
  .ttt-wrap { overflow-x:auto; border:1px solid #1e2530; border-radius:8px; }
  .ttt-wrap::-webkit-scrollbar { width:4px; height:4px; }
  .ttt-wrap::-webkit-scrollbar-thumb { background:#1e2530; border-radius:2px; }
  .ttt-table { width:100%; border-collapse:collapse; font-size:12px; }
  .ttt-table thead th { font-size:10px; letter-spacing:1.5px; text-transform:uppercase; color:#4a5568; padding:10px 14px; text-align:left; border-bottom:1px solid #1e2530; background:#0f1218; position:sticky; top:0; }
  .ttt-table tbody tr { border-bottom:1px solid rgba(255,255,255,0.03); transition:background 0.12s; }
  .ttt-table tbody tr:hover { background:rgba(0,229,195,0.03); }
  .ttt-table td { padding:10px 14px; color:#e2e8f4; }
  .ttt-action-pill { display:inline-flex; align-items:center; gap:4px; padding:3px 10px; border-radius:20px; font-size:10px; background:rgba(124,106,255,0.1); color:#7c6aff; border:1px solid rgba(124,106,255,0.2); }
`;

function getRiskColor(risk) {
  const r = Number(risk);
  if (r > 0.7) return "#ff4d6d";
  if (r > 0.4) return "#ffc107";
  return "#00e5c3";
}

export default function TopTargetsTable({ rows }) {
  if (!rows?.length) return null

  return (
    <>
      <style>{styles}</style>
      <div className="ttt-panel">
        <div className="ttt-header">
          <div className="ttt-title"><span style={{color:"#00e5c3"}}>🎯</span> Top Save Candidates</div>
          <span className="ttt-badge">{rows.length} customers</span>
        </div>
        <div className="ttt-wrap">
          <table className="ttt-table">
            <thead>
              <tr>
                <th>Customer ID</th>
                <th>Risk</th>
                <th>ROI</th>
                <th>Recommended Action</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(r => {
                const risk = Number(r.risk ?? 0);
                const color = getRiskColor(risk);
                return (
                  <tr key={r.customer_id}>
                    <td style={{color:"#6b7a95"}}>{r.customer_id}</td>
                    <td>
                      <div style={{display:"flex",alignItems:"center",gap:8}}>
                        <div style={{width:48,height:3,background:"#1e2530",borderRadius:2,overflow:"hidden"}}>
                          <div style={{width:`${risk*100}%`,height:"100%",background:color,borderRadius:2}}/>
                        </div>
                        <span style={{color,fontFamily:"Syne,sans-serif",fontWeight:700,fontSize:12}}>{risk.toFixed(2)}</span>
                      </div>
                    </td>
                    <td style={{color:"#e2e8f4"}}>₹{Number(r.roi ?? 0).toFixed(2)}</td>
                    <td><span className="ttt-action-pill">● {r.recommended_action}</span></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}
