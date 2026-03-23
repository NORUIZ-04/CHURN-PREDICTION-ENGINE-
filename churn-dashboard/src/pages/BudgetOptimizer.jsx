import { useMemo, useState } from "react";
import { api } from "../api";
import { useDatasetStore } from "../store/datasetStore";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Mono:wght@300;400;500&display=swap');

  .bo-root {
    font-family: 'DM Mono', monospace;
    color: #e2e8f4;
    animation: boFade 0.5s ease;
  }
  @keyframes boFade { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }

  /* HEADER */
  .bo-header {
    display: flex; align-items: flex-start; justify-content: space-between;
    margin-bottom: 32px; flex-wrap: wrap; gap: 14px;
  }
  .bo-title {
    font-family: 'Syne', sans-serif;
    font-size: 28px; font-weight: 800;
    letter-spacing: -1px; line-height: 1.1;
  }
  .bo-title span { color: #00e5c3; }
  .bo-subtitle { font-size: 12px; color: #4a5568; margin-top: 6px; }

  /* CONTROLS PANEL */
  .bo-controls {
    background: #0f1218;
    border: 1px solid #1e2530;
    border-radius: 12px;
    padding: 24px;
    margin-bottom: 24px;
    display: flex; align-items: flex-end; gap: 20px;
    flex-wrap: wrap;
  }
  .bo-control-group { display: flex; flex-direction: column; gap: 8px; }
  .bo-control-label {
    font-size: 10px; letter-spacing: 1.5px; text-transform: uppercase;
    color: #4a5568; font-weight: 500;
  }
  .bo-input {
    font-family: 'DM Mono', monospace;
    font-size: 13px; color: #e2e8f4;
    background: #161b24;
    border: 1px solid #1e2530;
    border-radius: 9px;
    padding: 10px 14px;
    outline: none; transition: all 0.2s;
    width: 160px;
  }
  .bo-input:focus { border-color: #00e5c3; background: rgba(0,229,195,0.04); box-shadow: 0 0 0 3px rgba(0,229,195,0.08); }

  /* Budget slider */
  .bo-budget-wrap { position: relative; }
  .bo-budget-display {
    font-family: 'Syne', sans-serif;
    font-size: 22px; font-weight: 800;
    color: #00e5c3; margin-bottom: 8px;
  }
  .bo-slider {
    -webkit-appearance: none; appearance: none;
    width: 220px; height: 4px;
    background: #1e2530; border-radius: 2px; outline: none; cursor: pointer;
  }
  .bo-slider::-webkit-slider-thumb {
    -webkit-appearance: none; appearance: none;
    width: 16px; height: 16px;
    border-radius: 50%;
    background: #00e5c3;
    cursor: pointer;
    box-shadow: 0 0 8px rgba(0,229,195,0.4);
    transition: box-shadow 0.2s;
  }
  .bo-slider::-webkit-slider-thumb:hover { box-shadow: 0 0 14px rgba(0,229,195,0.6); }

  .bo-select {
    font-family: 'DM Mono', monospace;
    font-size: 12px; color: #e2e8f4;
    background: #161b24;
    border: 1px solid #1e2530;
    border-radius: 9px;
    padding: 10px 14px;
    outline: none; cursor: pointer;
    transition: border-color 0.2s;
    width: 160px;
  }
  .bo-select:focus { border-color: #00e5c3; }

  .bo-btn-group { display: flex; gap: 10px; align-items: flex-end; margin-left: auto; }
  .bo-btn {
    font-family: 'Syne', sans-serif;
    font-size: 13px; font-weight: 700;
    padding: 11px 22px; border-radius: 9px;
    border: none; cursor: pointer;
    transition: all 0.2s; letter-spacing: -0.3px;
    display: flex; align-items: center; gap: 8px;
  }
  .bo-btn-primary { background: #00e5c3; color: #080b10; }
  .bo-btn-primary:hover:not(:disabled) {
    background: #00ffd5; transform: translateY(-1px);
    box-shadow: 0 8px 20px rgba(0,229,195,0.25);
  }
  .bo-btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
  .bo-btn-outline {
    background: transparent; color: #4a5568;
    border: 1px solid #1e2530;
  }
  .bo-btn-outline:hover:not(:disabled) {
    border-color: #2d3748; color: #e2e8f4;
  }
  .bo-btn-outline:disabled { opacity: 0.4; cursor: not-allowed; }
  .bo-spinner {
    width: 14px; height: 14px;
    border: 2px solid rgba(0,0,0,0.2); border-top-color: #080b10;
    border-radius: 50%; animation: spin 0.6s linear infinite;
  }
  @keyframes spin { to{transform:rotate(360deg)} }

  /* KPI GRID */
  .bo-kpi-grid {
    display: grid; grid-template-columns: repeat(3,1fr);
    gap: 14px; margin-bottom: 24px;
  }
  .bo-kpi {
    background: #0f1218; border: 1px solid #1e2530;
    border-radius: 12px; padding: 22px 20px;
    position: relative; overflow: hidden; transition: all 0.2s;
  }
  .bo-kpi:hover { border-color: rgba(0,229,195,0.2); transform: translateY(-2px); }
  .bo-kpi-bar { position: absolute; top: 0; left: 0; right: 0; height: 2px; }
  .bo-kpi-label {
    font-size: 10px; letter-spacing: 1.5px; text-transform: uppercase;
    color: #4a5568; margin-bottom: 10px;
  }
  .bo-kpi-value {
    font-family: 'Syne', sans-serif;
    font-size: 30px; font-weight: 800;
    letter-spacing: -1px; line-height: 1;
  }

  /* FILTERS ROW */
  .bo-filters {
    background: #0f1218; border: 1px solid #1e2530;
    border-radius: 12px; padding: 16px 22px;
    display: flex; align-items: center; gap: 24px;
    margin-bottom: 20px; flex-wrap: wrap;
  }
  .bo-filter-group { display: flex; align-items: center; gap: 10px; }
  .bo-filter-label { font-size: 11px; color: #4a5568; }

  /* TABLE PANEL */
  .bo-table-panel {
    background: #0f1218; border: 1px solid #1e2530;
    border-radius: 12px; overflow: hidden;
  }
  .bo-table-header {
    display: flex; align-items: center; justify-content: space-between;
    padding: 18px 22px; border-bottom: 1px solid #1e2530;
  }
  .bo-table-title {
    font-family: 'Syne', sans-serif;
    font-size: 15px; font-weight: 700; letter-spacing: -0.3px;
  }
  .bo-table-badge {
    font-size: 10px; color: #4a5568;
    padding: 4px 10px; background: #161b24;
    border: 1px solid #1e2530; border-radius: 20px;
  }
  .bo-table-wrap { overflow-x: auto; max-height: 480px; overflow-y: auto; }
  .bo-table-wrap::-webkit-scrollbar { width: 4px; height: 4px; }
  .bo-table-wrap::-webkit-scrollbar-track { background: transparent; }
  .bo-table-wrap::-webkit-scrollbar-thumb { background: #1e2530; border-radius: 2px; }

  .bo-table { width: 100%; border-collapse: collapse; font-size: 12px; }
  .bo-table thead th {
    font-size: 10px; letter-spacing: 1.2px; text-transform: uppercase;
    color: #4a5568; padding: 10px 16px;
    text-align: left; font-weight: 500;
    border-bottom: 1px solid #1e2530;
    background: #0f1218;
    position: sticky; top: 0; z-index: 1;
    white-space: nowrap;
  }
  .bo-table tbody tr {
    border-bottom: 1px solid rgba(255,255,255,0.03);
    transition: background 0.15s; cursor: pointer;
  }
  .bo-table tbody tr:hover { background: rgba(255,255,255,0.02); }
  .bo-table tbody tr:last-child { border-bottom: none; }
  .bo-table td { padding: 11px 16px; color: #e2e8f4; white-space: nowrap; }
  .bo-td-pos { color: #4a5568; font-size: 11px; }
  .bo-td-good { color: #00e5c3; font-weight: 600; }
  .bo-td-warn { color: #ffc107; font-weight: 600; }
  .bo-td-danger { color: #ff4d6d; font-weight: 600; }

  /* EMPTY */
  .bo-empty {
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    min-height: 55vh; text-align: center; gap: 14px;
  }
  .bo-empty-icon {
    width: 72px; height: 72px;
    background: #0f1218; border: 1px solid #1e2530;
    border-radius: 18px;
    display: flex; align-items: center; justify-content: center;
    font-size: 32px; margin-bottom: 8px;
  }
  .bo-empty-title {
    font-family: 'Syne', sans-serif;
    font-size: 20px; font-weight: 800; color: #e2e8f4;
  }
  .bo-empty-sub { font-size: 12px; color: #4a5568; line-height: 1.9; max-width: 340px; }

  /* LOADING */
  .bo-loading-bar {
    height: 2px; background: #1e2530; border-radius: 1px; overflow: hidden;
    margin-bottom: 24px;
  }
  .bo-loading-fill {
    height: 100%; width: 40%;
    background: linear-gradient(90deg, #00e5c3, #7c6aff);
    border-radius: 1px;
    animation: loadSlide 1.2s ease-in-out infinite;
  }
  @keyframes loadSlide {
    0%{transform:translateX(-100%)} 100%{transform:translateX(350%)}
  }
`;

function colorForRoi(roi) {
  if (roi >= 2)   return "bo-td-good";
  if (roi >= 1)   return "bo-td-warn";
  return "bo-td-danger";
}

export default function BudgetOptimizer() {
  const datasetPath = useDatasetStore(s => s.datasetPath);
  const [budget, setBudget] = useState(5000);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [minRoi, setMinRoi] = useState(0);
  const [sortKey, setSortKey] = useState("roi");

  async function run() {
    if (!datasetPath) return;
    setLoading(true);
    try {
      const res = await api.get(`/decision/plan/${datasetPath}?budget=${budget}`);
      setRows(res.data);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  }

  const filtered = useMemo(() => rows.filter(r => (r.roi ?? 0) >= minRoi), [rows, minRoi]);
  const sorted   = useMemo(() => [...filtered].sort((a,b) => (b[sortKey]??0)-(a[sortKey]??0)), [filtered, sortKey]);
  const totalGain  = useMemo(() => sorted.reduce((s, r) => s + (r.expected_profit ?? 0), 0), [sorted]);
  const avgUplift  = useMemo(() => sorted.length ? sorted.reduce((s,r)=>s+(r.uplift??0),0)/sorted.length : 0, [sorted]);
  console.log(totalGain)
  function exportCSV() {
    if (!sorted.length) return;
    const cols = Object.keys(sorted[0]);
    const lines = [cols.join(","), ...sorted.map(r => cols.map(c => JSON.stringify(r[c]??"")))];
    const blob = new Blob([lines.join("\n")], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob); a.download = "budget_plan.csv"; a.click();
  }
function formatValue(key, value) {
  if (key === "drivers" && Array.isArray(value)) {
    return value
    .map(d => `${d.feature}: ${d.impact?.toFixed(2)}`)
  .join(" | ");
  }

  if (typeof value === "object" && value !== null) {
    return JSON.stringify(value);
  }

  return value;
}

  const cols = sorted.length ? Object.keys(sorted[0]) : [];

  return (
    <>
      <style>{styles}</style>
      <div className="bo-root">

        {/* HEADER */}
        <div className="bo-header">
          <div>
            <div className="bo-title">Budget <span>Optimizer</span></div>
            <div className="bo-subtitle">Knapsack-based retention spend allocation · Phase-2 optimization</div>
          </div>
        </div>

        {/* CONTROLS */}
        <div className="bo-controls">
          {/* Budget slider */}
          <div className="bo-control-group">
            <div className="bo-control-label">Total Budget</div>
            <div className="bo-budget-display">₹{budget.toLocaleString()}</div>
            <input
              type="range" className="bo-slider"
              min={1000} max={100000} step={500}
              value={budget}
              onChange={e => setBudget(Number(e.target.value))}
            />
          </div>

          {/* Min ROI */}
          <div className="bo-control-group">
            <div className="bo-control-label">Min ROI Filter</div>
            <input
              type="number" className="bo-input"
              value={minRoi} placeholder="0"
              onChange={e => setMinRoi(Number(e.target.value))}
            />
          </div>

          {/* Sort by */}
          <div className="bo-control-group">
            <div className="bo-control-label">Sort By</div>
            <select className="bo-select" value={sortKey} onChange={e => setSortKey(e.target.value)}>
              <option value="roi">ROI</option>
              <option value="uplift">Uplift</option>
              <option value="expected_gain">Expected Gain</option>
            </select>
          </div>

          {/* Action buttons */}
          <div className="bo-btn-group">
            <button className="bo-btn bo-btn-outline" onClick={exportCSV} disabled={!sorted.length}>
              ↓ Export CSV
            </button>
            <button className="bo-btn bo-btn-primary" onClick={run} disabled={loading || !datasetPath}>
              {loading
                ? <><div className="bo-spinner" /> Optimizing...</>
                : <>⚡ Run Optimizer</>
              }
            </button>
          </div>
        </div>

        {/* LOADING BAR */}
        {loading && (
          <div className="bo-loading-bar">
            <div className="bo-loading-fill" />
          </div>
        )}

        {/* EMPTY STATE */}
        {!loading && rows.length === 0 && (
          <div className="bo-empty">
            <div className="bo-empty-icon">◈</div>
            <div className="bo-empty-title">
              {!datasetPath ? "No Dataset Loaded" : "Ready to Optimize"}
            </div>
            <div className="bo-empty-sub">
              {!datasetPath
                ? "Upload a dataset in Data Source first, then set your budget and run the optimizer."
                : `Set your budget to ₹${budget.toLocaleString()} and click Run Optimizer to allocate retention spend across customers.`
              }
            </div>
          </div>
        )}

        {/* RESULTS */}
        {sorted.length > 0 && (
          <>
            {/* KPIs */}
            <div className="bo-kpi-grid">
              <div className="bo-kpi">
                <div className="bo-kpi-bar" style={{ background: "#7c6aff", opacity: 0.6 }} />
                <div className="bo-kpi-label">Customers Selected</div>
                <div className="bo-kpi-value" style={{ color: "#7c6aff" }}>{sorted.length.toLocaleString()}</div>
              </div>
              <div className="bo-kpi">
                <div className="bo-kpi-bar" style={{ background: "#00e5c3", opacity: 0.6 }} />
                <div className="bo-kpi-label">Total Expected Gain</div>
                <div className="bo-kpi-value" style={{ color: "#00e5c3" }}>₹{totalGain.toFixed(2)}</div>
              </div>
              <div className="bo-kpi">
                <div className="bo-kpi-bar" style={{ background: "#ffc107", opacity: 0.6 }} />
                <div className="bo-kpi-label">Avg Uplift Score</div>
                <div className="bo-kpi-value" style={{ color: "#ffc107" }}>{avgUplift.toFixed(4)}</div>
              </div>
            </div>

            {/* FILTERS ROW */}
            <div className="bo-filters">
              <div className="bo-filter-group">
                <span className="bo-filter-label">Showing</span>
                <span style={{ color: "#00e5c3", fontWeight: 600, fontSize: 13 }}>{sorted.length}</span>
                <span className="bo-filter-label">of {rows.length} customers · ROI ≥ {minRoi}</span>
              </div>
              <div style={{ marginLeft: "auto", fontSize: 11, color: "#2d3748" }}>
                Budget: ₹{budget.toLocaleString()} · Sorted by: {sortKey}
              </div>
            </div>

            {/* TABLE */}
            <div className="bo-table-panel">
              <div className="bo-table-header">
                <div className="bo-table-title">Allocation Plan</div>
                <div className="bo-table-badge">{sorted.length} customers</div>
              </div>
              <div className="bo-table-wrap">
                <table className="bo-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      {cols.map(col => <th key={col}>{col.replace(/_/g, " ")}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {sorted.map((row, i) => (
                      <tr key={i}>
                        <td className="bo-td-pos">{String(i+1).padStart(2,"0")}</td>
                        {cols.map((c, j) => {
                          const v = row[c];
                          const isNum = typeof v === "number";
                          let cls = "";
                          if (c === "roi") cls = colorForRoi(v);
                          else if (c === "expected_gain" || c === "uplift") cls = "bo-td-good";
                          return (
                            <td key={j} className={cls}>
                              {isNum ? v.toFixed(3) : formatValue(c, v)}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

      </div>
    </>
  );
}