import { useEffect, useState } from "react";
import { api } from "../api";
import { useDatasetStore } from "../store/datasetStore";
import UpliftEvaluationPanel from "../components/uplift/UpliftEvaluationPanel";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Mono:wght@300;400;500&display=swap');
  .ua-root { font-family:'DM Mono',monospace; color:#e2e8f4; animation:uaFade 0.5s ease; padding:24px; }
  @keyframes uaFade { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }

  .ua-page-title { font-family:'Syne',sans-serif; font-size:22px; font-weight:800; margin-bottom:20px; display:flex; align-items:center; gap:10px; }
  .ua-panel { background:#0f1218; border:1px solid #1e2530; border-radius:12px; padding:24px; margin-bottom:20px; }
  .ua-panel-header { display:flex; align-items:center; justify-content:space-between; margin-bottom:16px; padding-bottom:14px; border-bottom:1px solid #1e2530; }
  .ua-panel-title { font-family:'Syne',sans-serif; font-size:14px; font-weight:700; }
  .ua-badge { font-size:10px; color:#7c6aff; padding:3px 10px; background:rgba(124,106,255,0.1); border:1px solid rgba(124,106,255,0.2); border-radius:20px; letter-spacing:1px; }

  .ua-table-wrap { overflow-x:auto; max-height:420px; overflow-y:auto; border:1px solid #1e2530; border-radius:8px; }
  .ua-table-wrap::-webkit-scrollbar { width:4px; height:4px; }
  .ua-table-wrap::-webkit-scrollbar-thumb { background:#1e2530; border-radius:2px; }
  .ua-table { width:100%; border-collapse:collapse; font-size:12px; }
  .ua-table thead th { font-size:10px; letter-spacing:1.5px; text-transform:uppercase; color:#4a5568; padding:10px 14px; text-align:left; border-bottom:1px solid #1e2530; background:#0f1218; position:sticky; top:0; z-index:1; white-space:nowrap; }
  .ua-table tbody tr { border-bottom:1px solid rgba(255,255,255,0.03); transition:background 0.12s; }
  .ua-table tbody tr:hover { background:rgba(0,229,195,0.03); }
  .ua-table td { padding:10px 14px; color:#e2e8f4; }

  .ua-loading { display:flex; align-items:center; gap:10px; font-size:12px; color:#4a5568; padding:32px; justify-content:center; }
  .ua-spinner { width:14px; height:14px; border:2px solid #1e2530; border-top-color:#00e5c3; border-radius:50%; animation:spin 0.6s linear infinite; }
  @keyframes spin{to{transform:rotate(360deg)}}

  .ua-action-pill { display:inline-flex; align-items:center; gap:4px; padding:3px 10px; border-radius:20px; font-size:10px; background:rgba(124,106,255,0.1); color:#7c6aff; border:1px solid rgba(124,106,255,0.2); }
  .ua-empty { display:flex; flex-direction:column; align-items:center; justify-content:center; padding:48px; gap:12px; text-align:center; }
`;

function getRiskColor(uplift) {
  const u = Number(uplift);
  if (u > 0.05) return "#00e5c3";
  if (u > 0.02) return "#ffc107";
  return "#ff4d6d";
}

function getFilename(path) {
  if (!path) return "";
  return path.split("/").pop().split("\\").pop();
}

export default function UpliftActions() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const datasetPath = useDatasetStore(s => s.datasetPath);

  useEffect(() => {
    if (!datasetPath) return;
    const filename = getFilename(datasetPath);
    api.get(`/decision/plan/${filename}?budget=6000`)
      .then(r => { console.log("UPLIFT ACTION ROWS:", r.data); setRows(r.data); })
      .catch(e => console.error(e))
      .finally(() => setLoading(false));
  }, [datasetPath]);

  return (
    <>
      <style>{styles}</style>
      <div className="ua-root">
        <div className="ua-page-title">
          <span style={{color:"#00e5c3"}}>⚡</span> Uplift & Actions
        </div>

        <div className="ua-panel">
          <div className="ua-panel-header">
            <div className="ua-panel-title">Action Plan — Budget ₹6,000</div>
            <span className="ua-badge">{rows.length} customers</span>
          </div>

          {loading && (
            <div className="ua-loading">
              <span className="ua-spinner"/>Loading action plan…
            </div>
          )}

          {!loading && rows.length === 0 && (
            <div className="ua-empty">
              <div style={{fontSize:28,opacity:0.3}}>⚡</div>
              <div style={{fontSize:12,color:"#4a5568"}}>No action rows returned</div>
            </div>
          )}

          {rows.length > 0 && (
            <div className="ua-table-wrap">
              <table className="ua-table">
                <thead>
                  <tr>
                    <th>Customer ID</th>
                    <th>Uplift</th>
                    <th>ROI</th>
                    <th>Recommended Action</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map(r => (
                    <tr key={r.customer_id}>
                      <td style={{color:"#6b7a95"}}>{r.customer_id}</td>
                      <td style={{color:getRiskColor(r.uplift),fontFamily:"Syne,sans-serif",fontWeight:700}}>
                        {Number(r.uplift).toFixed(3)}
                      </td>
                      <td style={{color:"#e2e8f4"}}>{Number(r.roi).toFixed(2)}</td>
                      <td><span className="ua-action-pill">● {r.recommended_action}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div style={{width:"100%",minHeight:900}}>
          <UpliftEvaluationPanel rows={rows} />
        </div>
      </div>
    </>
  );
}
