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
    max-width: 860px;
    padding: 28px;
  }
  @keyframes dsFade { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }

  /* ── HEADER ── */
  .ds-header { margin-bottom: 32px; }
  .ds-title {
    font-family: 'Syne', sans-serif;
    font-size: 26px; font-weight: 800;
    letter-spacing: -1px; line-height: 1.1;
  }
  .ds-title span { color: #00e5c3; }
  .ds-subtitle { font-size: 12px; color: #4a5568; margin-top: 6px; }

  /* ── STEPS STRIP ── */
  .ds-steps {
    display: flex;
    margin-bottom: 32px;
    background: #0f1218;
    border: 1px solid #1e2530;
    border-radius: 12px;
    overflow: hidden;
  }
  .ds-step {
    flex: 1; padding: 14px 18px;
    display: flex; align-items: center; gap: 10px;
    border-right: 1px solid #1e2530;
    font-size: 11px; transition: background 0.2s;
  }
  .ds-step:last-child { border-right: none; }
  .ds-step:hover { background: rgba(255,255,255,0.02); }
  .ds-step.active { background: rgba(0,229,195,0.06); }
  .ds-step-num {
    width: 22px; height: 22px; border-radius: 50%;
    border: 1px solid #1e2530; flex-shrink: 0;
    display: flex; align-items: center; justify-content: center;
    font-size: 10px; color: #4a5568;
    font-family: 'Syne', sans-serif; font-weight: 800;
  }
  .ds-step.active .ds-step-num { background: #00e5c3; color: #080b10; border-color: #00e5c3; }
  .ds-step-label { color: #4a5568; }
  .ds-step.active .ds-step-label { color: #e2e8f4; }

  /* ── PANEL ── */
  .ds-panel {
    background: #0f1218;
    border: 1px solid #1e2530;
    border-radius: 14px;
    padding: 24px 26px;
    margin-bottom: 18px;
    transition: border-color 0.2s;
  }
  .ds-panel:hover { border-color: rgba(0,229,195,0.1); }

  .ds-panel-header {
    display: flex; align-items: center; gap: 12px;
    margin-bottom: 22px; padding-bottom: 16px;
    border-bottom: 1px solid #1e2530;
  }
  .ds-panel-icon {
    width: 34px; height: 34px; border-radius: 9px;
    display: flex; align-items: center; justify-content: center;
    font-size: 16px; flex-shrink: 0;
  }
  .ds-panel-title {
    font-family: 'Syne', sans-serif;
    font-size: 14px; font-weight: 700; letter-spacing: -0.3px;
  }
  .ds-panel-desc { font-size: 11px; color: #4a5568; margin-top: 2px; }

  /* ── UPLOAD ZONE ── */
  .ds-upload-zone {
    border: 2px dashed #1e2530;
    border-radius: 12px;
    padding: 36px 20px;
    text-align: center;
    cursor: pointer;
    transition: all 0.2s;
    position: relative;
    margin-bottom: 18px;
  }
  .ds-upload-zone:hover,
  .ds-upload-zone.dragover {
    border-color: #00e5c3;
    background: rgba(0,229,195,0.04);
  }
  .ds-upload-zone input {
    position: absolute; inset: 0;
    opacity: 0; cursor: pointer;
    width: 100%; height: 100%;
  }
  .ds-upload-icon { font-size: 30px; margin-bottom: 10px; opacity: 0.7; }
  .ds-upload-text { font-size: 13px; color: #6b7a95; line-height: 1.7; }
  .ds-upload-text strong { color: #00e5c3; }
  .ds-upload-hint { font-size: 11px; color: #2d3748; margin-top: 5px; }

  .ds-file-badge {
    display: inline-flex; align-items: center; gap: 7px;
    margin-top: 12px; font-size: 12px;
    padding: 6px 14px;
    background: rgba(0,229,195,0.08);
    border: 1px solid rgba(0,229,195,0.2);
    border-radius: 20px; color: #00e5c3;
  }

  /* ── FORM ── */
  .ds-form-row { display: flex; gap: 12px; margin-bottom: 14px; flex-wrap: wrap; }
  .ds-form-group { display: flex; flex-direction: column; gap: 6px; flex: 1; min-width: 140px; margin-bottom: 14px; }
  .ds-label { font-size: 10px; letter-spacing: 1.5px; text-transform: uppercase; color: #4a5568; }
  .ds-input {
    font-family: 'DM Mono', monospace;
    font-size: 13px; color: #e2e8f4;
    background: #161b24;
    border: 1px solid #1e2530;
    border-radius: 9px; padding: 10px 14px;
    outline: none; transition: all 0.2s;
    width: 100%; box-sizing: border-box;
  }
  .ds-input:focus { border-color: #00e5c3; background: rgba(0,229,195,0.03); box-shadow: 0 0 0 3px rgba(0,229,195,0.07); }
  .ds-input::placeholder { color: #2d3748; }
  .ds-input option { background: #161b24; color: #e2e8f4; }

  /* ── SLIDER ── */
  .ds-slider-block { margin-bottom: 20px; }
  .ds-slider-top {
    display: flex; justify-content: space-between; align-items: baseline;
    margin-bottom: 8px;
  }
  .ds-slider-label { font-size: 10px; letter-spacing: 1.5px; text-transform: uppercase; color: #4a5568; }
  .ds-slider-val { font-family: 'Syne', sans-serif; font-size: 18px; font-weight: 800; }
  .ds-slider-sub { font-size: 10px; color: #2d3748; margin-top: 4px; }

  .ds-slider {
    -webkit-appearance: none; appearance: none;
    width: 100%; height: 4px;
    background: #1e2530; border-radius: 2px;
    outline: none; cursor: pointer;
  }
  .ds-slider::-webkit-slider-thumb {
    -webkit-appearance: none; appearance: none;
    width: 16px; height: 16px;
    border-radius: 50%; background: #00e5c3;
    cursor: pointer;
    box-shadow: 0 0 8px rgba(0,229,195,0.4);
  }
  .ds-slider.danger::-webkit-slider-thumb {
    background: #ff4d6d;
    box-shadow: 0 0 8px rgba(255,77,109,0.4);
  }

  /* ── DIVIDER ── */
  .ds-divider { height: 1px; background: #1e2530; margin: 20px 0; }

  /* ── BUTTONS ── */
  .ds-btn {
    font-family: 'Syne', sans-serif;
    font-size: 13px; font-weight: 700;
    padding: 11px 24px; border-radius: 9px;
    border: none; cursor: pointer;
    transition: all 0.2s; letter-spacing: -0.3px;
    display: inline-flex; align-items: center; gap: 8px;
  }
  .ds-btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none !important; box-shadow: none !important; }

  .ds-btn-primary { background: #00e5c3; color: #080b10; }
  .ds-btn-primary:hover:not(:disabled) { background: #00ffd5; transform: translateY(-1px); box-shadow: 0 8px 20px rgba(0,229,195,0.25); }

  .ds-btn-outline { background: #161b24; color: #6b7a95; border: 1px solid #1e2530; }
  .ds-btn-outline:hover:not(:disabled) { border-color: rgba(0,229,195,0.3); color: #00e5c3; }

  .ds-btn-danger { background: rgba(255,77,109,0.1); color: #ff4d6d; border: 1px solid rgba(255,77,109,0.2); }
  .ds-btn-danger:hover:not(:disabled) { background: rgba(255,77,109,0.18); }

  .ds-spinner {
    width: 14px; height: 14px;
    border: 2px solid rgba(0,0,0,0.2);
    border-top-color: #080b10;
    border-radius: 50%;
    animation: spin 0.6s linear infinite;
  }
  .ds-spinner-light {
    width: 14px; height: 14px;
    border: 2px solid #1e2530;
    border-top-color: #00e5c3;
    border-radius: 50%;
    animation: spin 0.6s linear infinite;
  }
  @keyframes spin { to { transform: rotate(360deg); } }

  /* ── RESULT CARD ── */
  .ds-result {
    background: rgba(0,229,195,0.04);
    border: 1px solid rgba(0,229,195,0.15);
    border-radius: 10px;
    padding: 16px 18px;
    margin-top: 18px;
  }
  .ds-result-title {
    font-size: 10px; letter-spacing: 1.5px;
    text-transform: uppercase; color: #00e5c3;
    margin-bottom: 12px;
  }
  .ds-result-row {
    display: flex; justify-content: space-between; align-items: center;
    padding: 8px 0;
    border-bottom: 1px solid rgba(0,229,195,0.07);
    font-size: 12px;
  }
  .ds-result-row:last-child { border-bottom: none; }
  .ds-result-key { color: #4a5568; }
  .ds-result-val { color: #00e5c3; font-weight: 600; }

  /* ── MESSAGE ── */
  .ds-msg {
    display: flex; align-items: center; gap: 8px;
    padding: 11px 15px; border-radius: 8px;
    font-size: 12px; margin-top: 14px;
  }
  .ds-msg.success { background: rgba(0,229,195,0.07); border: 1px solid rgba(0,229,195,0.2); color: #00e5c3; }
  .ds-msg.error   { background: rgba(255,77,109,0.07); border: 1px solid rgba(255,77,109,0.2); color: #ff4d6d; }
  .ds-msg.warn    { background: rgba(255,193,7,0.07);  border: 1px solid rgba(255,193,7,0.2);  color: #ffc107; }

  /* ── DB GRID ── */
  .ds-db-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
  @media(max-width:600px) { .ds-db-grid { grid-template-columns: 1fr; } }

  /* ── PREVIEW TABLE ── */
  .ds-preview-wrap {
    overflow-x: auto; max-height: 280px; overflow-y: auto;
    border: 1px solid #1e2530; border-radius: 8px; margin-top: 14px;
  }
  .ds-preview-wrap::-webkit-scrollbar { width: 4px; height: 4px; }
  .ds-preview-wrap::-webkit-scrollbar-thumb { background: #1e2530; border-radius: 2px; }
  .ds-preview-table { width: 100%; border-collapse: collapse; font-size: 11px; }
  .ds-preview-table thead th {
    font-size: 9px; letter-spacing: 1.5px; text-transform: uppercase;
    color: #4a5568; padding: 9px 12px; text-align: left;
    border-bottom: 1px solid #1e2530; background: #0f1218;
    position: sticky; top: 0; white-space: nowrap;
  }
  .ds-preview-table tbody tr { border-bottom: 1px solid rgba(255,255,255,0.03); }
  .ds-preview-table tbody tr:hover { background: rgba(255,255,255,0.02); }
  .ds-preview-table td { padding: 8px 12px; color: #e2e8f4; white-space: nowrap; }

  /* ── TABLE SELECTOR ── */
  .ds-table-select-row {
    display: flex; align-items: flex-end; gap: 12px;
    margin-top: 16px; flex-wrap: wrap;
  }
  .ds-table-select-row .ds-form-group { margin-bottom: 0; }
`;

function getMsgType(msg) {
  if (!msg) return "warn";
  if (msg.startsWith("✅")) return "success";
  if (msg.startsWith("❌")) return "error";
  return "warn";
}

export default function DataSource() {
  const [file, setFile]           = useState(null);
  const [msg, setMsg]             = useState("");
  const [result, setResult]       = useState(null);
  const [uploading, setUploading] = useState(false);
  const [dragover, setDragover]   = useState(false);

  const [synN, setSynN]           = useState(1000);
  const [synRate, setSynRate]     = useState(0.3);
  const [generating, setGenerating] = useState(false);

  const [tables, setTables]             = useState([]);
  const [selectedTable, setSelectedTable] = useState("");
  const [previewRows, setPreviewRows]   = useState([]);
  const [previewLoading, setPreviewLoading] = useState(false);

  const [dbConfig, setDbConfig] = useState({
    type: "postgres",
    host: "", port: "", database: "",
    user: "", password: "", path: "", uri: ""
  });
  const [dbStatus, setDbStatus]   = useState("");
  const [testingDB, setTestingDB] = useState(false);

  const setDatasetPath = useDatasetStore(s => s.setDatasetPath);
  const navigate = useNavigate();

  /* ── UPLOAD ── */
  async function uploadFile() {
    if (!file) { setMsg("⚠️ Please select a CSV file"); return; }
    const form = new FormData();
    form.append("file", file);
    setUploading(true);
    setMsg("");
    try {
      const res = await api.post("/data/upload", form);
      setResult(res.data);
      setMsg("✅ Upload successful");
      const path = res.data.saved_as || res.data.file || res.data.file_path || res.data.dataset_path;
      if (!path) { setMsg("❌ Upload OK but dataset path missing"); return; }
      setDatasetPath(path);
      navigate("/dashboard/overview");
    } catch {
      setMsg("❌ Upload failed — check backend logs");
    }
    setUploading(false);
  }

  /* ── SYNTHETIC ── */
  async function generateSynthetic() {
    setGenerating(true);
    setMsg("");
    try {
      const res = await api.post(`/data/synthetic?n_customers=${synN}&churn_rate=${synRate}`);
      const path = res.data.file || res.data.saved_as || res.data.file_path;
      if (path) { setDatasetPath(path); navigate("/dashboard/overview"); }
      setMsg("✅ Synthetic dataset created");
    } catch {
      setMsg("❌ Synthetic generation failed");
    }
    setGenerating(false);
  }

  /* ── DB TEST ── */
  async function testDBConnection() {
    setTestingDB(true);
    setDbStatus("");
    try {
      const payload = dbConfig.type === "mongodb"
        ? { type: "mongodb", uri: dbConfig.uri, database: dbConfig.database }
        : dbConfig;
      const res = await api.post("/api/data-source/test", payload);
      if (res.data.status === "connected") {
        setDbStatus("✅ Connection successful");
        const tablesRes = await api.post("/api/data-source/tables", payload);
        setTables(tablesRes.data.tables || []);
      } else {
        setDbStatus(`❌ ${res.data.error || "Connection failed"}`);
      }
    } catch (err) {
      console.error(err);
      setDbStatus("❌ Unable to connect");
    }
    setTestingDB(false);
  }

  /* ── PREVIEW ── */
  async function previewTable() {
    if (!selectedTable) return;
    setPreviewLoading(true);
    try {
      const payload = dbConfig.type === "mongodb"
        ? { type: "mongodb", uri: dbConfig.uri, database: dbConfig.database, table: selectedTable }
        : { ...dbConfig, table: selectedTable };
      const res = await api.post("/api/data-source/preview", payload);
      setPreviewRows(res.data.rows || []);
    } catch (e) {
      console.error(e);
    }
    setPreviewLoading(false);
  }

  const previewCols = previewRows.length ? Object.keys(previewRows[0]) : [];

  return (
    <>
      <style>{styles}</style>
      <div className="ds-root">

        {/* ── HEADER ── */}
        <div className="ds-header">
          <div className="ds-title">Data <span>Source</span></div>
          <div className="ds-subtitle">Upload a CSV, generate synthetic data, or connect an external database</div>
        </div>

        {/* ── STEPS STRIP ── */}
        <div className="ds-steps">
          {[
            { n:"1", label:"Connect Data" },
            { n:"2", label:"Validate & Preview" },
            { n:"3", label:"Run Intelligence" },
          ].map((s, i) => (
            <div key={i} className={`ds-step${i === 0 ? " active" : ""}`}>
              <div className="ds-step-num">{s.n}</div>
              <span className="ds-step-label">{s.label}</span>
            </div>
          ))}
        </div>

        {/* ══════════════════════════════════════
            PANEL 1 — FILE UPLOAD
        ══════════════════════════════════════ */}
        <div className="ds-panel">
          <div className="ds-panel-header">
            <div className="ds-panel-icon" style={{background:"rgba(0,229,195,0.1)"}}>📂</div>
            <div className="ds-panel-info">
              <div className="ds-panel-title">Upload CSV Dataset</div>
              <div className="ds-panel-desc">Drop your customer data file — supports up to 25,000 rows</div>
            </div>
          </div>

          {/* DRAG DROP ZONE */}
          <div
            className={`ds-upload-zone${dragover ? " dragover" : ""}`}
            onDragOver={e => { e.preventDefault(); setDragover(true); }}
            onDragLeave={() => setDragover(false)}
            onDrop={e => {
              e.preventDefault(); setDragover(false);
              const f = e.dataTransfer.files[0];
              if (f) setFile(f);
            }}
          >
            <input
              type="file"
              accept=".csv"
              onChange={e => setFile(e.target.files[0])}
            />
            <div className="ds-upload-icon">⬆</div>
            <div className="ds-upload-text">
              <strong>Click to browse</strong> or drag & drop your CSV here
            </div>
            <div className="ds-upload-hint">Supported: .csv · Max 25,000 rows</div>
            {file && (
              <div className="ds-file-badge">
                <span>📄</span> {file.name}
                <span style={{color:"#4a5568",fontSize:10}}>({(file.size/1024).toFixed(1)} KB)</span>
              </div>
            )}
          </div>

          <button
            className="ds-btn ds-btn-primary"
            onClick={uploadFile}
            disabled={uploading || !file}
            style={{width:"100%",justifyContent:"center"}}
          >
            {uploading
              ? <><span className="ds-spinner"/>Uploading & Analyzing…</>
              : <>⚡ Upload & Analyze</>
            }
          </button>

          {msg && <div className={`ds-msg ${getMsgType(msg)}`}>{msg}</div>}

          {result && (
            <div className="ds-result">
              <div className="ds-result-title">◈ Upload Result</div>
              {Object.entries(result).map(([k, v]) => (
                <div key={k} className="ds-result-row">
                  <span className="ds-result-key">{k.replace(/_/g," ")}</span>
                  <span className="ds-result-val">{String(v)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ══════════════════════════════════════
            PANEL 2 — SYNTHETIC GENERATOR
        ══════════════════════════════════════ */}
        <div className="ds-panel">
          <div className="ds-panel-header">
            <div className="ds-panel-icon" style={{background:"rgba(124,106,255,0.1)"}}>⚗</div>
            <div className="ds-panel-info">
              <div className="ds-panel-title">Synthetic Dataset Generator</div>
              <div className="ds-panel-desc">Generate realistic churn data for testing and demos</div>
            </div>
          </div>

          {/* CUSTOMER COUNT SLIDER */}
          <div className="ds-slider-block">
            <div className="ds-slider-top">
              <span className="ds-slider-label">Customer Count</span>
              <span className="ds-slider-val" style={{color:"#7c6aff"}}>{synN.toLocaleString()}</span>
            </div>
            <input
              type="range" className="ds-slider"
              min={100} max={25000} step={100}
              value={synN}
              onChange={e => setSynN(Number(e.target.value))}
            />
            <div className="ds-slider-sub">100 – 25,000 customers</div>
          </div>

          <div className="ds-divider"/>

          {/* CHURN RATE SLIDER */}
          <div className="ds-slider-block">
            <div className="ds-slider-top">
              <span className="ds-slider-label">Churn Rate</span>
              <span className="ds-slider-val" style={{color:"#ff4d6d"}}>{(synRate * 100).toFixed(0)}%</span>
            </div>
            <input
              type="range" className="ds-slider danger"
              min={0.05} max={0.8} step={0.01}
              value={synRate}
              onChange={e => setSynRate(Number(e.target.value))}
            />
            <div className="ds-slider-sub">5% – 80% churn rate</div>
          </div>

          {/* PREVIEW ROW */}
          <div style={{
            display:"flex", alignItems:"center", justifyContent:"space-between",
            background:"#161b24", border:"1px solid #1e2530", borderRadius:8,
            padding:"10px 16px", marginBottom:18, fontSize:12
          }}>
            <span style={{color:"#4a5568"}}>Will generate</span>
            <span style={{fontFamily:"Syne,sans-serif", fontWeight:700, color:"#e2e8f4"}}>
              {synN.toLocaleString()} customers · {(synRate*100).toFixed(0)}% churn
              <span style={{color:"#ff4d6d", marginLeft:6}}>≈ {Math.round(synN * synRate).toLocaleString()} churners</span>
            </span>
          </div>

          <button
            className="ds-btn ds-btn-primary"
            onClick={generateSynthetic}
            disabled={generating}
            style={{width:"100%",justifyContent:"center"}}
          >
            {generating
              ? <><span className="ds-spinner"/>Generating…</>
              : <>⚗ Generate Dataset</>
            }
          </button>
        </div>

        {/* ══════════════════════════════════════
            PANEL 3 — DATABASE CONNECTION
        ══════════════════════════════════════ */}
        <div className="ds-panel">
          <div className="ds-panel-header">
            <div className="ds-panel-icon" style={{background:"rgba(255,193,7,0.1)"}}>🗄</div>
            <div className="ds-panel-info">
              <div className="ds-panel-title">External Database Connection</div>
              <div className="ds-panel-desc">Connect to PostgreSQL, MySQL, SQLite, or MongoDB</div>
            </div>
          </div>

          {/* DB TYPE */}
          <div className="ds-form-group">
            <label className="ds-label">Database Type</label>
            <select
              className="ds-input"
              value={dbConfig.type}
              onChange={e => setDbConfig({ ...dbConfig, type: e.target.value })}
            >
              <option value="postgres">PostgreSQL</option>
              <option value="mysql">MySQL</option>
              <option value="sqlite">SQLite</option>
              <option value="mongodb">MongoDB</option>
            </select>
          </div>

          {/* SQLITE PATH */}
          {dbConfig.type === "sqlite" && (
            <div className="ds-form-group">
              <label className="ds-label">Database File Path</label>
              <input
                className="ds-input"
                placeholder="/path/to/your/database.db"
                onChange={e => setDbConfig({ ...dbConfig, path: e.target.value })}
              />
            </div>
          )}

          {/* MONGODB URI */}
          {dbConfig.type === "mongodb" && (
            <div className="ds-db-grid">
              <div className="ds-form-group" style={{gridColumn:"1/-1"}}>
                <label className="ds-label">Connection URI</label>
                <input
                  className="ds-input"
                  placeholder="mongodb://localhost:27017"
                  onChange={e => setDbConfig({ ...dbConfig, uri: e.target.value })}
                />
              </div>
              <div className="ds-form-group">
                <label className="ds-label">Database Name</label>
                <input
                  className="ds-input"
                  placeholder="my_database"
                  onChange={e => setDbConfig({ ...dbConfig, database: e.target.value })}
                />
              </div>
            </div>
          )}

          {/* POSTGRES / MYSQL FIELDS */}
          {dbConfig.type !== "sqlite" && dbConfig.type !== "mongodb" && (
            <>
              <div className="ds-db-grid">
                <div className="ds-form-group">
                  <label className="ds-label">Host</label>
                  <input className="ds-input" placeholder="localhost"
                    onChange={e => setDbConfig({ ...dbConfig, host: e.target.value })}/>
                </div>
                <div className="ds-form-group">
                  <label className="ds-label">Port</label>
                  <input className="ds-input" placeholder={dbConfig.type === "mysql" ? "3306" : "5432"}
                    onChange={e => setDbConfig({ ...dbConfig, port: e.target.value })}/>
                </div>
              </div>
              <div className="ds-form-group">
                <label className="ds-label">Database</label>
                <input className="ds-input" placeholder="database_name"
                  onChange={e => setDbConfig({ ...dbConfig, database: e.target.value })}/>
              </div>
              <div className="ds-db-grid">
                <div className="ds-form-group">
                  <label className="ds-label">Username</label>
                  <input className="ds-input" placeholder="username"
                    onChange={e => setDbConfig({ ...dbConfig, user: e.target.value })}/>
                </div>
                <div className="ds-form-group">
                  <label className="ds-label">Password</label>
                  <input className="ds-input" type="password" placeholder="••••••••"
                    onChange={e => setDbConfig({ ...dbConfig, password: e.target.value })}/>
                </div>
              </div>
            </>
          )}

          <button
            className="ds-btn ds-btn-outline"
            onClick={testDBConnection}
            disabled={testingDB}
          >
            {testingDB
              ? <><span className="ds-spinner-light"/>Testing connection…</>
              : <>◎ Test Connection</>
            }
          </button>

          {dbStatus && (
            <div className={`ds-msg ${getMsgType(dbStatus)}`}>{dbStatus}</div>
          )}

          {/* TABLE SELECTOR */}
          {tables.length > 0 && (
            <>
              <div className="ds-divider"/>
              <div className="ds-table-select-row">
                <div className="ds-form-group" style={{flex:1, minWidth:200}}>
                  <label className="ds-label">Table / Collection</label>
                  <select
                    className="ds-input"
                    value={selectedTable}
                    onChange={e => setSelectedTable(e.target.value)}
                  >
                    <option value="">Select a table…</option>
                    {tables.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <button
                  className="ds-btn ds-btn-outline"
                  style={{marginBottom:0, flexShrink:0}}
                  onClick={previewTable}
                  disabled={!selectedTable || previewLoading}
                >
                  {previewLoading
                    ? <><span className="ds-spinner-light"/>Loading…</>
                    : <>▦ Preview Data</>
                  }
                </button>
              </div>

              {/* PREVIEW TABLE */}
              {previewRows.length > 0 && (
                <div className="ds-preview-wrap">
                  <table className="ds-preview-table">
                    <thead>
                      <tr>{previewCols.map(c => <th key={c}>{c}</th>)}</tr>
                    </thead>
                    <tbody>
                      {previewRows.map((row, i) => (
                        <tr key={i}>
                          {previewCols.map(c => (
                            <td key={c}>{String(row[c] ?? "—")}</td>
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

      </div>
    </>
  );
}
