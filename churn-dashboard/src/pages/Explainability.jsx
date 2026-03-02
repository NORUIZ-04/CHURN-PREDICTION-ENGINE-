import { useState } from "react";
import { datasetApi } from "../api/datasetApi";
import ActionSimulator from "../components/ActionSimulator";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Mono:wght@300;400;500&display=swap');

  .ex-root {
    font-family: 'DM Mono', monospace;
    color: #e2e8f4;
    animation: exFade 0.5s ease;
    max-width: 920px;
  }
  @keyframes exFade { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }

  /* HEADER */
  .ex-header { margin-bottom: 32px; }
  .ex-title {
    font-family: 'Syne', sans-serif;
    font-size: 28px; font-weight: 800;
    letter-spacing: -1px; line-height: 1.1;
  }
  .ex-title span { color: #00e5c3; }
  .ex-subtitle { font-size: 12px; color: #4a5568; margin-top: 6px; }

  /* INPUT PANEL */
  .ex-input-panel {
    background: #0f1218; border: 1px solid #1e2530;
    border-radius: 14px; padding: 28px; margin-bottom: 24px;
  }
  .ex-input-header {
    display: flex; align-items: center; justify-content: space-between;
    margin-bottom: 18px;
  }
  .ex-input-title {
    font-family: 'Syne', sans-serif;
    font-size: 14px; font-weight: 700;
    display: flex; align-items: center; gap: 8px;
  }
  .ex-input-icon {
    width: 26px; height: 26px; border-radius: 6px;
    background: rgba(124,106,255,0.12); color: #7c6aff;
    display: flex; align-items: center; justify-content: center; font-size: 13px;
  }

  .ex-textarea {
    width: 100%; height: 160px;
    background: #161b24; border: 1px solid #1e2530;
    border-radius: 10px; padding: 16px;
    font-family: 'DM Mono', monospace; font-size: 12px;
    color: #e2e8f4; outline: none; resize: vertical;
    transition: all 0.2s; line-height: 1.7;
  }
  .ex-textarea:focus { border-color: #00e5c3; background: rgba(0,229,195,0.03); box-shadow: 0 0 0 3px rgba(0,229,195,0.08); }
  .ex-textarea::placeholder { color: #2d3748; }

  .ex-input-footer {
    display: flex; align-items: center; justify-content: space-between;
    margin-top: 14px; flex-wrap: wrap; gap: 10px;
  }
  .ex-hint { font-size: 11px; color: #2d3748; }
  .ex-hint a { color: #00e5c3; cursor: pointer; text-decoration: underline; }

  /* BTN */
  .ex-btn {
    font-family: 'Syne', sans-serif; font-size: 13px; font-weight: 700;
    padding: 11px 24px; border-radius: 9px; border: none; cursor: pointer;
    transition: all 0.2s; letter-spacing: -0.3px;
    display: inline-flex; align-items: center; gap: 8px;
  }
  .ex-btn-primary { background: #00e5c3; color: #080b10; }
  .ex-btn-primary:hover:not(:disabled) { background: #00ffd5; transform: translateY(-1px); box-shadow: 0 8px 20px rgba(0,229,195,0.25); }
  .ex-btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
  .ex-btn-ghost { background: transparent; color: #4a5568; border: 1px solid #1e2530; }
  .ex-btn-ghost:hover { border-color: #2d3748; color: #e2e8f4; }
  .ex-spinner { width:14px;height:14px;border:2px solid rgba(0,0,0,0.2);border-top-color:#080b10;border-radius:50%;animation:spin 0.6s linear infinite; }
  @keyframes spin{to{transform:rotate(360deg)}}

  /* RESULTS AREA */
  .ex-results { display: flex; flex-direction: column; gap: 20px; }

  /* PANEL */
  .ex-panel {
    background: #0f1218; border: 1px solid #1e2530;
    border-radius: 12px; overflow: hidden;
    animation: exFade 0.4s ease;
  }
  .ex-panel-header {
    display: flex; align-items: center; justify-content: space-between;
    padding: 18px 22px; border-bottom: 1px solid #1e2530;
  }
  .ex-panel-title {
    font-family: 'Syne', sans-serif; font-size: 14px; font-weight: 700;
    display: flex; align-items: center; gap: 9px; letter-spacing: -0.3px;
  }
  .ex-panel-icon {
    width: 26px; height: 26px; border-radius: 6px;
    display: flex; align-items: center; justify-content: center; font-size: 12px;
  }
  .ex-panel-badge {
    font-size: 10px; color: #4a5568;
    padding: 4px 10px; background: #161b24; border: 1px solid #1e2530; border-radius: 20px;
  }
  .ex-panel-body { padding: 22px; }

  /* PREDICTION RESULT */
  .ex-prediction-grid {
    display: grid; grid-template-columns: 1fr 1fr; gap: 16px;
  }
  .ex-pred-stat {
    background: #161b24; border: 1px solid #1e2530;
    border-radius: 10px; padding: 18px 16px;
    position: relative; overflow: hidden;
  }
  .ex-pred-stat-bar { position:absolute;top:0;left:0;right:0;height:2px; }
  .ex-pred-stat-label { font-size:10px;letter-spacing:1.5px;text-transform:uppercase;color:#4a5568;margin-bottom:10px; }
  .ex-pred-stat-val { font-family:'Syne',sans-serif;font-size:28px;font-weight:800;letter-spacing:-0.5px; }

  /* SHAP DRIVERS */
  .ex-shap-item {
    display: flex; align-items: center; gap: 12px;
    padding: 10px 0; border-bottom: 1px solid rgba(255,255,255,0.03);
  }
  .ex-shap-item:last-child { border-bottom: none; }
  .ex-shap-rank { font-size:11px;color:#2d3748;width:20px;flex-shrink:0; }
  .ex-shap-name { font-size:12px;flex:1;color:#e2e8f4; }
  .ex-shap-bar-wrap { width:100px;flex-shrink:0; }
  .ex-shap-track { height:5px;background:#1e2530;border-radius:3px;overflow:hidden;margin-bottom:3px; }
  .ex-shap-fill { height:100%;border-radius:3px; }
  .ex-shap-val { font-size:10px;color:#4a5568;text-align:right; }

  /* LLM EXPLANATION */
  .ex-llm-text {
    font-size: 13px; line-height: 1.9; color: #a0b0c8;
    white-space: pre-wrap;
    background: #161b24; border: 1px solid #1e2530;
    border-radius: 10px; padding: 18px;
  }

  /* RETENTION ACTION */
  .ex-action-grid {
    display: grid; grid-template-columns: 1fr 1fr;
    gap: 12px; margin-bottom: 16px;
  }
  .ex-action-stat {
    background: #161b24; border: 1px solid #1e2530; border-radius: 10px; padding: 14px 16px;
  }
  .ex-action-stat-label { font-size:10px;letter-spacing:1.2px;text-transform:uppercase;color:#4a5568;margin-bottom:6px; }
  .ex-action-stat-val { font-size:14px;font-weight:600;color:#e2e8f4; }
  .ex-action-section { margin-top:14px; }
  .ex-action-section-label { font-size:10px;letter-spacing:1.2px;text-transform:uppercase;color:#4a5568;margin-bottom:8px; }
  .ex-action-section-text { font-size:12px;line-height:1.8;color:#e2e8f4; }

  /* PRIORITY BADGE */
  .ex-priority {
    display: inline-block; font-size:11px; padding:4px 12px;
    border-radius:20px; font-weight:600;
  }

  /* SAMPLE JSON */
  .ex-sample-json {
    background: #161b24; border: 1px solid #1e2530;
    border-radius: 8px; padding: 14px;
    font-size: 11px; color: #4a5568;
    line-height: 1.6; font-family: 'DM Mono', monospace;
    white-space: pre; overflow-x: auto;
    margin-bottom: 14px;
  }

  .ex-divider { height:1px; background:#1e2530; margin:6px 0 14px; }
`;

const SAMPLE = JSON.stringify({
  tenure: 12, monthly_charges: 89.5, contract_type: "Month-to-month",
  num_support_tickets: 5, days_since_last_login: 45, plan_type: "Basic"
}, null, 2);

function priorityStyle(p) {
  const s = String(p).toLowerCase();
  if (s === "high")   return { background:"rgba(255,77,109,0.1)",  color:"#ff4d6d",  border:"1px solid rgba(255,77,109,0.2)"  };
  if (s === "medium") return { background:"rgba(255,193,7,0.1)",   color:"#ffc107",  border:"1px solid rgba(255,193,7,0.2)"   };
  return                     { background:"rgba(0,229,195,0.1)",   color:"#00e5c3",  border:"1px solid rgba(0,229,195,0.2)"   };
}

function getShapColor(val) {
  return val >= 0 ? "#ff4d6d" : "#00e5c3";
}

export default function Explainability() {
  const [jsonText, setJsonText] = useState("");
  const [result,   setResult]   = useState(null);
  const [loading,  setLoading]  = useState(false);
  const [parsedRow,setParsedRow]= useState(null);
  const [showSample, setShowSample] = useState(false);

  const handleExplain = async () => {
    if (!jsonText) return;
    let payload;
    try { payload = JSON.parse(jsonText); }
    catch { alert("Invalid JSON — check the format"); return; }
    setParsedRow(payload);
    setLoading(true);
    try {
      const res = await datasetApi.explainSingle(payload);
      setResult(res.data);
    } catch(e) {
      console.error("Explain failed", e);
      alert("Explain request failed — check backend logs");
    }
    setLoading(false);
  };

  const predColor = result ? (result.probability > 0.7 ? "#ff4d6d" : result.probability > 0.4 ? "#ffc107" : "#00e5c3") : "#00e5c3";
  const maxShap   = result?.explanation ? Math.max(...result.explanation.map(f=>Math.abs(f.impact))) : 1;

  return (
    <><style>{styles}</style>
    <div className="ex-root">

      {/* HEADER */}
      <div className="ex-header">
        <div className="ex-title">Model <span>Explainability</span></div>
        <div className="ex-subtitle">SHAP analysis · LLM narrative · Retention recommendations</div>
      </div>

      {/* INPUT */}
      <div className="ex-input-panel">
        <div className="ex-input-header">
          <div className="ex-input-title">
            <div className="ex-input-icon">{ }</div>
            Customer JSON Input
          </div>
          <button className="ex-btn ex-btn-ghost" style={{padding:"6px 14px",fontSize:11}} onClick={()=>setShowSample(s=>!s)}>
            {showSample ? "Hide" : "Show"} sample
          </button>
        </div>

        {showSample && (
          <><div className="ex-sample-json">{SAMPLE}</div><div className="ex-divider"/></>
        )}

        <textarea
          className="ex-textarea"
          placeholder={'Paste full customer row JSON here...\n\n{"tenure": 12, "monthly_charges": 89.5, ...}'}
          value={jsonText}
          onChange={e => setJsonText(e.target.value)}
        />

        <div className="ex-input-footer">
          <div className="ex-hint">
            Paste a customer row as JSON · <a onClick={() => setJsonText(SAMPLE)}>Load sample data</a>
          </div>
          <button className="ex-btn ex-btn-primary" onClick={handleExplain} disabled={loading || !jsonText}>
            {loading ? <><div className="ex-spinner"/>Analyzing...</> : <>◉ Explain Row</>}
          </button>
        </div>
      </div>

      {/* RESULTS */}
      {result && (
        <div className="ex-results">

          {/* PREDICTION */}
          <div className="ex-panel">
            <div className="ex-panel-header">
              <div className="ex-panel-title">
                <div className="ex-panel-icon" style={{background:predColor+"1a",color:predColor}}>◈</div>
                Prediction Result
              </div>
              <div className="ex-panel-badge">Model v3.2</div>
            </div>
            <div className="ex-panel-body">
              <div className="ex-prediction-grid">
                <div className="ex-pred-stat">
                  <div className="ex-pred-stat-bar" style={{background:"#7c6aff",opacity:0.6}}/>
                  <div className="ex-pred-stat-label">Prediction</div>
                  <div className="ex-pred-stat-val" style={{color:"#7c6aff",fontSize:20}}>{String(result.prediction)}</div>
                </div>
                <div className="ex-pred-stat">
                  <div className="ex-pred-stat-bar" style={{background:predColor,opacity:0.6}}/>
                  <div className="ex-pred-stat-label">Churn Probability</div>
                  <div className="ex-pred-stat-val" style={{color:predColor}}>{Number(result.probability??0).toFixed(3)}</div>
                </div>
              </div>
            </div>
          </div>

          {/* SHAP DRIVERS */}
          {Array.isArray(result.explanation) && (
            <div className="ex-panel">
              <div className="ex-panel-header">
                <div className="ex-panel-title">
                  <div className="ex-panel-icon" style={{background:"rgba(255,77,109,0.1)",color:"#ff4d6d"}}>⊹</div>
                  Top SHAP Drivers
                </div>
                <div className="ex-panel-badge">{result.explanation.length} features</div>
              </div>
              <div className="ex-panel-body">
                {result.explanation.map((f,i) => {
                  const color = getShapColor(f.impact);
                  const pct   = Math.abs(f.impact)/maxShap*100;
                  return (
                    <div className="ex-shap-item" key={f.feature}>
                      <div className="ex-shap-rank">{String(i+1).padStart(2,"0")}</div>
                      <div className="ex-shap-name">{f.feature}</div>
                      <div className="ex-shap-bar-wrap">
                        <div className="ex-shap-track">
                          <div className="ex-shap-fill" style={{width:`${pct}%`,background:color}}/>
                        </div>
                        <div className="ex-shap-val" style={{color}}>{Number(f.impact).toFixed(4)}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* LLM EXPLANATION */}
          {result.llm_explanation && (
            <div className="ex-panel">
              <div className="ex-panel-header">
                <div className="ex-panel-title">
                  <div className="ex-panel-icon" style={{background:"rgba(124,106,255,0.1)",color:"#7c6aff"}}>✦</div>
                  AI Narrative Explanation
                </div>
                <div className="ex-panel-badge">LLM-generated</div>
              </div>
              <div className="ex-panel-body">
                <div className="ex-llm-text">{result.llm_explanation}</div>
              </div>
            </div>
          )}

          {/* RETENTION ACTION */}
          {result.retention_action && (
            <div className="ex-panel">
              <div className="ex-panel-header">
                <div className="ex-panel-title">
                  <div className="ex-panel-icon" style={{background:"rgba(0,229,195,0.1)",color:"#00e5c3"}}>◷</div>
                  Recommended Retention Action
                </div>
                <span className="ex-priority" style={priorityStyle(result.retention_action.priority)}>
                  {result.retention_action.priority} Priority
                </span>
              </div>
              <div className="ex-panel-body">
                <div className="ex-action-grid">
                  <div className="ex-action-stat">
                    <div className="ex-action-stat-label">Recommended Action</div>
                    <div className="ex-action-stat-val" style={{color:"#00e5c3"}}>{result.retention_action.action}</div>
                  </div>
                  <div className="ex-action-stat">
                    <div className="ex-action-stat-label">Expected Effect</div>
                    <div className="ex-action-stat-val">{result.retention_action.expected_effect}</div>
                  </div>
                </div>
                <div className="ex-action-section">
                  <div className="ex-action-section-label">Reasoning</div>
                  <div className="ex-action-section-text">{result.retention_action.reason}</div>
                </div>
              </div>
            </div>
          )}

          {/* ACTION SIMULATOR */}
          {parsedRow && (
            <div className="ex-panel">
              <div className="ex-panel-header">
                <div className="ex-panel-title">
                  <div className="ex-panel-icon" style={{background:"rgba(255,193,7,0.1)",color:"#ffc107"}}>◈</div>
                  Action Simulator
                </div>
                <div className="ex-panel-badge">What-if scenarios</div>
              </div>
              <div className="ex-panel-body">
                <ActionSimulator row={parsedRow} />
              </div>
            </div>
          )}

        </div>
      )}

    </div></>
  );
}
