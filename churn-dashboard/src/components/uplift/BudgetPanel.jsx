import { useState } from "react";
import { runBudgetOptimize } from "../../api/upliftApi";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Mono:wght@300;400;500&display=swap');
  .bp-panel { background:#0f1218; border:1px solid #1e2530; border-radius:12px; padding:24px; font-family:'DM Mono',monospace; color:#e2e8f4; }
  .bp-header { display:flex; align-items:center; justify-content:space-between; margin-bottom:20px; padding-bottom:16px; border-bottom:1px solid #1e2530; }
  .bp-title { font-family:'Syne',sans-serif; font-size:14px; font-weight:700; display:flex; align-items:center; gap:7px; }

  .bp-control-row { display:flex; align-items:center; gap:14px; margin-bottom:20px; flex-wrap:wrap; }
  .bp-label { font-size:11px; color:#4a5568; white-space:nowrap; }
  .bp-input { font-family:'DM Mono',monospace; font-size:13px; color:#e2e8f4; background:#161b24; border:1px solid #1e2530; border-radius:8px; padding:9px 12px; outline:none; width:120px; transition:border-color 0.2s; }
  .bp-input:focus { border-color:rgba(0,229,195,0.4); }

  .bp-btn { font-family:'Syne',sans-serif; font-size:12px; font-weight:700; padding:9px 20px; border-radius:8px; border:none; cursor:pointer; background:#00e5c3; color:#080b10; transition:all 0.2s; display:inline-flex; align-items:center; gap:6px; }
  .bp-btn:hover:not(:disabled) { background:#00ffd5; transform:translateY(-1px); box-shadow:0 6px 16px rgba(0,229,195,0.25); }
  .bp-btn:disabled { opacity:0.5; cursor:not-allowed; }
  .bp-spinner { width:12px; height:12px; border:2px solid rgba(0,0,0,0.2); border-top-color:#080b10; border-radius:50%; animation:spin 0.6s linear infinite; }
  @keyframes spin{to{transform:rotate(360deg)}}

  .bp-summary { display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-bottom:16px; }
  .bp-kpi { background:#161b24; border:1px solid #1e2530; border-radius:8px; padding:12px 14px; position:relative; overflow:hidden; }
  .bp-kpi-top { position:absolute; top:0; left:0; right:0; height:2px; }
  .bp-kpi-label { font-size:9px; letter-spacing:1.5px; text-transform:uppercase; color:#4a5568; margin-bottom:6px; }
  .bp-kpi-value { font-family:'Syne',sans-serif; font-size:20px; font-weight:800; }

  .bp-table-wrap { overflow-x:auto; max-height:340px; overflow-y:auto; border:1px solid #1e2530; border-radius:8px; }
  .bp-table-wrap::-webkit-scrollbar { width:4px; height:4px; }
  .bp-table-wrap::-webkit-scrollbar-thumb { background:#1e2530; border-radius:2px; }
  .bp-table { width:100%; border-collapse:collapse; font-size:12px; }
  .bp-table thead th { font-size:10px; letter-spacing:1.5px; text-transform:uppercase; color:#4a5568; padding:9px 12px; text-align:left; border-bottom:1px solid #1e2530; background:#0f1218; position:sticky; top:0; white-space:nowrap; }
  .bp-table tbody tr { border-bottom:1px solid rgba(255,255,255,0.03); }
  .bp-table tbody tr:hover { background:rgba(255,255,255,0.02); }
  .bp-table td { padding:9px 12px; color:#e2e8f4; }

  .bp-no-rows { font-size:12px; color:#4a5568; padding:20px; text-align:center; }
`;

export default function BudgetPanel({ rows }) {
  const [budget, setBudget] = useState(5000);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  if (!rows || rows.length === 0) {
    return (
      <>
        <style>{styles}</style>
        <div className="bp-panel">
          <div style={{fontSize:12,color:"#4a5568",textAlign:"center",padding:"24px 0"}}>No dataset rows loaded</div>
        </div>
      </>
    );
  }

  const handleOptimize = async () => {
    setLoading(true);
    try {
      const res = await runBudgetOptimize(rows, Number(budget));
      setResult(res.data);
      console.log("BUDGET RESULT:", res.data);
    } catch (e) {
      console.error(e);
      alert("Optimization failed");
    }
    setLoading(false);
  };

  const rowsOut = result ? (result.selected || result.allocated || []) : [];
  const cols = rowsOut.length ? Object.keys(rowsOut[0]) : [];

  return (
    <>
      <style>{styles}</style>
      <div className="bp-panel">
        <div className="bp-header">
          <div className="bp-title"><span style={{color:"#00e5c3"}}>₹</span> Budget Optimization</div>
        </div>

        <div className="bp-control-row">
          <span className="bp-label">Budget (₹)</span>
          <input type="number" className="bp-input" value={budget} onChange={e => setBudget(e.target.value)}/>
          <button className="bp-btn" onClick={handleOptimize} disabled={loading}>
            {loading ? <><span className="bp-spinner"/>Optimizing…</> : <>⚡ Optimize</>}
          </button>
        </div>

        {result && (
          <>
            <div className="bp-summary">
              <div className="bp-kpi">
                <div className="bp-kpi-top" style={{background:"#00e5c3"}}/>
                <div className="bp-kpi-label">Selected Customers</div>
                <div className="bp-kpi-value" style={{color:"#00e5c3"}}>{result.count}</div>
              </div>
              <div className="bp-kpi">
                <div className="bp-kpi-top" style={{background:"#7c6aff"}}/>
                <div className="bp-kpi-label">Total Spend</div>
                <div className="bp-kpi-value" style={{color:"#7c6aff"}}>₹{Number(result.spend).toLocaleString()}</div>
              </div>
            </div>

            {rowsOut.length === 0 ? (
              <div className="bp-no-rows">No selected rows returned</div>
            ) : (
              <div className="bp-table-wrap">
                <table className="bp-table">
                  <thead>
                    <tr>{cols.map(col => <th key={col}>{col}</th>)}</tr>
                  </thead>
                  <tbody>
                    {rowsOut.map((row, i) => (
                      <tr key={i}>
                        {Object.values(row).map((v, j) => (
                          <td key={j}>{typeof v === "number" ? v.toFixed(3) : String(v)}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}
