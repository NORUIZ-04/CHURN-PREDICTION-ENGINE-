import { useState } from "react";
import { optimizeAction } from "../../api/upliftApi";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Mono:wght@300;400;500&display=swap');

  .opt-root { font-family:'DM Mono',monospace; color:#e2e8f4; animation:optFade 0.4s ease; }
  @keyframes optFade { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }

  .opt-panel { background:#0f1218; border:1px solid #1e2530; border-radius:12px; padding:20px; }
  .opt-header { display:flex; align-items:center; justify-content:space-between; margin-bottom:16px; padding-bottom:14px; border-bottom:1px solid #1e2530; }
  .opt-title { font-family:'Syne',sans-serif; font-size:14px; font-weight:700; display:flex; align-items:center; gap:7px; }

  .opt-btn { font-family:'Syne',sans-serif; font-size:12px; font-weight:700; padding:8px 18px; border-radius:8px; border:none; cursor:pointer; background:#00e5c3; color:#080b10; transition:all 0.2s; display:inline-flex; align-items:center; gap:6px; }
  .opt-btn:hover:not(:disabled) { background:#00ffd5; transform:translateY(-1px); box-shadow:0 6px 16px rgba(0,229,195,0.25); }
  .opt-btn:disabled { opacity:0.5; cursor:not-allowed; }
  .opt-spinner { width:12px; height:12px; border:2px solid rgba(0,0,0,0.2); border-top-color:#080b10; border-radius:50%; animation:spin 0.6s linear infinite; }
  @keyframes spin { to{transform:rotate(360deg)} }

  .opt-result-grid { display:flex; flex-direction:column; gap:6px; }
  .opt-result-row { display:flex; align-items:center; justify-content:space-between; background:#161b24; border:1px solid #1e2530; border-radius:8px; padding:10px 14px; transition:border-color 0.15s; }
  .opt-result-row:hover { border-color:rgba(0,229,195,0.2); }
  .opt-result-row.highlight { border-color:rgba(0,229,195,0.3); background:rgba(0,229,195,0.04); }
  .opt-result-key { font-size:11px; color:#6b7a95; text-transform:uppercase; letter-spacing:0.5px; }
  .opt-result-val { font-size:13px; font-weight:700; color:#00e5c3; font-family:'Syne',sans-serif; }

  .opt-empty { padding:24px 0; text-align:center; font-size:12px; color:#2d3748; }
`;

export default function OptimizerPanel({ row }) {
  const [res, setRes] = useState(null);
  const [loading, setLoading] = useState(false);

  const run = async () => {
    setLoading(true);
    try {
      const r = await optimizeAction(row);
      setRes(r.data);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const resEntries = res ? Object.entries(res) : [];

  // Highlight these keys as primary results
  const primaryKeys = new Set(["best_action", "recommended_action", "optimal_action", "action"]);

  return (
    <>
      <style>{styles}</style>
      <div className="opt-root">
        <div className="opt-panel">
          <div className="opt-header">
            <div className="opt-title">
              <span style={{color:"#00e5c3"}}>⚙</span> Optimize Action
            </div>
            <button className="opt-btn" onClick={run} disabled={loading}>
              {loading ? <><span className="opt-spinner"/>Optimizing…</> : <>⚡ Optimize Action</>}
            </button>
          </div>

          {!res && !loading && (
            <div className="opt-empty">Run optimizer to find the best retention action for this customer</div>
          )}

          {resEntries.length > 0 && (
            <div className="opt-result-grid">
              {resEntries.map(([key, val]) => (
                <div key={key} className={`opt-result-row${primaryKeys.has(key) ? " highlight" : ""}`}>
                  <span className="opt-result-key">{key.replace(/_/g, " ")}</span>
                  <span className="opt-result-val" style={{color: primaryKeys.has(key) ? "#00e5c3" : "#e2e8f4"}}>
                    {typeof val === "number" ? val.toFixed(4) : String(val)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
