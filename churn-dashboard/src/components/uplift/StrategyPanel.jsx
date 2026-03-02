import { useState } from "react";
import { getLLMStrategy } from "../../api/upliftApi";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Mono:wght@300;400;500&display=swap');
  .sp-panel { background:#0f1218; border:1px solid #1e2530; border-radius:12px; padding:20px; font-family:'DM Mono',monospace; color:#e2e8f4; }
  .sp-header { display:flex; align-items:center; justify-content:space-between; margin-bottom:16px; padding-bottom:14px; border-bottom:1px solid #1e2530; }
  .sp-title { font-family:'Syne',sans-serif; font-size:14px; font-weight:700; display:flex; align-items:center; gap:7px; }
  .sp-badge { font-size:10px; color:#7c6aff; padding:3px 10px; background:rgba(124,106,255,0.1); border:1px solid rgba(124,106,255,0.2); border-radius:20px; }
  .sp-btn { font-family:'Syne',sans-serif; font-size:12px; font-weight:700; padding:8px 18px; border-radius:8px; border:none; cursor:pointer; background:linear-gradient(135deg,#7c6aff,#0080ff); color:#fff; transition:all 0.2s; display:inline-flex; align-items:center; gap:6px; }
  .sp-btn:hover:not(:disabled) { opacity:0.9; transform:translateY(-1px); box-shadow:0 6px 16px rgba(124,106,255,0.3); }
  .sp-btn:disabled { opacity:0.5; cursor:not-allowed; }
  .sp-spinner { width:12px; height:12px; border:2px solid rgba(255,255,255,0.2); border-top-color:#fff; border-radius:50%; animation:spin 0.6s linear infinite; }
  @keyframes spin{to{transform:rotate(360deg)}}
  .sp-loading-bar { height:2px; background:#1e2530; border-radius:1px; overflow:hidden; margin-bottom:10px; }
  .sp-loading-fill { height:100%; width:40%; background:linear-gradient(90deg,#7c6aff,#0080ff); animation:loadSlide 1.2s ease-in-out infinite; }
  @keyframes loadSlide { 0%{transform:translateX(-100%)} 100%{transform:translateX(350%)} }
  .sp-narrative { background:#161b24; border:1px solid #1e2530; border-radius:8px; padding:16px; font-size:13px; line-height:1.8; color:#e2e8f4; border-left:3px solid #7c6aff; }
  .sp-empty { font-size:12px; color:#2d3748; padding:20px 0; text-align:center; }
`;

export default function StrategyPanel({ customer }) {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);

  const runLLM = async () => {
    setLoading(true);
    setText("");
    try {
      const res = await getLLMStrategy(customer);
      setText(res.data.narrative);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  return (
    <>
      <style>{styles}</style>
      <div className="sp-panel">
        <div className="sp-header">
          <div className="sp-title">
            <span style={{ color: "#7c6aff" }}>✦</span> Strategy Narrative
            <span className="sp-badge">LLM</span>
          </div>
          <button className="sp-btn" onClick={runLLM} disabled={loading}>
            {loading ? <><span className="sp-spinner" />Generating…</> : <>✦ Generate Strategy</>}
          </button>
        </div>

        {loading && (
          <div>
            <div className="sp-loading-bar"><div className="sp-loading-fill" /></div>
            <div style={{ fontSize: 11, color: "#4a5568", textAlign: "center" }}>Crafting retention strategy…</div>
          </div>
        )}

        {!text && !loading && <div className="sp-empty">Generate an AI-powered retention strategy narrative</div>}
        {text && !loading && <div className="sp-narrative">{text}</div>}
      </div>
    </>
  );
}
