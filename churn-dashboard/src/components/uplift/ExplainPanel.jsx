import { useState } from "react";
import { getUpliftExplain } from "../../api/upliftApi";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Mono:wght@300;400;500&display=swap');

  .exp-root { font-family:'DM Mono',monospace; color:#e2e8f4; animation:expFade 0.4s ease; }
  @keyframes expFade { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }

  .exp-panel { background:#0f1218; border:1px solid #1e2530; border-radius:12px; padding:20px; }
  .exp-header { display:flex; align-items:center; justify-content:space-between; margin-bottom:16px; padding-bottom:14px; border-bottom:1px solid #1e2530; }
  .exp-title { font-family:'Syne',sans-serif; font-size:14px; font-weight:700; display:flex; align-items:center; gap:7px; }

  .exp-btn { font-family:'Syne',sans-serif; font-size:12px; font-weight:700; padding:8px 18px; border-radius:8px; border:none; cursor:pointer; background:#ffc107; color:#080b10; transition:all 0.2s; display:inline-flex; align-items:center; gap:6px; }
  .exp-btn:hover:not(:disabled) { background:#ffd43b; transform:translateY(-1px); box-shadow:0 6px 16px rgba(255,193,7,0.3); }
  .exp-btn:disabled { opacity:0.5; cursor:not-allowed; }
  .exp-spinner { width:12px; height:12px; border:2px solid rgba(0,0,0,0.2); border-top-color:#080b10; border-radius:50%; animation:spin 0.6s linear infinite; }
  @keyframes spin { to{transform:rotate(360deg)} }

  .exp-driver-list { display:flex; flex-direction:column; gap:6px; }
  .exp-driver-row { background:#161b24; border:1px solid #1e2530; border-radius:8px; padding:10px 14px; transition:border-color 0.15s; }
  .exp-driver-row:hover { border-color:rgba(255,193,7,0.2); }
  .exp-driver-top { display:flex; align-items:center; justify-content:space-between; margin-bottom:6px; }
  .exp-driver-name { font-size:12px; color:#e2e8f4; }
  .exp-driver-val { font-size:12px; font-weight:700; font-family:'Syne',sans-serif; }
  .exp-driver-bar-bg { height:3px; background:#1e2530; border-radius:2px; overflow:hidden; }
  .exp-driver-bar-fill { height:100%; border-radius:2px; transition:width 0.4s ease; }

  .exp-empty { padding:24px 0; text-align:center; font-size:12px; color:#2d3748; }
`;

export default function ExplainPanel({ row }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const run = async () => {
    setLoading(true);
    try {
      const r = await getUpliftExplain(row);
      setData(r.data.drivers);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  // Determine max abs impact for bar scaling
  const maxImpact = data?.length
    ? Math.max(...data.map(d => Math.abs(d.impact ?? 0)))
    : 1;

  return (
    <>
      <style>{styles}</style>
      <div className="exp-root">
        <div className="exp-panel">
          <div className="exp-header">
            <div className="exp-title">
              <span style={{color:"#ffc107"}}>◎</span> Explain Uplift
            </div>
            <button className="exp-btn" onClick={run} disabled={loading}>
              {loading ? <><span className="exp-spinner"/>Explaining…</> : <>◎ Explain Uplift</>}
            </button>
          </div>

          {!data && !loading && (
            <div className="exp-empty">Click to explain the uplift drivers for this customer</div>
          )}

          {data?.length > 0 && (
            <div className="exp-driver-list">
              {data.map((d, i) => {
                const impact = d.impact ?? 0;
                const pct = Math.abs(impact) / maxImpact * 100;
                const isPos = impact >= 0;
                const color = isPos ? "#ff4d6d" : "#00e5c3";
                return (
                  <div key={i} className="exp-driver-row">
                    <div className="exp-driver-top">
                      <span className="exp-driver-name">{d.feature ?? `Driver ${i+1}`}</span>
                      <span className="exp-driver-val" style={{color}}>
                        {isPos ? "+" : ""}{impact.toFixed(4)}
                      </span>
                    </div>
                    <div className="exp-driver-bar-bg">
                      <div className="exp-driver-bar-fill" style={{width:`${pct}%`,background:color}}/>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
