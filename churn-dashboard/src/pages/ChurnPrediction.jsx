import { useState } from "react";
import { api } from "../api";
import { useDatasetStore } from "../store/datasetStore";
import { getFilename } from "../utils/getFilename";

import RiskChart from "../components/churn/RiskChart";
import SegmentRiskChart from "../components/churn/SegmentRiskChart";
import RiskTable from "../components/churn/RiskTable";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Mono:wght@300;400;500&display=swap');

  .cp-root {
    font-family: 'DM Mono', monospace;
    color: #e2e8f4;
    animation: cpFade 0.5s ease;
  }
  @keyframes cpFade { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }

  /* HEADER */
  .cp-header {
    display: flex; align-items: flex-start; justify-content: space-between;
    margin-bottom: 32px;
    flex-wrap: wrap; gap: 14px;
  }
  .cp-title {
    font-family: 'Syne', sans-serif;
    font-size: 28px; font-weight: 800;
    letter-spacing: -1px; line-height: 1.1;
  }
  .cp-title span { color: #00e5c3; }
  .cp-subtitle { font-size: 12px; color: #4a5568; margin-top: 6px; }

  .cp-header-right { display: flex; align-items: center; gap: 10px; }

  .cp-btn {
    font-family: 'Syne', sans-serif;
    font-size: 13px; font-weight: 700;
    padding: 11px 24px;
    border-radius: 9px; border: none; cursor: pointer;
    transition: all 0.2s; letter-spacing: -0.3px;
    display: flex; align-items: center; gap: 8px;
  }
  .cp-btn-primary {
    background: #00e5c3; color: #080b10;
  }
  .cp-btn-primary:hover:not(:disabled) {
    background: #00ffd5;
    transform: translateY(-1px);
    box-shadow: 0 8px 20px rgba(0,229,195,0.25);
  }
  .cp-btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }

  .cp-spinner {
    width: 14px; height: 14px;
    border: 2px solid rgba(0,0,0,0.2);
    border-top-color: #080b10;
    border-radius: 50%;
    animation: spin 0.6s linear infinite;
  }
  @keyframes spin { to{transform:rotate(360deg)} }

  /* ALERT */
  .cp-alert {
    display: flex; align-items: center; gap: 10px;
    padding: 14px 18px;
    background: rgba(255,77,109,0.06);
    border: 1px solid rgba(255,77,109,0.18);
    border-radius: 10px;
    font-size: 12px; color: #ff4d6d;
    margin-bottom: 24px;
  }

  /* KPI GRID */
  .cp-kpi-grid {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 14px;
    margin-bottom: 28px;
  }
  .cp-kpi {
    background: #0f1218;
    border: 1px solid #1e2530;
    border-radius: 12px;
    padding: 20px 18px;
    position: relative; overflow: hidden;
    transition: all 0.2s;
  }
  .cp-kpi:hover { border-color: rgba(0,229,195,0.2); transform: translateY(-2px); }
  .cp-kpi-top {
    position: absolute; top: 0; left: 0; right: 0;
    height: 2px;
  }
  .cp-kpi-label {
    font-size: 10px; letter-spacing: 1.5px; text-transform: uppercase;
    color: #4a5568; margin-bottom: 10px;
  }
  .cp-kpi-value {
    font-family: 'Syne', sans-serif;
    font-size: 26px; font-weight: 800;
    letter-spacing: -0.5px; line-height: 1;
  }
  .cp-kpi-sub { font-size: 10px; color: #2d3748; margin-top: 6px; }

  /* SEGMENT FILTER */
  .cp-seg-bar {
    display: flex; align-items: center; gap: 10px;
    margin-bottom: 20px;
    flex-wrap: wrap;
  }
  .cp-seg-label { font-size: 10px; color: #4a5568; letter-spacing: 1px; text-transform: uppercase; }
  .cp-seg-btn {
    font-family: 'DM Mono', monospace;
    font-size: 11px; padding: 5px 14px;
    border-radius: 20px; cursor: pointer;
    border: 1px solid #1e2530;
    background: transparent; color: #4a5568;
    transition: all 0.15s;
  }
  .cp-seg-btn:hover { color: #e2e8f4; border-color: #2d3748; }
  .cp-seg-btn.active {
    background: rgba(0,229,195,0.1);
    border-color: rgba(0,229,195,0.3);
    color: #00e5c3;
  }

  /* PANELS */
  .cp-panel {
    background: #0f1218;
    border: 1px solid #1e2530;
    border-radius: 12px;
    padding: 24px;
    margin-bottom: 20px;
  }
  .cp-panel-header {
    display: flex; align-items: center; justify-content: space-between;
    margin-bottom: 20px;
  }
  .cp-panel-title {
    font-family: 'Syne', sans-serif;
    font-size: 15px; font-weight: 700; letter-spacing: -0.3px;
  }
  .cp-panel-badge {
    font-size: 10px; color: #4a5568;
    padding: 4px 10px;
    background: #161b24; border: 1px solid #1e2530; border-radius: 20px;
  }

  /* EMPTY STATE */
  .cp-empty {
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    min-height: 55vh; text-align: center; gap: 14px;
  }
  .cp-empty-icon {
    width: 72px; height: 72px;
    background: #0f1218; border: 1px solid #1e2530;
    border-radius: 18px;
    display: flex; align-items: center; justify-content: center;
    font-size: 32px; margin-bottom: 8px;
  }
  .cp-empty-title {
    font-family: 'Syne', sans-serif;
    font-size: 20px; font-weight: 800; color: #e2e8f4;
  }
  .cp-empty-sub { font-size: 12px; color: #4a5568; line-height: 1.9; max-width: 340px; }
`;

function Kpi({ label, value, color = "#00e5c3", sub }) {
  return (
    <div className="cp-kpi">
      <div className="cp-kpi-top" style={{ background: color, opacity: 0.7 }} />
      <div className="cp-kpi-label">{label}</div>
      <div className="cp-kpi-value" style={{ color }}>{value}</div>
      {sub && <div className="cp-kpi-sub">{sub}</div>}
    </div>
  );
}

export default function ChurnPrediction() {
  const datasetPath = useDatasetStore(s => s.datasetPath);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedSegment, setSelectedSegment] = useState(null);

  async function load() {
    if (!datasetPath) return;
    setLoading(true);
    try {
      const filename = getFilename(datasetPath);
      const res = await api.get(`/predict/file/${filename}`);
      setRows(res.data || []);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  }

  const high   = rows.filter(r => r.churn_probability > 0.7).length;
  const medium = rows.filter(r => r.churn_probability > 0.4 && r.churn_probability <= 0.7).length;
  const low    = rows.filter(r => r.churn_probability <= 0.4).length;
  const avgRisk = rows.length > 0
    ? rows.reduce((a, b) => a + (b.churn_probability || 0), 0) / rows.length : 0;
  const opportunityScore = rows.length > 0
    ? rows.reduce((s, r) => s + (1 - (r.churn_probability || 0)), 0) / rows.length : 0;

  // unique segments for filter bar
  const segments = [...new Set(rows.map(r => r.plan_type).filter(Boolean))];
  const filteredRows = selectedSegment
    ? rows.filter(r => r.plan_type === selectedSegment)
    : rows;

  return (
    <>
      <style>{styles}</style>
      <div className="cp-root">

        {/* HEADER */}
        <div className="cp-header">
          <div>
            <div className="cp-title">Churn Risk <span>Intelligence</span></div>
            <div className="cp-subtitle">ML-powered churn probability scores · Model v3.2</div>
          </div>
          <div className="cp-header-right">
            <button className="cp-btn cp-btn-primary" onClick={load} disabled={loading || !datasetPath}>
              {loading
                ? <><div className="cp-spinner" /> Predicting...</>
                : <>⚡ Load Predictions</>
              }
            </button>
          </div>
        </div>

        {/* ALERT: no dataset */}
        {!datasetPath && (
          <div className="cp-alert">
            ⚠ No dataset loaded — go to <strong style={{ color: "#ff4d6d", marginLeft: 4 }}>Data Source</strong> and upload a CSV file first.
          </div>
        )}

        {/* EMPTY STATE: dataset loaded but not run yet */}
        {datasetPath && rows.length === 0 && !loading && (
          <div className="cp-empty">
            <div className="cp-empty-icon">🎯</div>
            <div className="cp-empty-title">Ready to Predict</div>
            <div className="cp-empty-sub">
              Your dataset is loaded. Hit <strong style={{ color: "#00e5c3" }}>Load Predictions</strong> to run the churn model across all customers.
            </div>
          </div>
        )}

        {/* RESULTS */}
        {rows.length > 0 && (
          <>
            {/* KPI STRIP */}
            <div className="cp-kpi-grid">
              <Kpi label="Avg Risk Score"         value={avgRisk.toFixed(3)}          color="#7c6aff" sub="Fleet average" />
              <Kpi label="High Risk"              value={high.toLocaleString()}        color="#ff4d6d" sub="> 70% probability" />
              <Kpi label="Medium Risk"            value={medium.toLocaleString()}      color="#ffc107" sub="40–70% probability" />
              <Kpi label="Low Risk"               value={low.toLocaleString()}         color="#00e5c3" sub="< 40% probability" />
              <Kpi label="Retention Opportunity"  value={opportunityScore.toFixed(3)}  color="#00e5c3" sub="Avg save score" />
            </div>

            {/* SEGMENT FILTER */}
            {segments.length > 0 && (
              <div className="cp-seg-bar">
                <span className="cp-seg-label">Filter Segment:</span>
                <button
                  className={`cp-seg-btn${!selectedSegment ? " active" : ""}`}
                  onClick={() => setSelectedSegment(null)}
                >All</button>
                {segments.map(s => (
                  <button
                    key={s}
                    className={`cp-seg-btn${selectedSegment === s ? " active" : ""}`}
                    onClick={() => setSelectedSegment(s)}
                  >{s}</button>
                ))}
              </div>
            )}

            {/* RISK TREND CHART */}
            <div className="cp-panel">
              <div className="cp-panel-header">
                <div className="cp-panel-title">Churn Risk Distribution</div>
                <div className="cp-panel-badge">{rows.length} customers</div>
              </div>
              <RiskChart rows={rows} />
            </div>

            {/* SEGMENT CHART */}
            <div className="cp-panel">
              <div className="cp-panel-header">
                <div className="cp-panel-title">Risk by Segment</div>
                <div className="cp-panel-badge">Click segment to filter table</div>
              </div>
              <SegmentRiskChart
                rows={rows}
                segmentKey="plan_type"
                onSelect={setSelectedSegment}
              />
            </div>

            {/* RISK TABLE */}
            <div className="cp-panel">
              <div className="cp-panel-header">
                <div className="cp-panel-title">Customer Risk Table</div>
                <div className="cp-panel-badge">
                  {filteredRows.length} {selectedSegment ? `· ${selectedSegment}` : "customers"}
                </div>
              </div>
              <RiskTable rows={filteredRows} />
            </div>
          </>
        )}

      </div>
    </>
  );
}
