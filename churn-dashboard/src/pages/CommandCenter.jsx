import { useEffect, useState } from "react";
import { useDatasetStore } from "../store/datasetStore";
import { datasetApi } from "../api/datasetApi";
import {
  ResponsiveContainer, AreaChart, Area,
  XAxis, YAxis, Tooltip, CartesianGrid,
} from "recharts";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Mono:wght@300;400;500&display=swap');

  .cc-root {
    font-family: 'DM Mono', monospace;
    color: #e2e8f4;
    animation: ccFadeIn 0.5s ease;
  }
  @keyframes ccFadeIn { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }

  /* HEADER */
  .cc-header {
    display: flex; align-items: flex-start; justify-content: space-between;
    margin-bottom: 32px; flex-wrap: wrap; gap: 12px;
  }
  .cc-title { font-family:'Syne',sans-serif; font-size:28px; font-weight:800; letter-spacing:-1px; line-height:1.1; }
  .cc-title span { color: #00e5c3; }
  .cc-subtitle { font-size:12px; color:#4a5568; margin-top:6px; }
  .cc-live-badge {
    display:flex; align-items:center; gap:7px;
    font-size:11px; color:#00e5c3;
    padding:7px 14px;
    background:rgba(0,229,195,0.06);
    border:1px solid rgba(0,229,195,0.18);
    border-radius:20px; flex-shrink:0;
  }
  .cc-pulse { width:7px; height:7px; background:#00e5c3; border-radius:50%; animation:ccPulse 2s infinite; }
  @keyframes ccPulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.3;transform:scale(0.7)} }

  /* KPI ROWS
     Row 1 = 3 columns (customers, churn %, urgent) — short values
     Row 2 = 2 columns (revenue at risk, recoverable) — wider = room for ₹2,420,388
  */
  .cc-kpi-row1 { display:grid; grid-template-columns:repeat(3,1fr); gap:14px; margin-bottom:14px; }
  .cc-kpi-row2 { display:grid; grid-template-columns:repeat(2,1fr); gap:14px; margin-bottom:24px; }

  /* KPI CARD
     KEY: NO overflow:hidden on the card itself — that was clipping values.
     The accent bar is a real first child div, not a pseudo-element.
  */
  .cc-kpi {
    background:#0f1218;
    border:1px solid #1e2530;
    border-radius:12px;
    display:flex; flex-direction:column;
    transition:border-color 0.2s, transform 0.2s;
  }
  .cc-kpi:hover { border-color:rgba(0,229,195,0.22); transform:translateY(-2px); }

  .cc-kpi-accent { height:3px; border-radius:12px 12px 0 0; }

  .cc-kpi-body { padding:18px 22px 20px; display:flex; flex-direction:column; }

  .cc-kpi-label {
    font-size:10px; letter-spacing:1.8px; text-transform:uppercase;
    color:#4a5568; margin-bottom:12px; font-weight:500;
  }

  /* THE CORE FIX:
     - NO white-space:nowrap  → values can break if truly necessary
     - NO overflow:hidden     → nothing gets clipped
     - NO text-overflow:ellipsis → no more "48...."
     - Font size is applied via inline style per-card based on value length
  */
  .cc-kpi-value {
    font-family:'Syne',sans-serif;
    font-weight:800;
    letter-spacing:-1.5px;
    line-height:1;
    word-break:break-word;
    /* font-size set by inline style — see KpiCard component */
  }

  .cc-kpi-exact {
    font-family:'DM Mono',monospace;
    font-size:11px; color:#374151;
    margin-top:8px; letter-spacing:0;
  }
  .cc-kpi-context { font-size:10px; color:#2d3748; margin-top:4px; }

  /* URGENCY */
  .cc-urgency { background:#0f1218; border:1px solid #1e2530; border-radius:12px; padding:24px; margin-bottom:24px; }
  .cc-panel-title { font-family:'Syne',sans-serif; font-size:15px; font-weight:700; letter-spacing:-0.3px; margin-bottom:20px; }
  .cc-urgency-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:14px; }
  .cc-urgency-card {
    background:#161b24; border:1px solid #1e2530;
    border-radius:10px; padding:20px 18px; text-align:center; transition:all 0.2s;
  }
  .cc-urgency-card:hover { transform:translateY(-2px); }
  .cc-urgency-dot { width:10px; height:10px; border-radius:50%; margin:0 auto 10px; }
  .cc-urgency-label { font-size:10px; color:#4a5568; letter-spacing:1.2px; text-transform:uppercase; margin-bottom:10px; }
  .cc-urgency-val { font-family:'Syne',sans-serif; font-size:30px; font-weight:800; line-height:1; }

  /* TWO-COL */
  .cc-two-col { display:grid; grid-template-columns:1fr 340px; gap:20px; margin-bottom:24px; }

  /* PANEL */
  .cc-panel { background:#0f1218; border:1px solid #1e2530; border-radius:12px; padding:24px; }
  .cc-panel-header { display:flex; align-items:center; justify-content:space-between; margin-bottom:20px; }
  .cc-panel-badge { font-size:10px; color:#4a5568; padding:4px 10px; background:#161b24; border:1px solid #1e2530; border-radius:20px; }

  /* TOOLTIP */
  .cc-tooltip { background:#161b24; border:1px solid #2d3748; border-radius:8px; padding:10px 14px; font-family:'DM Mono',monospace; font-size:12px; }
  .cc-tooltip-label { color:#4a5568; font-size:10px; margin-bottom:4px; }
  .cc-tooltip-val { color:#ff4d6d; font-weight:500; font-size:15px; }

  /* SIGNALS */
  .cc-signal-list { display:flex; flex-direction:column; gap:10px; }
  .cc-signal-item {
    display:flex; align-items:flex-start; gap:10px;
    padding:12px 14px;
    background:rgba(255,77,109,0.05); border:1px solid rgba(255,77,109,0.12);
    border-radius:8px; font-size:12px; line-height:1.7; color:#e2e8f4;
  }
  .cc-signal-icon {
    width:20px; height:20px;
    background:rgba(255,77,109,0.15); border-radius:50%;
    display:flex; align-items:center; justify-content:center;
    font-size:11px; font-weight:700; flex-shrink:0; margin-top:1px; color:#ff4d6d;
  }

  /* TABLE */
  .cc-table-wrap { overflow-x:auto; }
  .cc-table { width:100%; border-collapse:collapse; }
  .cc-table thead th {
    font-size:10px; letter-spacing:1.5px; text-transform:uppercase;
    color:#4a5568; padding:0 16px 14px; text-align:left; font-weight:500;
    border-bottom:1px solid #1e2530;
  }
  .cc-table tbody tr { border-bottom:1px solid rgba(255,255,255,0.03); transition:background 0.15s; cursor:pointer; }
  .cc-table tbody tr:hover { background:rgba(255,255,255,0.02); }
  .cc-table tbody tr:last-child { border-bottom:none; }
  .cc-table td { padding:13px 16px; font-size:12px; color:#e2e8f4; }
  .risk-pill { display:inline-flex; align-items:center; gap:5px; padding:4px 10px; border-radius:20px; font-size:11px; }
  .risk-dot { width:5px; height:5px; border-radius:50%; background:currentColor; }
  .opp-val { font-family:'Syne',sans-serif; font-weight:700; color:#00e5c3; }

  /* EMPTY */
  .cc-empty { display:flex; flex-direction:column; align-items:center; justify-content:center; min-height:60vh; text-align:center; gap:14px; }
  .cc-empty-icon { width:68px; height:68px; border-radius:16px; background:#0f1218; border:1px solid #1e2530; display:flex; align-items:center; justify-content:center; font-size:28px; margin-bottom:8px; }
  .cc-empty-title { font-family:'Syne',sans-serif; font-size:18px; font-weight:700; color:#e2e8f4; }
  .cc-empty-sub { font-size:12px; color:#4a5568; line-height:1.8; max-width:320px; }
  .cc-loading-bar { height:2px; background:#1e2530; border-radius:1px; overflow:hidden; width:280px; }
  .cc-loading-fill { height:100%; width:40%; background:linear-gradient(90deg,#00e5c3,#7c6aff); animation:ccSlide 1.2s ease-in-out infinite; }
  @keyframes ccSlide{0%{transform:translateX(-100%)}100%{transform:translateX(350%)}}
`;

/* ─── HELPERS ──────────────────────────────── */

// Smart abbreviation: always produces a short string (max ~8 chars)
function fmtAbbr(val, prefix = "") {
  const n = Number(val);
  if (!isFinite(n)) return "—";
  if (n >= 1_000_000_000) return `${prefix}${(n / 1_000_000_000).toFixed(2)}B`;
  if (n >= 1_000_000)     return `${prefix}${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000)         return `${prefix}${(n / 1_000).toFixed(1)}K`;
  return `${prefix}${n.toLocaleString()}`;
}

// Full exact value for the sub-label — NEVER truncated, shown small
function fmtExact(val, prefix = "") {
  const n = Number(val);
  if (!isFinite(n)) return "";
  return `${prefix}${n.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
}

// Dynamic font size — scales DOWN for longer strings so they ALWAYS fit
// Syne 800 is wide, so we're conservative
function valueFontSize(str) {
  const len = String(str).length;
  if (len <= 4)  return "40px";  // "5.0K", "379", "1.3K"
  if (len <= 6)  return "34px";  // "48.4%", "₹2.4M"
  if (len <= 8)  return "28px";  // "₹675.9K"
  if (len <= 10) return "22px";  // long edge case
  return "18px";
}

const riskColor = (r) => {
  if (r >= 0.75) return { bg: "rgba(255,77,109,0.1)", color: "#ff4d6d" };
  if (r >= 0.5)  return { bg: "rgba(255,193,7,0.1)",  color: "#ffc107" };
  return                 { bg: "rgba(0,229,195,0.1)",  color: "#00e5c3" };
};

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="cc-tooltip">
      <div className="cc-tooltip-label">Churn Score</div>
      <div className="cc-tooltip-val">{(payload[0].value * 100).toFixed(1)}%</div>
    </div>
  );
};

/* ─── KPI CARD ─────────────────────────────── */
function KpiCard({ label, abbr, exact, context, color }) {
  const fs = valueFontSize(abbr);
  // Only show exact sub-label if it's meaningfully different from abbr
  const showExact = exact && exact !== abbr && exact.length > 0;

  return (
    <div className="cc-kpi">
      {/* Accent bar — NOT using overflow:hidden on parent, so this is a real child */}
      <div className="cc-kpi-accent" style={{ background: color }} />
      <div className="cc-kpi-body">
        <div className="cc-kpi-label">{label}</div>
        <div
          className="cc-kpi-value"
          style={{ color, fontSize: fs }}
        >
          {abbr}
        </div>
        {showExact && (
          <div className="cc-kpi-exact">{exact}</div>
        )}
        {context && (
          <div className="cc-kpi-context">{context}</div>
        )}
      </div>
    </div>
  );
}

/* ─── MAIN ─────────────────────────────────── */
const CommandCenter = () => {
  const { datasetPath } = useDatasetStore();
  const [data, setData] = useState(null);

  useEffect(() => {
    if (!datasetPath) return;
    datasetApi.getCommandCenter(datasetPath)
      .then(res => setData(res.data))
      .catch(err => console.error(err));
  }, [datasetPath]);

  if (!datasetPath) return (
    <><style>{styles}</style>
    <div className="cc-empty">
      <div className="cc-empty-icon">📂</div>
      <div className="cc-empty-title">No Dataset Loaded</div>
      <div className="cc-empty-sub">
        Go to <strong style={{ color: "#00e5c3" }}>Data Source</strong> and upload a customer CSV file to activate the Command Center.
      </div>
    </div></>
  );

  if (!data) return (
    <><style>{styles}</style>
    <div className="cc-empty">
      <div className="cc-loading-bar"><div className="cc-loading-fill" /></div>
      <div className="cc-empty-title" style={{ marginTop: 12 }}>Loading Intelligence...</div>
      <div className="cc-empty-sub">Fetching predictions and signals from your dataset.</div>
    </div></>
  );

  const churnTrend = data.churn_trend.map((v, i) => ({ i, v }));

  // Pre-compute all display strings
  const churnPct   = `${(data.churn_rate * 100).toFixed(1)}%`;

  const custAbbr   = fmtAbbr(data.customers);
  const custExact  = Number(data.customers).toLocaleString() + " customers";

  const rarAbbr    = fmtAbbr(data.revenue_at_risk, "₹");
  const rarExact   = fmtExact(data.revenue_at_risk, "₹");

  const recAbbr    = fmtAbbr(data.recoverable_revenue, "₹");
  const recExact   = fmtExact(data.recoverable_revenue, "₹");

  const urgAbbr    = fmtAbbr(data.urgent_customers);
  const urgExact   = Number(data.urgent_customers).toLocaleString() + " customers";

  const urgencyTiers = [
    { key: "critical", label: "Critical", color: "#ff4d6d" },
    { key: "high",     label: "High",     color: "#ff8c42" },
    { key: "medium",   label: "Medium",   color: "#ffc107" },
    { key: "low",      label: "Low",      color: "#00e5c3" },
  ];

  return (
    <><style>{styles}</style>
    <div className="cc-root">

      {/* HEADER */}
      <div className="cc-header">
        <div>
          <div className="cc-title">Retention <span>Command Center</span></div>
          <div className="cc-subtitle">Real-time churn intelligence · Model v3.2</div>
        </div>
        <div className="cc-live-badge">
          <div className="cc-pulse" />
          Live · Auto-updated
        </div>
      </div>

      {/* KPI ROW 1 — 3 cards: shorter values, big font */}
      <div className="cc-kpi-row1">
        <KpiCard
          label="Total Customers"
          abbr={custAbbr}
          exact={custExact}
          context="In current dataset"
          color="#7c6aff"
        />
        <KpiCard
          label="Churn Rate"
          abbr={churnPct}
          context="Of total customer fleet"
          color="#ff4d6d"
        />
        <KpiCard
          label="Urgent Cases"
          abbr={urgAbbr}
          exact={urgExact}
          context="Require immediate action"
          color="#ffc107"
        />
      </div>

      {/* KPI ROW 2 — 2 wide cards: currency values get 50% width each = double room */}
      <div className="cc-kpi-row2">
        <KpiCard
          label="Revenue at Risk"
          abbr={rarAbbr}
          exact={rarExact}
          context="Total revenue from at-risk customers"
          color="#ff4d6d"
        />
        <KpiCard
          label="Recoverable Revenue"
          abbr={recAbbr}
          exact={recExact}
          context="Actionable retention opportunity"
          color="#00e5c3"
        />
      </div>

      {/* URGENCY DISTRIBUTION */}
      <div className="cc-urgency">
        <div className="cc-panel-title">Customer Urgency Distribution</div>
        <div className="cc-urgency-grid">
          {urgencyTiers.map(t => (
            <div
              className="cc-urgency-card"
              key={t.key}
              style={{ borderColor: `${t.color}20` }}
            >
              <div className="cc-urgency-dot" style={{ background: t.color, boxShadow: `0 0 10px ${t.color}70` }} />
              <div className="cc-urgency-label">{t.label}</div>
              <div className="cc-urgency-val" style={{ color: t.color }}>
                {(data.urgency_distribution?.[t.key] ?? 0).toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CHART + SIGNALS */}
      <div className="cc-two-col">
        <div className="cc-panel">
          <div className="cc-panel-header">
            <div className="cc-panel-title">Live Churn Risk Trend</div>
            <div className="cc-panel-badge">Score distribution</div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={churnTrend} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="churnGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#ff4d6d" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#ff4d6d" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="i" hide />
              <YAxis tick={{ fontSize: 10, fill: "#4a5568", fontFamily: "DM Mono" }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone" dataKey="v"
                stroke="#ff4d6d" strokeWidth={2}
                fill="url(#churnGrad)"
                dot={false}
                activeDot={{ r: 4, fill: "#ff4d6d", stroke: "#080b10", strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="cc-panel">
          <div className="cc-panel-header">
            <div className="cc-panel-title">Executive Signals</div>
            <div className="cc-panel-badge">{data.signals?.length ?? 0} alerts</div>
          </div>
          <div className="cc-signal-list">
            {data.signals?.map((s, i) => (
              <div className="cc-signal-item" key={i}>
                <div className="cc-signal-icon">!</div>
                {s}
              </div>
            ))}
            {(!data.signals || data.signals.length === 0) && (
              <div style={{ color: "#4a5568", fontSize: 12, textAlign: "center", padding: "24px 0" }}>
                No critical signals at this time
              </div>
            )}
          </div>
        </div>
      </div>

      {/* TOP OPPORTUNITIES TABLE */}
      <div className="cc-panel">
        <div className="cc-panel-header">
          <div className="cc-panel-title">Top Retention Opportunities</div>
          <div className="cc-panel-badge">Ranked by opportunity score</div>
        </div>
        <div className="cc-table-wrap">
          <table className="cc-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Customer ID</th>
                <th>Churn Risk</th>
                <th>Uplift Score</th>
                <th>Opportunity Value</th>
              </tr>
            </thead>
            <tbody>
              {data.top_opportunities?.map((c, i) => {
                const rc = riskColor(c.risk);
                return (
                  <tr key={i}>
                    <td style={{ color: "#4a5568", fontSize: 11 }}>{String(i + 1).padStart(2, "0")}</td>
                    <td style={{ fontWeight: 500 }}>{c.customer_id ?? `CUST-${i + 1}`}</td>
                    <td>
                      <span className="risk-pill" style={{ background: rc.bg, color: rc.color }}>
                        <span className="risk-dot" />
                        {(c.risk * 100).toFixed(1)}%
                      </span>
                    </td>
                    <td style={{ color: "#7c6aff" }}>{c.uplift?.toFixed(3)}</td>
                    <td><span className="opp-val">₹{Math.round(c.opportunity_score).toLocaleString()}</span></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div></>
  );
};

export default CommandCenter;
