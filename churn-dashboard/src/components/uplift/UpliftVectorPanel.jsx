import { useState } from "react";
import { getUpliftVector } from "../../api/upliftApi";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Mono:wght@300;400;500&display=swap');

  .uvp-root { font-family:'DM Mono',monospace; color:#e2e8f4; animation:uvpFade 0.4s ease; }
  @keyframes uvpFade { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }

  .uvp-panel { background:#0f1218; border:1px solid #1e2530; border-radius:12px; padding:20px; }
  .uvp-header { display:flex; align-items:center; justify-content:space-between; margin-bottom:16px; padding-bottom:14px; border-bottom:1px solid #1e2530; }
  .uvp-title { font-family:'Syne',sans-serif; font-size:14px; font-weight:700; display:flex; align-items:center; gap:7px; }

  .uvp-btn { font-family:'Syne',sans-serif; font-size:12px; font-weight:700; padding:8px 18px; border-radius:8px; border:none; cursor:pointer; background:#7c6aff; color:#fff; transition:all 0.2s; display:inline-flex; align-items:center; gap:6px; }
  .uvp-btn:hover:not(:disabled) { background:#9585ff; transform:translateY(-1px); box-shadow:0 6px 16px rgba(124,106,255,0.3); }
  .uvp-btn:disabled { opacity:0.5; cursor:not-allowed; }
  .uvp-spinner { width:12px; height:12px; border:2px solid rgba(255,255,255,0.2); border-top-color:#fff; border-radius:50%; animation:spin 0.6s linear infinite; }
  @keyframes spin { to{transform:rotate(360deg)} }

  .uvp-vec-grid { display:flex; flex-direction:column; gap:6px; margin-top:4px; }
  .uvp-vec-row { display:flex; align-items:center; justify-content:space-between; background:#161b24; border:1px solid #1e2530; border-radius:8px; padding:9px 14px; transition:border-color 0.15s; }
  .uvp-vec-row:hover { border-color:rgba(124,106,255,0.25); }
  .uvp-vec-key { font-size:11px; color:#6b7a95; text-transform:uppercase; letter-spacing:0.5px; }
  .uvp-vec-val { font-size:13px; font-weight:500; color:#7c6aff; font-family:'Syne',sans-serif; }

  .uvp-empty { padding:24px 0; text-align:center; font-size:12px; color:#2d3748; }
`;

export default function UpliftVectorPanel({ row }) {
  const [vec, setVec] = useState(null);
  const [loading, setLoading] = useState(false);

  const run = async () => {
    setLoading(true);
    try {
      const r = await getUpliftVector(row);
      setVec(r.data.uplift_vector);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const vecEntries = vec ? Object.entries(vec) : [];

  return (
    <>
      <style>{styles}</style>
      <div className="uvp-root">
        <div className="uvp-panel">
          <div className="uvp-header">
            <div className="uvp-title">
              <span style={{color:"#7c6aff"}}>◈</span> Uplift Vector
            </div>
            <button className="uvp-btn" onClick={run} disabled={loading}>
              {loading ? <><span className="uvp-spinner"/>Computing…</> : <>⚡ Get Uplift Vector</>}
            </button>
          </div>

          {!vec && !loading && (
            <div className="uvp-empty">Click to compute uplift vector for this customer</div>
          )}

          {vecEntries.length > 0 && (
            <div className="uvp-vec-grid">
              {vecEntries.map(([key, val]) => (
                <div key={key} className="uvp-vec-row">
                  <span className="uvp-vec-key">{key}</span>
                  <span className="uvp-vec-val">
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
