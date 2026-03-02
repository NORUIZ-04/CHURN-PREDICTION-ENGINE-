import { useState } from "react";
import { api } from "../../api";
import { useDatasetStore } from "../../store/datasetStore";
import { getFilename } from "../../utils/getFilename";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Mono:wght@300;400;500&display=swap');

  .udp-root { font-family: 'DM Mono', monospace; color: #e2e8f4; }

  /* CONTROLS */
  .udp-controls { display:flex;align-items:flex-end;gap:16px;margin-bottom:20px;flex-wrap:wrap; }
  .udp-ctrl-group { display:flex;flex-direction:column;gap:6px; }
  .udp-ctrl-label { font-size:10px;letter-spacing:1.5px;text-transform:uppercase;color:#4a5568; }

  /* BUDGET */
  .udp-budget-val { font-family:'Syne',sans-serif;font-size:18px;font-weight:800;color:#00e5c3;margin-bottom:6px; }
  .udp-slider {
    -webkit-appearance:none;appearance:none;
    width:200px;height:4px;background:#1e2530;border-radius:2px;outline:none;cursor:pointer;
  }
  .udp-slider::-webkit-slider-thumb {
    -webkit-appearance:none;appearance:none;
    width:16px;height:16px;border-radius:50%;background:#00e5c3;cursor:pointer;
    box-shadow:0 0 8px rgba(0,229,195,0.4);
  }

  /* BTN */
  .udp-btn {
    font-family:'Syne',sans-serif;font-size:13px;font-weight:700;
    padding:10px 22px;border-radius:9px;border:none;cursor:pointer;
    transition:all 0.2s;background:#ff4d6d;color:#fff;
    display:inline-flex;align-items:center;gap:8px;
  }
  .udp-btn:hover:not(:disabled) { background:#ff6b85;transform:translateY(-1px);box-shadow:0 8px 20px rgba(255,77,109,0.3); }
  .udp-btn:disabled { opacity:0.5;cursor:not-allowed; }
  .udp-spinner { width:14px;height:14px;border:2px solid rgba(255,255,255,0.2);border-top-color:#fff;border-radius:50%;animation:spin 0.6s linear infinite; }
  @keyframes spin{to{transform:rotate(360deg)}}

  /* KPIs */
  .udp-kpi-grid { display:grid;grid-template-columns:repeat(3,1fr);gap:14px;margin-bottom:20px; }
  .udp-kpi { background:#161b24;border:1px solid #1e2530;border-radius:10px;padding:16px;position:relative;overflow:hidden; }
  .udp-kpi-top { position:absolute;top:0;left:0;right:0;height:2px; }
  .udp-kpi-label { font-size:10px;letter-spacing:1.5px;text-transform:uppercase;color:#4a5568;margin-bottom:8px; }
  .udp-kpi-val { font-family:'Syne',sans-serif;font-size:22px;font-weight:800; }

  /* TABLE */
  .udp-table-wrap { overflow-x:auto;max-height:420px;overflow-y:auto; }
  .udp-table-wrap::-webkit-scrollbar { width:4px;height:4px; }
  .udp-table-wrap::-webkit-scrollbar-track { background:transparent; }
  .udp-table-wrap::-webkit-scrollbar-thumb { background:#1e2530;border-radius:2px; }

  .udp-table { width:100%;border-collapse:collapse;font-size:12px; }
  .udp-table thead th {
    font-size:10px;letter-spacing:1.5px;text-transform:uppercase;
    color:#4a5568;padding:10px 14px;text-align:left;font-weight:500;
    border-bottom:1px solid #1e2530;background:#161b24;position:sticky;top:0;z-index:1;
    white-space:nowrap;
  }
  .udp-table tbody tr { border-bottom:1px solid rgba(255,255,255,0.03);transition:background 0.15s; }
  .udp-table tbody tr:hover { background:rgba(255,255,255,0.02); }
  .udp-table tbody tr:last-child { border-bottom:none; }
  .udp-table td { padding:10px 14px;color:#e2e8f4; }
  .udp-td-muted { color:#4a5568;font-size:11px; }

  /* BAR */
  .udp-bar-wrap { display:flex;align-items:center;gap:7px; }
  .udp-bar-track { width:54px;height:4px;background:#1e2530;border-radius:2px;overflow:hidden; }
  .udp-bar-fill  { height:100%;border-radius:2px; }

  /* URGENCY */
  .udp-urg-pill { display:inline-flex;align-items:center;gap:4px;padding:3px 9px;border-radius:20px;font-size:11px; }
  .udp-urg-dot  { width:5px;height:5px;border-radius:50%;background:currentColor; }

  /* ACTION */
  .udp-action-badge {
    display:inline-block;font-size:10px;padding:3px 9px;
    border-radius:6px;background:rgba(124,106,255,0.1);
    color:#7c6aff;border:1px solid rgba(124,106,255,0.2);
    white-space:nowrap;
  }

  /* EMPTY */
  .udp-empty { text-align:center;padding:32px 20px;color:#4a5568;font-size:12px; }
`;

const ACTION_MAP = {
  priority_service_call: "📞 Service Call",
  flexible_payment_plan: "💳 Payment Plan",
  loyalty_reward_offer:  "🎁 Loyalty Reward",
  standard_discount:     "🏷 Discount",
};

function urgencyStyle(v = 0) {
  if (v > 0.7) return { bg:"rgba(255,77,109,0.1)",  color:"#ff4d6d", label:"HIGH"   };
  if (v > 0.4) return { bg:"rgba(255,193,7,0.1)",   color:"#ffc107", label:"MED"    };
  return              { bg:"rgba(0,229,195,0.1)",    color:"#00e5c3", label:"LOW"    };
}

export default function UrgentDecisionPanel() {
  const datasetPath  = useDatasetStore(s => s.datasetPath);
  const [rows, setRows]     = useState([]);
  const [budget, setBudget] = useState(5000);
  const [loading, setLoading] = useState(false);

  async function load() {
    if (!datasetPath) return;
    setLoading(true);
    try {
      const filename = getFilename(datasetPath);
      const res = await api.get(`/decision/urgent/${filename}?budget=${budget}`);
      setRows(res.data || []);
    } catch(e) { console.error(e); setRows([]); }
    setLoading(false);
  }

  const totalProfit = rows.reduce((s, r) => s + (r.expected_profit || 0), 0);

  return (
    <>
      <style>{styles}</style>
      <div className="udp-root">

        {/* CONTROLS */}
        <div className="udp-controls">
          <div className="udp-ctrl-group">
            <div className="udp-ctrl-label">Retention Budget</div>
            <div className="udp-budget-val">₹{budget.toLocaleString()}</div>
            <input
              type="range" className="udp-slider"
              min={1000} max={20000} step={500}
              value={budget}
              onChange={e => setBudget(Number(e.target.value))}
            />
          </div>
          <button className="udp-btn" onClick={load} disabled={loading || !datasetPath}>
            {loading ? <><div className="udp-spinner"/>Running Engine...</> : <>🚨 Run Urgent Engine</>}
          </button>
        </div>

        {/* KPIs */}
        <div className="udp-kpi-grid">
          <div className="udp-kpi">
            <div className="udp-kpi-top" style={{background:"#7c6aff",opacity:0.6}}/>
            <div className="udp-kpi-label">Customers Selected</div>
            <div className="udp-kpi-val" style={{color:"#7c6aff"}}>{rows.length.toLocaleString()}</div>
          </div>
          <div className="udp-kpi">
            <div className="udp-kpi-top" style={{background:"#ff4d6d",opacity:0.6}}/>
            <div className="udp-kpi-label">Budget Allocated</div>
            <div className="udp-kpi-val" style={{color:"#ff4d6d"}}>₹{budget.toLocaleString()}</div>
          </div>
          <div className="udp-kpi">
            <div className="udp-kpi-top" style={{background:"#00e5c3",opacity:0.6}}/>
            <div className="udp-kpi-label">Expected Profit</div>
            <div className="udp-kpi-val" style={{color:"#00e5c3"}}>₹{totalProfit.toFixed(0)}</div>
          </div>
        </div>

        {/* EMPTY STATE */}
        {!loading && rows.length === 0 && (
          <div className="udp-empty">
            Set your budget and click <strong style={{color:"#ff4d6d"}}>Run Urgent Engine</strong> to find top customers for immediate action
          </div>
        )}

        {/* TABLE */}
        {rows.length > 0 && (
          <div className="udp-table-wrap">
            <table className="udp-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Customer</th>
                  <th>Risk</th>
                  <th>TTC</th>
                  <th>Uplift</th>
                  <th>ROI</th>
                  <th>Urgency</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => {
                  const us = urgencyStyle(r.urgency_score);
                  return (
                    <tr key={r.customer_id ?? i}>
                      <td className="udp-td-muted">{String(i+1).padStart(2,"0")}</td>
                      <td style={{fontWeight:500}}>{r.customer_id}</td>
                      <td>
                        <div className="udp-bar-wrap">
                          <div className="udp-bar-track"><div className="udp-bar-fill" style={{width:`${Math.min(100,(r.risk??0)*100)}%`,background:"#ff4d6d"}}/></div>
                          <span style={{color:"#ff4d6d",fontSize:11}}>{r.risk?.toFixed(2)}</span>
                        </div>
                      </td>
                      <td style={{color:"#7c6aff"}}>{r.time_to_churn?.toFixed(1)} <span style={{color:"#4a5568",fontSize:10}}>mo</span></td>
                      <td>
                        <div className="udp-bar-wrap">
                          <div className="udp-bar-track"><div className="udp-bar-fill" style={{width:`${Math.min(100,(r.uplift??0)*100)}%`,background:"#00e5c3"}}/></div>
                          <span style={{color:"#00e5c3",fontSize:11}}>{r.uplift?.toFixed(2)}</span>
                        </div>
                      </td>
                      <td style={{color:"#ffc107",fontWeight:600}}>{r.roi?.toFixed(2)}</td>
                      <td>
                        <span className="udp-urg-pill" style={{background:us.bg,color:us.color}}>
                          <span className="udp-urg-dot"/>{us.label}
                        </span>
                      </td>
                      <td>
                        <span className="udp-action-badge">
                          {ACTION_MAP[r.recommended_action] || r.recommended_action || "—"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
