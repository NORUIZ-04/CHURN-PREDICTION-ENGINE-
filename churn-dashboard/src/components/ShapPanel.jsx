const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Mono:wght@300;400;500&display=swap');

  .shap-root { font-family:'DM Mono',monospace; color:#e2e8f4; animation:shapFade 0.4s ease; }
  @keyframes shapFade { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }

  .shap-panel { background:#0f1218; border:1px solid #1e2530; border-radius:12px; padding:20px; }
  .shap-header { margin-bottom:16px; padding-bottom:14px; border-bottom:1px solid #1e2530; }
  .shap-title { font-family:'Syne',sans-serif; font-size:14px; font-weight:700; display:flex; align-items:center; gap:7px; margin-bottom:12px; }

  .shap-meta-grid { display:grid; grid-template-columns:1fr 1fr; gap:8px; }
  .shap-meta-kpi { background:#161b24; border:1px solid #1e2530; border-radius:8px; padding:10px 14px; position:relative; overflow:hidden; }
  .shap-meta-kpi-top { position:absolute; top:0; left:0; right:0; height:2px; }
  .shap-meta-label { font-size:9px; letter-spacing:1.5px; text-transform:uppercase; color:#4a5568; margin-bottom:6px; }
  .shap-meta-value { font-family:'Syne',sans-serif; font-size:18px; font-weight:800; letter-spacing:-0.3px; line-height:1; }

  .shap-drivers-title { font-size:10px; letter-spacing:1.5px; text-transform:uppercase; color:#4a5568; margin-bottom:10px; margin-top:16px; }

  .shap-driver-list { display:flex; flex-direction:column; gap:6px; }
  .shap-driver-row { background:#161b24; border:1px solid #1e2530; border-radius:8px; padding:10px 14px; transition:border-color 0.15s; }
  .shap-driver-row:hover { border-color:rgba(255,255,255,0.08); }
  .shap-driver-top { display:flex; align-items:center; justify-content:space-between; margin-bottom:6px; }
  .shap-driver-name { font-size:12px; color:#e2e8f4; }
  .shap-driver-val { font-size:12px; font-weight:700; font-family:'Syne',sans-serif; }
  .shap-driver-bar-bg { height:3px; background:#1e2530; border-radius:2px; overflow:hidden; }
  .shap-driver-bar-fill { height:100%; border-radius:2px; transition:width 0.5s ease; }
`;

export default function ShapPanel({ shap }) {
  if (!shap) return null

  const maxImpact = shap.top_drivers?.length
    ? Math.max(...shap.top_drivers.map(d => Math.abs(d.impact ?? 0)))
    : 1;

  const churnPct = (shap.churn_probability * 100).toFixed(1);
  const isHighRisk = shap.churn_probability > 0.6;
  const probColor = isHighRisk ? "#ff4d6d" : shap.churn_probability > 0.35 ? "#ffc107" : "#00e5c3";
  const predictionColor = shap.prediction === "Churn" ? "#ff4d6d" : "#00e5c3";

  return (
    <>
      <style>{styles}</style>
      <div className="shap-root">
        <div className="shap-panel">
          <div className="shap-header">
            <div className="shap-title">
              <span style={{color:"#ffc107"}}>◈</span> SHAP Explanation
            </div>

            <div className="shap-meta-grid">
              <div className="shap-meta-kpi">
                <div className="shap-meta-kpi-top" style={{background:predictionColor}}/>
                <div className="shap-meta-label">Prediction</div>
                <div className="shap-meta-value" style={{color:predictionColor}}>{shap.prediction}</div>
              </div>
              <div className="shap-meta-kpi">
                <div className="shap-meta-kpi-top" style={{background:probColor}}/>
                <div className="shap-meta-label">Churn Probability</div>
                <div className="shap-meta-value" style={{color:probColor}}>{churnPct}%</div>
              </div>
            </div>
          </div>

          <div className="shap-drivers-title">Top Drivers</div>

          <div className="shap-driver-list">
            {shap.top_drivers.map((d, i) => {
              const impact = d.impact ?? 0;
              const pct = maxImpact > 0 ? Math.abs(impact) / maxImpact * 100 : 0;
              const isPos = impact >= 0;
              const color = isPos ? "#ff4d6d" : "#00e5c3";
              return (
                <div key={i} className="shap-driver-row">
                  <div className="shap-driver-top">
                    <span className="shap-driver-name">{d.feature}</span>
                    <span className="shap-driver-val" style={{color}}>
                      {isPos ? "+" : ""}{impact.toFixed(4)}
                    </span>
                  </div>
                  <div className="shap-driver-bar-bg">
                    <div className="shap-driver-bar-fill" style={{width:`${pct}%`,background:color}}/>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  )
}
