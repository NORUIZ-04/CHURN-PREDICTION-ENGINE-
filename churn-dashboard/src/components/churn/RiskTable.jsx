const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Mono:wght@300;400;500&display=swap');

  .rt-wrap {
    overflow-x: auto;
    max-height: 420px;
    overflow-y: auto;
    font-family: 'DM Mono', monospace;
  }
  .rt-wrap::-webkit-scrollbar { width: 4px; height: 4px; }
  .rt-wrap::-webkit-scrollbar-track { background: transparent; }
  .rt-wrap::-webkit-scrollbar-thumb { background: #1e2530; border-radius: 2px; }

  .rt-table { width: 100%; border-collapse: collapse; font-size: 12px; }

  .rt-table thead th {
    font-size: 10px; letter-spacing: 1.5px; text-transform: uppercase;
    color: #4a5568; padding: 10px 16px; text-align: left; font-weight: 500;
    border-bottom: 1px solid #1e2530;
    background: #0f1218;
    position: sticky; top: 0; z-index: 1;
  }

  .rt-table tbody tr {
    border-bottom: 1px solid rgba(255,255,255,0.03);
    transition: background 0.15s; cursor: pointer;
  }
  .rt-table tbody tr:hover { background: rgba(255,255,255,0.03); }
  .rt-table tbody tr:last-child { border-bottom: none; }

  .rt-table td { padding: 11px 16px; color: #e2e8f4; }

  .rt-id { color: #4a5568; font-size: 11px; }

  .rt-risk-wrap { display: flex; align-items: center; gap: 8px; }
  .rt-risk-track { width: 60px; height: 4px; background: #1e2530; border-radius: 2px; overflow: hidden; }
  .rt-risk-fill  { height: 100%; border-radius: 2px; }

  .rt-badge {
    display: inline-flex; align-items: center; gap: 4px;
    padding: 3px 9px; border-radius: 20px; font-size: 11px; font-weight: 500;
  }
  .rt-badge-dot { width: 5px; height: 5px; border-radius: 50%; background: currentColor; }
`;

function riskStyle(prob) {
  if (prob > 0.7) return { color: "#ff4d6d", track: "#ff4d6d" };
  if (prob > 0.4) return { color: "#ffc107", track: "#ffc107" };
  return { color: "#00e5c3", track: "#00e5c3" };
}

function predBadge(pred) {
  const churned = pred === 1 || pred === "1" || pred === true;
  return churned
    ? { bg: "rgba(255,77,109,0.1)",  color: "#ff4d6d", label: "Churn"  }
    : { bg: "rgba(0,229,195,0.1)",   color: "#00e5c3", label: "Retain" };
}

export default function RiskTable({ rows }) {
  const sorted = [...rows]
    .sort((a, b) => b.churn_probability - a.churn_probability)
    .slice(0, 200);

  return (
    <>
      <style>{styles}</style>
      <div className="rt-wrap">
        <table className="rt-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Customer</th>
              <th>Churn Risk</th>
              <th>Prediction</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((r, i) => {
              const rs  = riskStyle(r.churn_probability);
              const pb  = predBadge(r.churn_prediction);
              const pct = Math.min(100, (r.churn_probability ?? 0) * 100);
              return (
                <tr key={r.customer_id ?? i}>
                  <td className="rt-id">{String(i + 1).padStart(2, "0")}</td>
                  <td style={{ fontWeight: 500 }}>{r.customer_id ?? `CUST-${i}`}</td>
                  <td>
                    <div className="rt-risk-wrap">
                      <div className="rt-risk-track">
                        <div className="rt-risk-fill" style={{ width: `${pct}%`, background: rs.track }} />
                      </div>
                      <span style={{ color: rs.color, fontSize: 12, fontWeight: 600 }}>
                        {r.churn_probability?.toFixed(3)}
                      </span>
                    </div>
                  </td>
                  <td>
                    <span className="rt-badge" style={{ background: pb.bg, color: pb.color }}>
                      <span className="rt-badge-dot" />
                      {pb.label}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}
