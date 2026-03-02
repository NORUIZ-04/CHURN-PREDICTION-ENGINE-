import { useState } from "react";
import { getUpliftExplain } from "../../api/upliftApi";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Mono:wght@300;400;500&display=swap');
  .uexp-panel { background:#0f1218; border:1px solid #1e2530; border-radius:12px; padding:20px; font-family:'DM Mono',monospace; color:#e2e8f4; }
  .uexp-header { display:flex; align-items:center; justify-content:space-between; margin-bottom:16px; padding-bottom:14px; border-bottom:1px solid #1e2530; }
  .uexp-title { font-family:'Syne',sans-serif; font-size:14px; font-weight:700; display:flex; align-items:center; gap:7px; }
  .uexp-btn { font-family:'Syne',sans-serif; font-size:12px; font-weight:700; padding:8px 18px; border-radius:8px; border:none; cursor:pointer; background:#ffc107; color:#080b10; transition:all 0.2s; display:inline-flex; align-items:center; gap:6px; }
  .uexp-btn:hover:not(:disabled) { background:#ffd43b; transform:translateY(-1px); box-shadow:0 6px 16px rgba(255,193,7,0.3); }
  .uexp-btn:disabled { opacity:0.5; cursor:not-allowed; }
  .uexp-spinner { width:12px; height:12px; border:2px solid rgba(0,0,0,0.2); border-top-color:#080b10; border-radius:50%; animation:spin 0.6s linear infinite; }
  @keyframes spin{to{transform:rotate(360deg)}}
  .uexp-driver-list { display:flex; flex-direction:column; gap:6px; }
  .uexp-driver-row { background:#161b24; border:1px solid #1e2530; border-radius:8px; padding:10px 14px; }
  .uexp-driver-row:hover { border-color:rgba(255,193,7,0.2); }
  .uexp-driver-top { display:flex; align-items:center; justify-content:space-between; margin-bottom:6px; }
  .uexp-driver-name { font-size:12px; color:#e2e8f4; }
  .uexp-driver-val { font-size:12px; font-weight:700; font-family:'Syne',sans-serif; }
  .uexp-bar-bg { height:3px; background:#1e2530; border-radius:2px; overflow:hidden; }
  .uexp-bar-fill { height:100%; border-radius:2px; }
  .uexp-empty { font-size:12px; color:#2d3748; padding:20px; text-align:center; }
`;

export default function UpliftExplainPanel({ customer }) {
  const [explain, setExplain] = useState(null);
  const [loading, setLoading] = useState(false);

  const runExplain = async () => {
    setLoading(true);
    try {
      const res = await getUpliftExplain(customer);
      setExplain(res.data);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const drivers = explain?.drivers || [];
  const maxImpact = drivers.length ? Math.max(...drivers.map(d => Math.abs(d.impact ?? 0))) : 1;

  return (
    <>
      <style>{styles}</style>
      <div className="uexp-panel">
        <div className="uexp-header">
          <div className="uexp-title"><span style={{color:"#ffc107"}}>◎</span> Explain Uplift Drivers</div>
          <button className="uexp-btn" onClick={runExplain} disabled={loading}>
            {loading ? <><span className="uexp-spinner"/>Explaining…</> : <>◎ Explain Drivers</>}
          </button>
        </div>

        {!explain && !loading && <div className="uexp-empty">Click to explain the uplift drivers for this customer</div>}

        {drivers.length > 0 && (
          <div className="uexp-driver-list">
            {drivers.map((d, i) => {
              const impact = d.impact ?? 0;
              const pct = maxImpact > 0 ? Math.abs(impact) / maxImpact * 100 : 0;
              const isPos = impact >= 0;
              const color = isPos ? "#ff4d6d" : "#00e5c3";
              return (
                <div key={i} className="uexp-driver-row">
                  <div className="uexp-driver-top">
                    <span className="uexp-driver-name">{d.feature}</span>
                    <span className="uexp-driver-val" style={{color}}>
                      {isPos ? "+" : ""}{impact.toFixed(3)}
                    </span>
                  </div>
                  <div className="uexp-bar-bg">
                    <div className="uexp-bar-fill" style={{width:`${pct}%`,background:color}}/>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
