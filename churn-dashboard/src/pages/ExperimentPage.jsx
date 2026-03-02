import { useState } from "react";
import axios from "axios";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Mono:wght@300;400;500&display=swap');
  .ep-root { font-family:'DM Mono',monospace; color:#e2e8f4; animation:epFade 0.5s ease; padding:24px; }
  @keyframes epFade { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
  .ep-panel { background:#0f1218; border:1px solid #1e2530; border-radius:12px; padding:24px; margin-bottom:20px; }
  .ep-header { display:flex; align-items:center; justify-content:space-between; margin-bottom:20px; padding-bottom:16px; border-bottom:1px solid #1e2530; }
  .ep-title { font-family:'Syne',sans-serif; font-size:18px; font-weight:800; display:flex; align-items:center; gap:8px; }
  .ep-badge { font-size:10px; color:#7c6aff; padding:3px 10px; background:rgba(124,106,255,0.1); border:1px solid rgba(124,106,255,0.2); border-radius:20px; letter-spacing:1px; text-transform:uppercase; }
  .ep-btn { font-family:'Syne',sans-serif; font-size:13px; font-weight:700; padding:11px 24px; border-radius:9px; border:none; cursor:pointer; background:#00e5c3; color:#080b10; transition:all 0.2s; display:inline-flex; align-items:center; gap:8px; }
  .ep-btn:hover:not(:disabled) { background:#00ffd5; transform:translateY(-1px); box-shadow:0 8px 20px rgba(0,229,195,0.25); }
  .ep-btn:disabled { opacity:0.5; cursor:not-allowed; }
  .ep-spinner { width:14px; height:14px; border:2px solid rgba(0,0,0,0.2); border-top-color:#080b10; border-radius:50%; animation:spin 0.6s linear infinite; }
  @keyframes spin{to{transform:rotate(360deg)}}
  .ep-result { background:#161b24; border:1px solid #1e2530; border-radius:8px; padding:16px; border-left:3px solid #7c6aff; }
  .ep-result-title { font-family:'Syne',sans-serif; font-size:12px; font-weight:700; color:#7c6aff; letter-spacing:1px; text-transform:uppercase; margin-bottom:12px; }
  .ep-pre { font-family:'DM Mono',monospace; font-size:12px; color:#e2e8f4; white-space:pre-wrap; overflow-x:auto; line-height:1.7; }
  .ep-pre::-webkit-scrollbar { height:4px; }
  .ep-pre::-webkit-scrollbar-thumb { background:#1e2530; border-radius:2px; }
  .ep-empty { display:flex; flex-direction:column; align-items:center; justify-content:center; padding:48px; gap:12px; text-align:center; }
  .ep-empty-icon { width:64px; height:64px; background:#0f1218; border:1px solid #1e2530; border-radius:16px; display:flex; align-items:center; justify-content:center; font-size:28px; }
`;

export default function ExperimentPage() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const runExperiment = async () => {
    setLoading(true);
    try {
      const res = await axios.post("http://127.0.0.1:8000/uplift/experiment/policy-compare");
      setResult(res.data.result);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  return (
    <>
      <style>{styles}</style>
      <div className="ep-root">
        <div className="ep-panel">
          <div className="ep-header">
            <div className="ep-title">
              <span style={{color:"#7c6aff"}}>⚗</span>
              Policy Experiment Console
              <span className="ep-badge">EXPERIMENT</span>
            </div>
            <button className="ep-btn" onClick={runExperiment} disabled={loading}>
              {loading ? <><span className="ep-spinner"/>Running…</> : <>⚡ Run Policy Comparison</>}
            </button>
          </div>

          {!result && !loading && (
            <div className="ep-empty">
              <div className="ep-empty-icon">⚗</div>
              <div style={{fontFamily:"Syne,sans-serif",fontSize:16,fontWeight:700,color:"#e2e8f4"}}>No Experiment Run Yet</div>
              <div style={{fontSize:12,color:"#4a5568",maxWidth:320,lineHeight:1.8}}>
                Click <strong style={{color:"#00e5c3"}}>Run Policy Comparison</strong> to compare retention policies using the uplift model.
              </div>
            </div>
          )}

          {result && (
            <div className="ep-result">
              <div className="ep-result-title">◈ Experiment Result</div>
              <pre className="ep-pre">{JSON.stringify(result, null, 2)}</pre>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
