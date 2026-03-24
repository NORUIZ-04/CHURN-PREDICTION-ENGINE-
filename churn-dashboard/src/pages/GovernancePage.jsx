import { useEffect, useState } from "react";
import axios from "axios";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid,
  AreaChart, Area, ReferenceLine, ResponsiveContainer
} from "recharts";

import DriftStatusRow from "../components/DriftStatusRow";
import FairnessCard from "../components/FairnessCard";
import ConfidenceGauge from "../components/ConfidenceGauge";

const API = "http://localhost:8000/api/governance";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Mono:wght@300;400;500&display=swap');

  .gv-root {
    font-family: 'DM Mono', monospace;
    color: #e2e8f4;
    animation: gvFade 0.5s ease;
    padding: 28px;
  }
  @keyframes gvFade { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }

  /* ── PAGE HEADER ── */
  .gv-page-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    margin-bottom: 28px;
    flex-wrap: wrap;
    gap: 16px;
  }
  .gv-page-title {
    font-family: 'Syne', sans-serif;
    font-size: 22px; font-weight: 800;
    letter-spacing: -0.5px;
    display: flex; align-items: center; gap: 10px;
  }
  .gv-page-sub { font-size: 12px; color: #4a5568; margin-top: 4px; }

  .gv-header-actions { display: flex; align-items: center; gap: 12px; }

  .gv-btn {
    font-family: 'Syne', sans-serif;
    font-size: 12px; font-weight: 700;
    padding: 10px 22px; border-radius: 9px;
    border: none; cursor: pointer;
    background: #00e5c3; color: #080b10;
    transition: all 0.2s;
    display: inline-flex; align-items: center; gap: 6px;
  }
  .gv-btn:hover:not(:disabled) {
    background: #00ffd5;
    transform: translateY(-1px);
    box-shadow: 0 6px 18px rgba(0,229,195,0.25);
  }
  .gv-btn:disabled { opacity: 0.5; cursor: not-allowed; }
  .gv-btn-outline {
    background: #161b24;
    color: #6b7a95;
    border: 1px solid #1e2530;
  }
  .gv-btn-outline:hover:not(:disabled) {
    border-color: rgba(0,229,195,0.3);
    color: #00e5c3;
    box-shadow: none;
    background: #161b24;
    transform: none;
  }
  .gv-spinner {
    width: 13px; height: 13px;
    border: 2px solid rgba(0,0,0,0.2);
    border-top-color: #080b10;
    border-radius: 50%;
    animation: spin 0.6s linear infinite;
  }
  @keyframes spin { to{transform:rotate(360deg)} }

  /* ── AUTO REFRESH TOGGLE ── */
  .gv-toggle-wrap {
    display: flex; align-items: center; gap: 8px;
    font-size: 11px; color: #4a5568; cursor: pointer;
    padding: 8px 14px;
    background: #161b24; border: 1px solid #1e2530;
    border-radius: 9px; transition: all 0.2s;
    user-select: none;
  }
  .gv-toggle-wrap:hover { border-color: rgba(0,229,195,0.2); color: #e2e8f4; }
  .gv-toggle-wrap.active { border-color: rgba(0,229,195,0.3); color: #00e5c3; }
  .gv-toggle-dot {
    width: 8px; height: 8px; border-radius: 50%;
    background: #1e2530; transition: background 0.2s;
  }
  .gv-toggle-wrap.active .gv-toggle-dot { background: #00e5c3; box-shadow: 0 0 6px rgba(0,229,195,0.5); }

  /* ── KPI GRID ── */
  .gv-kpi-grid {
    display: grid;
    grid-template-columns: 200px repeat(3, 1fr);
    gap: 14px;
    margin-bottom: 22px;
    align-items: stretch;
  }

  .gv-kpi-gauge {
    background: #0f1218;
    border: 1px solid #1e2530;
    border-radius: 12px;
    padding: 20px;
    display: flex; align-items: center; justify-content: center;
    position: relative; overflow: hidden;
    transition: border-color 0.2s;
  }
  .gv-kpi-gauge:hover { border-color: rgba(0,229,195,0.2); }
  .gv-kpi-gauge-top { position: absolute; top: 0; left: 0; right: 0; height: 2px; background: #00e5c3; }

  .gv-kpi {
    background: #0f1218;
    border: 1px solid #1e2530;
    border-radius: 12px;
    padding: 20px 18px;
    position: relative; overflow: hidden;
    transition: all 0.2s;
  }
  .gv-kpi:hover { border-color: rgba(0,229,195,0.15); transform: translateY(-2px); }
  .gv-kpi-top { position: absolute; top: 0; left: 0; right: 0; height: 2px; }
  .gv-kpi-label {
    font-size: 10px; letter-spacing: 1.5px;
    text-transform: uppercase; color: #4a5568;
    margin-bottom: 10px;
  }
  .gv-kpi-value {
    font-family: 'Syne', sans-serif;
    font-size: 28px; font-weight: 800;
    letter-spacing: -0.5px; line-height: 1;
  }
  .gv-kpi-sub { font-size: 10px; color: #2d3748; margin-top: 6px; }

  /* ── PANEL ── */
  .gv-panel {
    background: #0f1218;
    border: 1px solid #1e2530;
    border-radius: 12px;
    padding: 22px;
    margin-bottom: 18px;
  }
  .gv-panel-header {
    display: flex; align-items: center; justify-content: space-between;
    margin-bottom: 18px; padding-bottom: 14px;
    border-bottom: 1px solid #1e2530;
  }
  .gv-panel-title {
    font-family: 'Syne', sans-serif;
    font-size: 14px; font-weight: 700;
    display: flex; align-items: center; gap: 8px;
  }
  .gv-panel-badge {
    font-size: 10px; padding: 3px 10px;
    background: #161b24; border: 1px solid #1e2530;
    border-radius: 20px; color: #4a5568; letter-spacing: 1px;
    text-transform: uppercase;
  }

  /* ── MAIN GRID ── */
  .gv-main-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 18px;
    margin-bottom: 18px;
  }

  /* ── FAIRNESS GRID ── */
  .gv-fairness-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 14px;
    margin-bottom: 18px;
  }

  /* ── ALERTS ── */
  .gv-alert-item {
    display: flex; align-items: center; gap: 10px;
    padding: 10px 14px;
    background: rgba(255,77,109,0.06);
    border: 1px solid rgba(255,77,109,0.15);
    border-radius: 8px;
    font-size: 12px; color: #e2e8f4;
    margin-bottom: 8px;
  }
  .gv-alert-dot {
    width: 6px; height: 6px; border-radius: 50%;
    background: #ff4d6d; flex-shrink: 0;
    box-shadow: 0 0 6px rgba(255,77,109,0.5);
  }

  /* ── LOADING ── */
  .gv-loading {
    display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    min-height: 55vh; gap: 16px;
    font-size: 12px; color: #4a5568;
  }
  .gv-loading-bar { height: 2px; width: 200px; background: #1e2530; border-radius: 1px; overflow: hidden; }
  .gv-loading-fill {
    height: 100%; width: 40%;
    background: linear-gradient(90deg, #00e5c3, #7c6aff);
    animation: loadSlide 1.2s ease-in-out infinite;
  }
  @keyframes loadSlide { 0%{transform:translateX(-100%)} 100%{transform:translateX(350%)} }

  /* ── DRIFT TABLE WRAP ── */
  .gv-drift-list { max-height: 320px; overflow-y: auto; }
  .gv-drift-list::-webkit-scrollbar { width: 4px; }
  .gv-drift-list::-webkit-scrollbar-thumb { background: #1e2530; border-radius: 2px; }
`;

const ChartTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{background:"#161b24",border:"1px solid #2d3748",borderRadius:8,padding:"10px 14px",fontFamily:"DM Mono,monospace",fontSize:12,color:"#e2e8f4"}}>
      <div style={{color:"#4a5568",fontSize:10,marginBottom:3}}>{payload[0].payload.date}</div>
      <div style={{color:"#00e5c3",fontFamily:"Syne,sans-serif",fontWeight:700}}>{Number(payload[0].value).toFixed(4)}</div>
    </div>
  );
};

export default function GovernancePage() {
  const [report, setReport]       = useState(null);
  const [drift, setDrift]         = useState([]);
  const [history, setHistory]     = useState([]);
  const [fairness, setFairness]   = useState([]);
  const [loading, setLoading]     = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);

  const dataset_id = "processed_synthetic_5000";

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    try {
      const r = await axios.get(`${API}/report/${dataset_id}`);
      setReport(r.data);
      setDrift(r.data.adwin_results || []);
      setFairness(r.data.fairness_results || []);

      const h = await axios.get(`${API}/confidence-history/${dataset_id}`);
      setHistory(h.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setInitialLoad(false);
    }
  };

  const runAnalysis = async () => {
    setLoading(true);
    try {
      const res = await axios.post(`${API}/analyze`, {
        dataset_id,
        include_history: true
      });
      setReport(res.data);
      setDrift(res.data.adwin_results || []);
      setFairness(res.data.fairness_results || []);
    } catch (e) {
      alert("Analysis failed — check backend logs");
    }
    setLoading(false);
  };

  useEffect(() => {
    if (!autoRefresh) return;
    const id = setInterval(async () => {
      const res = await axios.get(`${API}/drift-status`);
      setDrift(res.data.features || []);
    }, 30000);
    return () => clearInterval(id);
  }, [autoRefresh]);

  if (initialLoad) return (
    <>
      <style>{styles}</style>
      <div className="gv-root">
        <div className="gv-loading">
          <div style={{fontFamily:"Syne,sans-serif",fontSize:16,fontWeight:700,color:"#e2e8f4"}}>Loading Governance Report…</div>
          <div className="gv-loading-bar"><div className="gv-loading-fill"/></div>
          <div>Fetching model monitoring data</div>
        </div>
      </div>
    </>
  );

  const confidence = report?.confidence_result || {};
  const driftCount = drift.filter(d => d.status === "DRIFT").length;
  const fairnessPass = fairness.filter(f => f.overall_fairness === "COMPLIANT").length;
  const alertCount = report?.active_alerts?.length || 0;

  return (
    <>
      <style>{styles}</style>
      <div className="gv-root">

        {/* ── PAGE HEADER ── */}
        <div className="gv-page-header">
          <div>
            <div className="gv-page-title">
              <span style={{color:"#00e5c3"}}>◎</span> Governance Dashboard
            </div>
            <div className="gv-page-sub">Model monitoring · Drift detection · Fairness compliance</div>
          </div>
          <div className="gv-header-actions">
            <div
              className={`gv-toggle-wrap${autoRefresh ? " active" : ""}`}
              onClick={() => setAutoRefresh(p => !p)}
            >
              <span className="gv-toggle-dot"/>
              Auto Refresh {autoRefresh ? "ON" : "OFF"}
            </div>
            <button className="gv-btn" onClick={runAnalysis} disabled={loading}>
              {loading
                ? <><span className="gv-spinner"/>Running…</>
                : <>⚡ Run Analysis</>
              }
            </button>
          </div>
        </div>

        {/* ── KPI STRIP ── */}
        <div className="gv-kpi-grid">
          {/* CONFIDENCE GAUGE */}
          <div className="gv-kpi-gauge">
            <div className="gv-kpi-gauge-top"/>
            <ConfidenceGauge score={confidence.confidence_score || 0}/>
          </div>

          <div className="gv-kpi">
            <div className="gv-kpi-top" style={{background:"#ff4d6d"}}/>
            <div className="gv-kpi-label">Drifted Features</div>
            <div className="gv-kpi-value" style={{color:"#ff4d6d"}}>{driftCount}</div>
            <div className="gv-kpi-sub">of {drift.length} monitored</div>
          </div>

          <div className="gv-kpi">
            <div className="gv-kpi-top" style={{background:"#00e5c3"}}/>
            <div className="gv-kpi-label">Fairness Pass</div>
            <div className="gv-kpi-value" style={{color:"#00e5c3"}}>{fairnessPass}</div>
            <div className="gv-kpi-sub">of {fairness.length} attributes</div>
          </div>

          <div className="gv-kpi">
            <div className="gv-kpi-top" style={{background: alertCount > 0 ? "#ff4d6d" : "#4a5568"}}/>
            <div className="gv-kpi-label">Active Alerts</div>
            <div className="gv-kpi-value" style={{color: alertCount > 0 ? "#ff4d6d" : "#4a5568"}}>
              {alertCount}
            </div>
            <div className="gv-kpi-sub">{alertCount > 0 ? "Requires attention" : "All clear"}</div>
          </div>
        </div>

        {/* ── DRIFT + CUSUM ── */}
        <div className="gv-main-grid">

          {/* DRIFT LIST */}
          <div className="gv-panel">
            <div className="gv-panel-header">
              <div className="gv-panel-title">
                <span style={{color:"#ff4d6d"}}>⚡</span> Feature Drift Status
              </div>
              <span className="gv-panel-badge">{drift.length} features</span>
            </div>
            {drift.length === 0 ? (
              <div style={{fontSize:12,color:"#4a5568",padding:"24px",textAlign:"center"}}>No drift data available</div>
            ) : (
              <div className="gv-drift-list">
                {/* Header row */}
                <div style={{display:"flex",justifyContent:"space-between",padding:"0 14px 8px",fontSize:9,letterSpacing:"1.5px",textTransform:"uppercase",color:"#2d3748"}}>
                  <span>Feature</span>
                  <span style={{flex:1,maxWidth:100,marginLeft:12}}>Magnitude</span>
                  <span style={{width:40,textAlign:"right"}}>Score</span>
                  <span style={{minWidth:72,textAlign:"center"}}>Status</span>
                </div>
                {drift.map(f => (
                  <DriftStatusRow key={f.feature} {...f}/>
                ))}
              </div>
            )}
          </div>

          {/* CUSUM CHART */}
          <div className="gv-panel">
            <div className="gv-panel-header">
              <div className="gv-panel-title">
                <span style={{color:"#7c6aff"}}>↗</span> CUSUM Score Trend
              </div>
              <span className="gv-panel-badge">{history.length} points</span>
            </div>
            {history.length === 0 ? (
              <div style={{fontSize:12,color:"#4a5568",padding:"24px",textAlign:"center"}}>No history data available</div>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={history} margin={{top:4,right:8,bottom:4,left:0}}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)"/>
                  <XAxis dataKey="date" tick={{fontSize:9,fill:"#4a5568",fontFamily:"DM Mono"}} axisLine={{stroke:"#1e2530"}} tickLine={false}/>
                  <YAxis tick={{fontSize:9,fill:"#4a5568",fontFamily:"DM Mono"}} axisLine={false} tickLine={false}/>
                  <Tooltip content={<ChartTooltip/>}/>
                  <Line dataKey="score" stroke="#00e5c3" strokeWidth={2} dot={false} activeDot={{r:4,fill:"#00e5c3"}}/>
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* ── FAIRNESS CARDS ── */}
        {fairness.length > 0 && (
          <div className="gv-panel">
            <div className="gv-panel-header">
              <div className="gv-panel-title">
                <span style={{color:"#ffc107"}}>◑</span> Fairness Compliance
              </div>
              <span className="gv-panel-badge">{fairness.length} attributes</span>
            </div>
            <div className="gv-fairness-grid">
              {fairness.map(f => (
                <FairnessCard key={f.attribute_name} {...f}/>
              ))}
            </div>
          </div>
        )}

        {/* ── CONFIDENCE HISTORY AREA CHART ── */}
        <div className="gv-panel">
          <div className="gv-panel-header">
            <div className="gv-panel-title">
              <span style={{color:"#00e5c3"}}>◎</span> Confidence Score History
            </div>
            <div style={{display:"flex",gap:14,fontSize:10,color:"#4a5568",alignItems:"center"}}>
              <span style={{display:"flex",alignItems:"center",gap:5}}>
                <span style={{width:16,height:2,background:"#00e5c3",display:"inline-block",borderRadius:1}}/>
                Score
              </span>
              <span style={{display:"flex",alignItems:"center",gap:5}}>
                <span style={{width:16,height:1,background:"#00e5c3",display:"inline-block",opacity:0.5}}/>
                Threshold 0.8
              </span>
              <span style={{display:"flex",alignItems:"center",gap:5}}>
                <span style={{width:16,height:1,background:"#ffc107",display:"inline-block",opacity:0.5}}/>
                Threshold 0.6
              </span>
            </div>
          </div>

          {history.length === 0 ? (
            <div style={{fontSize:12,color:"#4a5568",padding:"24px",textAlign:"center"}}>No confidence history available</div>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={history} margin={{top:4,right:8,bottom:4,left:0}}>
                <defs>
                  <linearGradient id="confGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00e5c3" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#00e5c3" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)"/>
                <XAxis dataKey="date" tick={{fontSize:9,fill:"#4a5568",fontFamily:"DM Mono"}} axisLine={{stroke:"#1e2530"}} tickLine={false}/>
                <YAxis tick={{fontSize:9,fill:"#4a5568",fontFamily:"DM Mono"}} axisLine={false} tickLine={false} domain={[0,1]}/>
                <Tooltip content={<ChartTooltip/>}/>
                <ReferenceLine y={0.8} stroke="#00e5c3" strokeDasharray="4 4" strokeOpacity={0.4}/>
                <ReferenceLine y={0.6} stroke="#ffc107" strokeDasharray="4 4" strokeOpacity={0.4}/>
                <Area
                  dataKey="score"
                  stroke="#00e5c3"
                  strokeWidth={2}
                  fill="url(#confGrad)"
                  dot={false}
                  activeDot={{r:4,fill:"#00e5c3"}}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* ── ACTIVE ALERTS ── */}
        {report?.active_alerts?.length > 0 && (
          <div className="gv-panel">
            <div className="gv-panel-header">
              <div className="gv-panel-title">
                <span style={{color:"#ff4d6d"}}>⚠</span> Active Alerts
              </div>
              <span className="gv-panel-badge" style={{color:"#ff4d6d",borderColor:"rgba(255,77,109,0.2)",background:"rgba(255,77,109,0.08)"}}>
                {report.active_alerts.length} alerts
              </span>
            </div>
            {report.active_alerts.map((alert, i) => (
              <div key={i} className="gv-alert-item">
                <span className="gv-alert-dot"/>
                <span>{typeof alert === "string" ? alert : JSON.stringify(alert)}</span>
              </div>
            ))}
          </div>
        )}

      </div>
    </>
  );
}
