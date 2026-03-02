import { useState } from "react";
import { api } from "../../api";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Mono:wght@300;400;500&display=swap');
  .dlt-panel { background:#0f1218; border:1px solid #1e2530; border-radius:12px; padding:20px; font-family:'DM Mono',monospace; color:#e2e8f4; margin-top:20px; }
  .dlt-header { display:flex; align-items:center; justify-content:space-between; margin-bottom:16px; padding-bottom:14px; border-bottom:1px solid #1e2530; }
  .dlt-title { font-family:'Syne',sans-serif; font-size:14px; font-weight:700; display:flex; align-items:center; gap:7px; }
  .dlt-btn { font-family:'Syne',sans-serif; font-size:12px; font-weight:700; padding:8px 18px; border-radius:8px; border:none; cursor:pointer; background:#7c6aff; color:#fff; transition:all 0.2s; display:inline-flex; align-items:center; gap:6px; }
  .dlt-btn:hover:not(:disabled) { background:#9585ff; transform:translateY(-1px); box-shadow:0 6px 16px rgba(124,106,255,0.3); }
  .dlt-btn:disabled { opacity:0.5; cursor:not-allowed; }
  .dlt-spinner { width:12px; height:12px; border:2px solid rgba(255,255,255,0.2); border-top-color:#fff; border-radius:50%; animation:spin 0.6s linear infinite; }
  @keyframes spin{to{transform:rotate(360deg)}}
  .dlt-table-wrap { overflow-x:auto; max-height:360px; overflow-y:auto; border:1px solid #1e2530; border-radius:8px; }
  .dlt-table-wrap::-webkit-scrollbar { width:4px; height:4px; }
  .dlt-table-wrap::-webkit-scrollbar-thumb { background:#1e2530; border-radius:2px; }
  .dlt-table { width:100%; border-collapse:collapse; font-size:12px; }
  .dlt-table thead th { font-size:10px; letter-spacing:1.5px; text-transform:uppercase; color:#4a5568; padding:10px 12px; text-align:left; border-bottom:1px solid #1e2530; background:#0f1218; position:sticky; top:0; white-space:nowrap; }
  .dlt-table tbody tr { border-bottom:1px solid rgba(255,255,255,0.03); }
  .dlt-table tbody tr:hover { background:rgba(255,255,255,0.02); }
  .dlt-table td { padding:10px 12px; color:#e2e8f4; }
  .dlt-empty { font-size:12px; color:#4a5568; padding:24px; text-align:center; }
`;

function getLiftColor(lift) {
  if (lift > 1.5) return "#00e5c3";
  if (lift > 1) return "#ffc107";
  return "#ff4d6d";
}

export default function DecileLiftTable({ filename }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const res = await api.post(`/uplift/eval/deciles/${filename}`);
      setRows(res.data.deciles || []);
    } catch (e) {
      console.error(e);
      alert("Decile load failed");
    }
    setLoading(false);
  }

  return (
    <>
      <style>{styles}</style>
      <div className="dlt-panel">
        <div className="dlt-header">
          <div className="dlt-title"><span style={{color:"#7c6aff"}}>▦</span> Decile Lift Table</div>
          <button className="dlt-btn" onClick={load} disabled={loading}>
            {loading ? <><span className="dlt-spinner"/>Computing…</> : <>◎ Compute Deciles</>}
          </button>
        </div>

        {!loading && rows.length === 0 && (
          <div className="dlt-empty">Click Compute Deciles to run lift analysis</div>
        )}

        {rows.length > 0 && (
          <div className="dlt-table-wrap">
            <table className="dlt-table">
              <thead>
                <tr>
                  <th>Decile</th>
                  <th>Customers</th>
                  <th>Avg Uplift</th>
                  <th>Treat Rate</th>
                  <th>Control Rate</th>
                  <th>Lift</th>
                  <th>Gain</th>
                </tr>
              </thead>
              <tbody>
                {rows.map(r => {
                  const liftColor = getLiftColor(r.lift);
                  return (
                    <tr key={r.decile}>
                      <td style={{color:"#4a5568",fontWeight:700}}>{r.decile}</td>
                      <td>{r.customers}</td>
                      <td style={{color:"#7c6aff"}}>{r.avg_uplift.toFixed(3)}</td>
                      <td>{r.treat_rate.toFixed(3)}</td>
                      <td>{r.control_rate.toFixed(3)}</td>
                      <td style={{color:liftColor,fontFamily:"Syne,sans-serif",fontWeight:700}}>{r.lift.toFixed(3)}</td>
                      <td style={{color:"#e2e8f4"}}>{r.gain.toFixed(1)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
