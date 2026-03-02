import { useState } from "react";
import { api } from "../api";
import { useDatasetStore } from "../store/datasetStore";
import { useNavigate } from "react-router-dom";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Mono:wght@300;400;500&display=swap');

  .ds-root {
    font-family: 'DM Mono', monospace;
    color: #e2e8f4;
    animation: dsFade 0.5s ease;
    max-width: 900px;
  }
  @keyframes dsFade { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }

  /* HEADER */
  .ds-header { margin-bottom: 36px; }
  .ds-title {
    font-family: 'Syne', sans-serif;
    font-size: 28px; font-weight: 800;
    letter-spacing: -1px; line-height: 1.1;
  }
  .ds-title span { color: #00e5c3; }
  .ds-subtitle { font-size: 12px; color: #4a5568; margin-top: 6px; }

  /* STEPS ROW */
  .ds-steps {
    display: flex; gap: 0;
    margin-bottom: 36px;
    background: #0f1218; border: 1px solid #1e2530; border-radius: 12px; overflow: hidden;
  }
  .ds-step {
    flex: 1; padding: 16px 20px;
    display: flex; align-items: center; gap: 10px;
    border-right: 1px solid #1e2530; font-size: 12px;
    cursor: pointer; transition: background 0.2s;
  }
  .ds-step:last-child { border-right: none; }
  .ds-step:hover { background: rgba(255,255,255,0.02); }
  .ds-step.active { background: rgba(0,229,195,0.06); }
  .ds-step-num {
    width: 24px; height: 24px; border-radius: 50%;
    border: 1px solid #1e2530; flex-shrink: 0;
    display: flex; align-items: center; justify-content: center;
    font-size: 10px; color: #4a5568;
    font-family: 'Syne', sans-serif; font-weight: 800;
  }
  .ds-step.active .ds-step-num { background: #00e5c3; color: #080b10; border-color: #00e5c3; }
  .ds-step-label { color: #4a5568; font-size: 11px; }
  .ds-step.active .ds-step-label { color: #e2e8f4; }

  /* PANEL */
  .ds-panel {
    background: #0f1218; border: 1px solid #1e2530;
    border-radius: 14px; padding: 28px;
    margin-bottom: 20px; transition: border-color 0.2s;
  }
  .ds-panel:hover { border-color: rgba(0,229,195,0.1); }
  .ds-panel-header {
    display: flex; align-items: center; gap: 12px;
    margin-bottom: 24px; padding-bottom: 18px;
    border-bottom: 1px solid #1e2530;
  }
  .ds-panel-icon {
    width: 36px; height: 36px; border-radius: 9px;
    display: flex; align-items: center; justify-content: center;
    font-size: 16px; flex-shrink: 0;
  }
  .ds-panel-info {}
  .ds-panel-title {
    font-family: 'Syne', sans-serif;
    font-size: 15px; font-weight: 700; letter-spacing: -0.3px;
  }
  .ds-panel-desc { font-size: 11px; color: #4a5568; margin-top: 3px; }

  /* UPLOAD ZONE */
  .ds-upload-zone {
    border: 2px dashed #1e2530;
    border-radius: 12px; padding: 36px;
    text-align: center; cursor: pointer;
    transition: all 0.2s; position: relative;
    margin-bottom: 18px;
  }
  .ds-upload-zone:hover, .ds-upload-zone.dragover {
    border-color: #00e5c3;
    background: rgba(0,229,195,0.04);
  }
  .ds-upload-zone input {
    position: absolute; inset: 0;
    opacity: 0; cursor: pointer; width: 100%; height: 100%;
  }
  .ds-upload-icon { font-size: 32px; margin-bottom: 10px; }
  .ds-upload-text { font-size: 13px; color: #4a5568; }
  .ds-upload-text strong { color: #00e5c3; }
  .ds-upload-hint { font-size: 11px; color: #2d3748; margin-top: 6px; }
  .ds-file-name {
    display: inline-flex; align-items: center; gap: 8px;
    margin-top: 12px; font-size: 12px;
    padding: 6px 14px;
    background: rgba(0,229,195,0.08);
    border: 1px solid rgba(0,229,195,0.2);
    border-radius: 20px; color: #00e5c3;
  }

  /* FORM ELEMENTS */
  .ds-form-row { display: flex; gap: 12px; margin-bottom: 14px; flex-wrap: wrap; }
  .ds-form-group { display: flex; flex-direction: column; gap: 7px; flex: 1; min-width: 140px; }
  .ds-label { font-size: 10px; letter-spacing: 1.5px; text-transform: uppercase; color: #4a5568; }
  .ds-input {
    font-family: 'DM Mono', monospace;
    font-size: 13px; color: #e2e8f4;
    background: #161b24; border: 1px solid #1e2530;
    border-radius: 9px; padding: 10px 14px;
    outline: none; transition: all 0.2s; width: 100%;
  }
  .ds-input:focus { border-color: #00e5c3; background: rgba(0,229,195,0.04); box-shadow: 0 0 0 3px rgba(0,229,195,0.08); }
  .ds-input::placeholder { color: #2d3748; }

  /* SLIDER */
  .ds-slider-wrap { margin-bottom: 18px; }
  .ds-slider-top { display:flex;justify-content:space-between;align-items:center;margin-bottom:6px; }
  .ds-slider-val { font-family:'Syne',sans-serif;font-size:16px;font-weight:800;color:#00e5c3; }
  .ds-slider {
    -webkit-appearance:none;appearance:none;
    width:100%;height:4px;background:#1e2530;border-radius:2px;outline:none;cursor:pointer;
  }
  .ds-slider::-webkit-slider-thumb {
    -webkit-appearance:none;appearance:none;
    width:16px;height:16px;border-radius:50%;background:#00e5c3;cursor:pointer;
    box-shadow:0 0 8px rgba(0,229,195,0.4);
  }
  .ds-churn-slider-val { color: #ff4d6d !important; }
  .ds-slider.danger::-webkit-slider-thumb { background: #ff4d6d; box-shadow:0 0 8px rgba(255,77,109,0.4); }

  /* BTN */
  .ds-btn {
    font-family: 'Syne', sans-serif;
    font-size: 13px; font-weight: 700;
    padding: 12px 24px; border-radius: 9px;
    border: none; cursor: pointer; transition: all 0.2s;
    letter-spacing: -0.3px; display: inline-flex; align-items: center; gap: 8px;
  }
  .ds-btn-primary { background: #00e5c3; color: #080b10; }
  .ds-btn-primary:hover { background: #00ffd5; transform: translateY(-1px); box-shadow: 0 8px 20px rgba(0,229,195,0.25); }
  .ds-btn-outline { background: transparent; color: #4a5568; border: 1px solid #1e2530; }
  .ds-btn-outline:hover { border-color: #2d3748; color: #e2e8f4; }
  .ds-btn-spinner {
    width:14px;height:14px;border:2px solid rgba(0,0,0,0.2);border-top-color:#080b10;
    border-radius:50%;animation:spin 0.6s linear infinite;
  }
  @keyframes spin{to{transform:rotate(360deg)}}

  /* RESULT CARD */
  .ds-result {
    background: rgba(0,229,195,0.05);
    border: 1px solid rgba(0,229,195,0.2);
    border-radius: 10px; padding: 16px 18px;
    margin-top: 16px;
  }
  .ds-result-title { font-size:11px;letter-spacing:1.5px;text-transform:uppercase;color:#00e5c3;margin-bottom:12px; }
  .ds-result-row { display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid rgba(0,229,195,0.08);font-size:12px; }
  .ds-result-row:last-child { border-bottom:none; }
  .ds-result-key { color: #4a5568; }
  .ds-result-val { color: #00e5c3; font-weight: 600; }

  /* MSG */
  .ds-msg {
    display: flex; align-items: center; gap: 8px;
    padding: 12px 16px; border-radius: 8px;
    font-size: 12px; margin-top: 12px;
  }
  .ds-msg.success { background:rgba(0,229,195,0.08);border:1px solid rgba(0,229,195,0.2);color:#00e5c3; }
  .ds-msg.error   { background:rgba(255,77,109,0.08);border:1px solid rgba(255,77,109,0.2);color:#ff4d6d; }
  .ds-msg.warn    { background:rgba(255,193,7,0.08);border:1px solid rgba(255,193,7,0.2);color:#ffc107; }
`;

function getMsgType(msg) {
  if (msg.startsWith("✅")) return "success";
  if (msg.startsWith("❌")) return "error";
  return "warn";
}

export default function DataSource() {
  const [file, setFile]       = useState(null);
  const [msg, setMsg]         = useState("");
  const [result, setResult]   = useState(null);
  const [uploading, setUploading] = useState(false);

  const [synN, setSynN]       = useState(1000);
  const [synRate, setSynRate] = useState(0.3);
  const [generating, setGenerating] = useState(false);

  const [conn, setConn]       = useState("");
  const [testing, setTesting] = useState(false);

  const setDatasetPath = useDatasetStore(s => s.setDatasetPath);
  const navigate = useNavigate();

  async function uploadFile() {
    if (!file) { setMsg("⚠️ Please select a CSV file"); return; }
    const form = new FormData();
    form.append("file", file);
    setUploading(true);
    try {
      const res = await api.post("/data/upload", form);
      setResult(res.data);
      setMsg("✅ Upload successful");
      const path = res.data.saved_as || res.data.file || res.data.file_path || res.data.dataset_path;
      if (!path) { setMsg("Upload OK but dataset path missing ❌"); setUploading(false); return; }
      setDatasetPath(path);
      navigate("/dashboard/overview");
    } catch { setMsg("❌ Upload failed"); }
    setUploading(false);
  }

  async function generateSynthetic() {
    setGenerating(true);
    try {
      const res = await api.post(`/data/synthetic?n_customers=${synN}&churn_rate=${synRate}`);
      const path = res.data.file || res.data.saved_as || res.data.file_path;
      if (path) { setDatasetPath(path); navigate("/dashboard/overview"); }
      setMsg("✅ Synthetic dataset created");
    } catch { setMsg("❌ Synthetic generation failed"); }
    setGenerating(false);
  }

  async function testDB() {
    setTesting(true);
    try {
      await api.post("/data/test-db", null, { params: { conn_string: conn } });
      setMsg("✅ DB connection successful");
    } catch { setMsg("❌ DB connection failed"); }
    setTesting(false);
  }

  return (
    <><style>{styles}</style>
    <div className="ds-root">

      {/* HEADER */}
      <div className="ds-header">
        <div className="ds-title">Data <span>Source</span></div>
        <div className="ds-subtitle">Upload, generate or connect your customer dataset to get started</div>
      </div>

      {/* STEPS */}
      <div className="ds-steps">
        {[
          { n:"01", label:"Upload or Generate Dataset" },
          { n:"02", label:"Auto-validation & Profiling" },
          { n:"03", label:"Explore in Dataset Overview" },
        ].map((s,i) => (
          <div className={`ds-step${i===0?" active":""}`} key={i}>
            <div className="ds-step-num">{s.n}</div>
            <div className="ds-step-label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* UPLOAD */}
      <div className="ds-panel">
        <div className="ds-panel-header">
          <div className="ds-panel-icon" style={{background:"rgba(0,229,195,0.1)",color:"#00e5c3"}}>📂</div>
          <div className="ds-panel-info">
            <div className="ds-panel-title">Upload Dataset</div>
            <div className="ds-panel-desc">Upload your customer CSV file for churn analysis</div>
          </div>
        </div>

        <div className="ds-upload-zone">
          <input type="file" accept=".csv" onChange={e => setFile(e.target.files[0])} />
          <div className="ds-upload-icon">⬆</div>
          <div className="ds-upload-text">Drop your CSV here or <strong>click to browse</strong></div>
          <div className="ds-upload-hint">Supports .csv files up to 100MB</div>
          {file && <div className="ds-file-name">📄 {file.name}</div>}
        </div>

        <button className="ds-btn ds-btn-primary" onClick={uploadFile} disabled={uploading}>
          {uploading ? <><div className="ds-btn-spinner"/>Uploading...</> : <>⬆ Upload & Validate</>}
        </button>

        {msg && <div className={`ds-msg ${getMsgType(msg)}`}>{msg}</div>}

        {result && (
          <div className="ds-result">
            <div className="ds-result-title">Upload Result</div>
            <div className="ds-result-row"><span className="ds-result-key">Rows</span><span className="ds-result-val">{result.rows?.toLocaleString()}</span></div>
            <div className="ds-result-row"><span className="ds-result-key">Columns</span><span className="ds-result-val">{result.columns?.length}</span></div>
            <div className="ds-result-row"><span className="ds-result-key">Saved As</span><span className="ds-result-val" style={{fontSize:11,wordBreak:"break-all"}}>{result.saved_as}</span></div>
          </div>
        )}
      </div>

      {/* SYNTHETIC */}
      <div className="ds-panel">
        <div className="ds-panel-header">
          <div className="ds-panel-icon" style={{background:"rgba(124,106,255,0.1)",color:"#7c6aff"}}>⚡</div>
          <div className="ds-panel-info">
            <div className="ds-panel-title">Synthetic Dataset Generator</div>
            <div className="ds-panel-desc">Generate realistic customer data for testing and demos</div>
          </div>
        </div>

        {/* Customers slider */}
        <div className="ds-slider-wrap">
          <div className="ds-slider-top">
            <div className="ds-label">Number of Customers</div>
            <div className="ds-slider-val">{Number(synN).toLocaleString()}</div>
          </div>
          <input type="range" className="ds-slider" min={100} max={25000} step={100} value={synN} onChange={e=>setSynN(Number(e.target.value))} />
        </div>

        {/* Churn rate slider */}
        <div className="ds-slider-wrap">
          <div className="ds-slider-top">
            <div className="ds-label">Target Churn Rate</div>
            <div className="ds-slider-val ds-churn-slider-val" style={{color:"#ff4d6d"}}>{(synRate*100).toFixed(0)}%</div>
          </div>
          <input type="range" className="ds-slider danger" min={0.05} max={0.8} step={0.01} value={synRate} onChange={e=>setSynRate(Number(e.target.value))} />
        </div>

        <button className="ds-btn ds-btn-primary" onClick={generateSynthetic} disabled={generating}>
          {generating ? <><div className="ds-btn-spinner"/>Generating...</> : <>⚡ Generate Synthetic Dataset</>}
        </button>
      </div>

      {/* DATABASE */}
      <div className="ds-panel">
        <div className="ds-panel-header">
          <div className="ds-panel-icon" style={{background:"rgba(255,193,7,0.1)",color:"#ffc107"}}>◉</div>
          <div className="ds-panel-info">
            <div className="ds-panel-title">Database Connection</div>
            <div className="ds-panel-desc">Test a live database connection string</div>
          </div>
        </div>

        <div className="ds-form-group" style={{marginBottom:16}}>
          <label className="ds-label">Connection String</label>
          <input className="ds-input" placeholder="postgresql://user:pass@host:5432/db" value={conn} onChange={e=>setConn(e.target.value)} />
        </div>

        <button className="ds-btn ds-btn-outline" onClick={testDB} disabled={testing}>
          {testing ? <><div className="ds-btn-spinner" style={{borderTopColor:"#4a5568"}}/>Testing...</> : <>◉ Test Connection</>}
        </button>
      </div>

    </div></>
  );
}
