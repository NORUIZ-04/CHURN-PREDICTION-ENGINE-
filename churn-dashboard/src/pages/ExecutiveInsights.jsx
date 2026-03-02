import { useEffect, useState } from "react";
import { useDatasetStore } from "../store/datasetStore";
import { datasetApi } from "../api/datasetApi";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Mono:wght@300;400;500&display=swap');

  .ei-root {
    font-family: 'DM Mono', monospace;
    color: #e2e8f4;
    animation: eiFade 0.5s ease;
  }
  @keyframes eiFade { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }

  /* HEADER */
  .ei-header {
    background: linear-gradient(135deg, rgba(0,229,195,0.06) 0%, rgba(124,106,255,0.06) 100%);
    border: 1px solid rgba(0,229,195,0.15);
    border-radius: 16px;
    padding: 32px 36px;
    margin-bottom: 28px;
    position: relative; overflow: hidden;
  }
  .ei-header::before {
    content: '';
    position: absolute; top: -60px; right: -60px;
    width: 200px; height: 200px;
    background: radial-gradient(circle, rgba(0,229,195,0.08), transparent 70%);
    pointer-events: none;
  }
  .ei-header-label {
    font-size: 10px; letter-spacing: 2.5px; text-transform: uppercase;
    color: #00e5c3; margin-bottom: 12px;
    display: flex; align-items: center; gap: 8px;
  }
  .ei-header-label::before { content:''; display:block; width:20px; height:1px; background:#00e5c3; }
  .ei-header-title {
    font-family: 'Syne', sans-serif;
    font-size: 30px; font-weight: 800;
    letter-spacing: -1px; line-height: 1.1;
    margin-bottom: 16px;
  }
  .ei-header-title span { color: #00e5c3; }
  .ei-header-summary {
    font-size: 13px; line-height: 1.9;
    color: #6b7a95; max-width: 780px;
  }
  .ei-header-meta {
    display: flex; align-items: center; gap: 16px;
    margin-top: 20px;
  }
  .ei-meta-pill {
    font-size: 11px; color: #4a5568;
    padding: 5px 12px;
    background: rgba(255,255,255,0.03);
    border: 1px solid #1e2530; border-radius: 20px;
    display: flex; align-items: center; gap: 6px;
  }
  .ei-meta-dot { width:6px;height:6px;border-radius:50%; }

  /* KPI STRIP */
  .ei-kpi-grid {
    display: grid; grid-template-columns: repeat(3,1fr);
    gap: 16px; margin-bottom: 28px;
  }
  .ei-kpi {
    background: #0f1218; border: 1px solid #1e2530;
    border-radius: 14px; padding: 24px 22px;
    position: relative; overflow: hidden; transition: all 0.2s;
  }
  .ei-kpi:hover { border-color: rgba(0,229,195,0.2); transform: translateY(-2px); }
  .ei-kpi-glow {
    position: absolute; top: -30px; right: -30px;
    width: 100px; height: 100px; border-radius: 50%;
    pointer-events: none;
    filter: blur(30px); opacity: 0.3;
  }
  .ei-kpi-top { position: absolute; top:0;left:0;right:0; height:2px; }
  .ei-kpi-label { font-size:10px;letter-spacing:1.5px;text-transform:uppercase;color:#4a5568;margin-bottom:10px; }
  .ei-kpi-value {
    font-family: 'Syne', sans-serif;
    font-size: 32px; font-weight: 800;
    letter-spacing: -1px; line-height:1;
  }
  .ei-kpi-sub { font-size:11px;color:#2d3748;margin-top:8px; }

  /* ALERT STRIP */
  .ei-alert {
    background: rgba(255,193,7,0.05);
    border: 1px solid rgba(255,193,7,0.2);
    border-radius: 12px;
    padding: 18px 22px;
    display: flex; gap: 14px;
    margin-bottom: 28px; align-items: flex-start;
  }
  .ei-alert-icon {
    width: 32px; height: 32px; border-radius: 8px;
    background: rgba(255,193,7,0.12);
    display: flex; align-items: center; justify-content: center;
    font-size: 15px; flex-shrink: 0;
    color: #ffc107;
  }
  .ei-alert-content { flex:1; }
  .ei-alert-title { font-family:'Syne',sans-serif; font-size:13px;font-weight:700;color:#ffc107;margin-bottom:8px; }
  .ei-alert-item { font-size:12px;color:#a0856b;line-height:1.8; }

  /* GRID */
  .ei-grid { display:grid; grid-template-columns:1fr 1fr; gap:20px; margin-bottom:24px; }

  /* PANEL */
  .ei-panel {
    background: #0f1218; border: 1px solid #1e2530;
    border-radius: 12px; padding: 24px;
    transition: border-color 0.2s;
  }
  .ei-panel:hover { border-color: rgba(0,229,195,0.1); }
  .ei-panel-title {
    font-family: 'Syne', sans-serif;
    font-size: 14px; font-weight: 700; letter-spacing: -0.3px;
    margin-bottom: 20px;
    display: flex; align-items: center; gap: 8px;
  }
  .ei-panel-icon {
    width: 26px; height: 26px; border-radius: 6px;
    display: flex; align-items: center; justify-content: center;
    font-size: 12px; flex-shrink: 0;
  }

  /* DRIVERS */
  .ei-driver { margin-bottom: 16px; }
  .ei-driver-row {
    display: flex; justify-content: space-between; align-items: center;
    margin-bottom: 6px; font-size: 12px;
  }
  .ei-driver-name { color: #e2e8f4; }
  .ei-driver-val { color: #ff4d6d; font-weight: 600; font-size: 11px; }
  .ei-driver-track { height: 5px; background: #1e2530; border-radius: 3px; overflow: hidden; }
  .ei-driver-fill { height: 100%; border-radius: 3px; background: linear-gradient(90deg, #ff4d6d, #ff8c42); }

  /* BUDGET */
  .ei-budget-stat {
    display: flex; justify-content: space-between; align-items: center;
    padding: 14px 0; border-bottom: 1px solid #1e2530;
  }
  .ei-budget-stat:last-child { border-bottom: none; }
  .ei-budget-stat-label { font-size: 12px; color: #4a5568; }
  .ei-budget-stat-val { font-family:'Syne',sans-serif; font-size:18px;font-weight:800; }

  /* OPPORTUNITIES */
  .ei-opp-big {
    font-family: 'Syne', sans-serif;
    font-size: 64px; font-weight: 800;
    color: #00e5c3; line-height: 1;
    margin-bottom: 8px;
  }
  .ei-opp-sub { font-size: 12px; color: #4a5568; }
  .ei-opp-bar {
    margin-top: 20px; height: 6px; background: #1e2530;
    border-radius: 3px; overflow: hidden;
  }
  .ei-opp-fill { height:100%; border-radius:3px; background: linear-gradient(90deg,#00e5c3,#7c6aff); }

  /* SEGMENTS */
  .ei-seg-item {
    display: flex; align-items: center; justify-content: space-between;
    padding: 12px 0; border-bottom: 1px solid #1e2530;
  }
  .ei-seg-item:last-child { border-bottom: none; }
  .ei-seg-name { font-size: 13px; font-weight: 500; color: #e2e8f4; }
  .ei-seg-meta { font-size: 11px; color: #4a5568; margin-top: 3px; }
  .ei-seg-badge {
    font-size: 10px; padding: 4px 10px; border-radius: 20px;
    background: rgba(255,77,109,0.1); color: #ff4d6d;
    border: 1px solid rgba(255,77,109,0.2);
  }

  /* RECOMMENDATIONS */
  .ei-recs {
    background: rgba(0,229,195,0.04);
    border: 1px solid rgba(0,229,195,0.15);
    border-radius: 14px; padding: 28px;
    margin-top: 4px;
  }
  .ei-recs-title {
    font-family: 'Syne', sans-serif;
    font-size: 16px; font-weight: 800;
    color: #00e5c3; margin-bottom: 20px;
    display: flex; align-items: center; gap: 10px;
  }
  .ei-rec-item {
    display: flex; align-items: flex-start; gap: 12px;
    padding: 14px 0; border-bottom: 1px solid rgba(0,229,195,0.08);
    font-size: 13px; line-height: 1.7; color: #e2e8f4;
  }
  .ei-rec-item:last-child { border-bottom: none; }
  .ei-rec-num {
    font-family: 'Syne', sans-serif;
    font-size: 11px; font-weight: 800;
    color: #00e5c3; width: 22px; flex-shrink: 0;
    margin-top: 2px;
  }

  /* EMPTY */
  .ei-empty {
    display:flex;flex-direction:column;align-items:center;justify-content:center;
    min-height:60vh;text-align:center;gap:14px;
  }
  .ei-empty-icon {
    width:72px;height:72px;background:#0f1218;border:1px solid #1e2530;
    border-radius:18px;display:flex;align-items:center;justify-content:center;
    font-size:32px;margin-bottom:8px;
  }
  .ei-empty-title { font-family:'Syne',sans-serif;font-size:20px;font-weight:800;color:#e2e8f4; }
  .ei-empty-sub { font-size:12px;color:#4a5568;line-height:1.9;max-width:340px; }

  .ei-loading-bar { height:2px;background:#1e2530;border-radius:1px;overflow:hidden;margin-bottom:24px; }
  .ei-loading-fill {
    height:100%;width:40%;
    background:linear-gradient(90deg,#00e5c3,#7c6aff);
    animation:loadSlide 1.2s ease-in-out infinite;
  }
  @keyframes loadSlide{0%{transform:translateX(-100%)}100%{transform:translateX(350%)}}
`;

export default function ExecutiveInsights() {
  const { datasetPath } = useDatasetStore();
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!datasetPath) return;
    setLoading(true);
    datasetApi.executiveInsights(datasetPath)
      .then(res => { setInsights(res.data); setLoading(false); })
      .catch(err => { console.error(err); setLoading(false); });
  }, [datasetPath]);

  if (!datasetPath) return (
    <><style>{styles}</style>
    <div className="ei-empty">
      <div className="ei-empty-icon">📊</div>
      <div className="ei-empty-title">No Dataset Loaded</div>
      <div className="ei-empty-sub">Upload a dataset in <strong style={{color:"#00e5c3"}}>Data Source</strong> to generate executive intelligence reports.</div>
    </div></>
  );

  if (loading) return (
    <><style>{styles}</style>
    <div className="ei-empty">
      <div className="ei-loading-bar" style={{width:"320px"}}><div className="ei-loading-fill"/></div>
      <div className="ei-empty-title">Generating Insights...</div>
      <div className="ei-empty-sub">AI is analyzing your dataset and preparing executive-level intelligence.</div>
    </div></>
  );

  if (!insights) return (
    <><style>{styles}</style>
    <div className="ei-empty">
      <div className="ei-empty-icon">⚠</div>
      <div className="ei-empty-title">Failed to Load Insights</div>
      <div className="ei-empty-sub">Check your backend connection and try refreshing the page.</div>
    </div></>
  );

  const rev = insights.revenue_impact || {};
  const kpis = [
    { label:"Revenue at Risk",    value:`₹${rev.revenue_at_risk?.toLocaleString() ?? 0}`,      color:"#ff4d6d" },
    { label:"Recoverable Revenue",value:`₹${rev.recoverable_revenue?.toLocaleString() ?? 0}`,  color:"#00e5c3" },
    { label:"Profit Saved",       value:`₹${rev.expected_profit_saved?.toLocaleString() ?? 0}`,color:"#7c6aff" },
  ];

  const alerts = [...(insights.emerging_patterns||[]), ...(insights.segment_alerts||[]).map(s=>`${s.segment} segment requires immediate attention`)];

  return (
    <><style>{styles}</style>
    <div className="ei-root">

      {/* HEADER */}
      <div className="ei-header">
        <div className="ei-header-label">AI-Powered · Executive Intelligence</div>
        <div className="ei-header-title">Retention <span>Intelligence</span> Report</div>
        <div className="ei-header-summary">{insights.executive_summary}</div>
        <div className="ei-header-meta">
          <div className="ei-meta-pill"><div className="ei-meta-dot" style={{background:"#00e5c3"}}/> Live Analysis</div>
          <div className="ei-meta-pill"><div className="ei-meta-dot" style={{background:"#7c6aff"}}/> Model v3.2</div>
          <div className="ei-meta-pill">Generated: {new Date().toLocaleDateString()}</div>
        </div>
      </div>

      {/* KPIS */}
      <div className="ei-kpi-grid">
        {kpis.map((k,i) => (
          <div className="ei-kpi" key={i}>
            <div className="ei-kpi-glow" style={{background:k.color}}/>
            <div className="ei-kpi-top" style={{background:k.color, opacity:0.7}}/>
            <div className="ei-kpi-label">{k.label}</div>
            <div className="ei-kpi-value" style={{color:k.color}}>{k.value}</div>
            <div className="ei-kpi-sub">Based on current dataset</div>
          </div>
        ))}
      </div>

      {/* ALERTS */}
      {alerts.length > 0 && (
        <div className="ei-alert">
          <div className="ei-alert-icon">⚠</div>
          <div className="ei-alert-content">
            <div className="ei-alert-title">Emerging Signals — Immediate Attention Required</div>
            {alerts.map((a,i) => <div className="ei-alert-item" key={i}>· {a}</div>)}
          </div>
        </div>
      )}

      {/* MAIN GRID */}
      <div className="ei-grid">

        {/* CHURN DRIVERS */}
        <div className="ei-panel">
          <div className="ei-panel-title">
            <div className="ei-panel-icon" style={{background:"rgba(255,77,109,0.1)",color:"#ff4d6d"}}>◈</div>
            Top Churn Drivers
          </div>
          {(insights.risk_drivers||[]).map((d,i) => (
            <div className="ei-driver" key={i}>
              <div className="ei-driver-row">
                <span className="ei-driver-name">{d.factor}</span>
                <span className="ei-driver-val">{Number(d.impact_strength).toFixed(2)}</span>
              </div>
              <div className="ei-driver-track">
                <div className="ei-driver-fill" style={{width:`${d.impact_strength*100}%`}}/>
              </div>
            </div>
          ))}
        </div>

        {/* BUDGET EFFICIENCY */}
        <div className="ei-panel">
          <div className="ei-panel-title">
            <div className="ei-panel-icon" style={{background:"rgba(0,229,195,0.1)",color:"#00e5c3"}}>◉</div>
            Budget Efficiency
          </div>
          {insights.budget_efficiency && (
            <>
              <div className="ei-budget-stat">
                <span className="ei-budget-stat-label">Total Spend</span>
                <span className="ei-budget-stat-val" style={{color:"#00e5c3"}}>₹{insights.budget_efficiency.total_spend?.toLocaleString()}</span>
              </div>
              <div className="ei-budget-stat">
                <span className="ei-budget-stat-label">ROI per ₹1</span>
                <span className="ei-budget-stat-val" style={{color:"#ffc107"}}>{insights.budget_efficiency.roi_per_dollar}</span>
              </div>
              <div className="ei-budget-stat">
                <span className="ei-budget-stat-label">Efficiency Rating</span>
                <span className="ei-budget-stat-val" style={{color:"#7c6aff"}}>
                  {insights.budget_efficiency.roi_per_dollar >= 2 ? "Excellent" : insights.budget_efficiency.roi_per_dollar >= 1 ? "Good" : "Needs Review"}
                </span>
              </div>
            </>
          )}
        </div>

        {/* OPPORTUNITIES */}
        <div className="ei-panel">
          <div className="ei-panel-title">
            <div className="ei-panel-icon" style={{background:"rgba(0,229,195,0.1)",color:"#00e5c3"}}>⊹</div>
            Retention Opportunities
          </div>
          <div className="ei-opp-big">{insights.opportunities?.high_opportunity_customers ?? 0}</div>
          <div className="ei-opp-sub">High-impact customers ready for retention action</div>
          <div className="ei-opp-bar">
            <div className="ei-opp-fill" style={{width:`${Math.min(100, (insights.opportunities?.high_opportunity_customers/100)*10)}%`}}/>
          </div>
        </div>

        {/* SEGMENT RISK */}
        <div className="ei-panel">
          <div className="ei-panel-title">
            <div className="ei-panel-icon" style={{background:"rgba(255,193,7,0.1)",color:"#ffc107"}}>◫</div>
            Segment Risk
          </div>
          {(insights.segment_alerts||[]).map((s,i) => (
            <div className="ei-seg-item" key={i}>
              <div>
                <div className="ei-seg-name">{s.segment}</div>
                <div className="ei-seg-meta">{s.customers} customers · ₹{s.avg_monthly_value} avg</div>
              </div>
              <div className="ei-seg-badge">At Risk</div>
            </div>
          ))}
        </div>
      </div>

      {/* RECOMMENDATIONS */}
      <div className="ei-recs">
        <div className="ei-recs-title">✦ Strategic Recommendations</div>
        {(insights.strategic_recommendations||[]).map((r,i) => (
          <div className="ei-rec-item" key={i}>
            <div className="ei-rec-num">{String(i+1).padStart(2,"0")}</div>
            <div>{r}</div>
          </div>
        ))}
      </div>

    </div></>
  );
}
