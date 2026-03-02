import { sampleCustomer } from "../utils/sampleCustomer";

import UpliftVectorPanel from "../components/uplift/UpliftVectorPanel";
import OptimizerPanel from "../components/uplift/OptimizerPanel";
import ExplainPanel from "../components/uplift/ExplainPanel";
import LLMPanel from "../components/uplift/LLMPanel";
import SimulatorPanel from "../components/simulate/SimulatorPanel";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Mono:wght@300;400;500&display=swap');

  .ud-root {
    font-family: 'DM Mono', monospace;
    color: #e2e8f4;
    animation: udFade 0.5s ease;
  }
  @keyframes udFade { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }

  /* HEADER */
  .ud-header { margin-bottom: 32px; }
  .ud-title {
    font-family: 'Syne', sans-serif;
    font-size: 28px; font-weight: 800;
    letter-spacing: -1px; line-height: 1.1;
    margin-bottom: 8px;
  }
  .ud-title span { color: #00e5c3; }
  .ud-subtitle { font-size: 12px; color: #4a5568; }

  /* TAB BAR */
  .ud-tabs {
    display: flex; gap: 4px;
    background: #0f1218;
    border: 1px solid #1e2530;
    border-radius: 10px;
    padding: 5px;
    margin-bottom: 28px;
    width: fit-content;
  }
  .ud-tab {
    font-family: 'DM Mono', monospace;
    font-size: 12px; padding: 8px 18px;
    border-radius: 7px; border: none;
    background: transparent; color: #4a5568;
    cursor: pointer; transition: all 0.15s;
    white-space: nowrap;
  }
  .ud-tab:hover { color: #e2e8f4; }
  .ud-tab.active {
    background: rgba(0,229,195,0.1);
    color: #00e5c3;
    border: 1px solid rgba(0,229,195,0.2);
  }

  /* CUSTOMER CONTEXT CARD */
  .ud-context {
    background: #0f1218;
    border: 1px solid #1e2530;
    border-radius: 12px;
    padding: 18px 22px;
    margin-bottom: 24px;
    display: flex; align-items: center; gap: 20px;
    flex-wrap: wrap;
  }
  .ud-context-label {
    font-size: 10px; letter-spacing: 1.5px; text-transform: uppercase;
    color: #4a5568; margin-bottom: 6px;
  }
  .ud-context-title {
    font-family: 'Syne', sans-serif;
    font-size: 14px; font-weight: 700; color: #e2e8f4;
  }
  .ud-context-divider {
    width: 1px; height: 36px; background: #1e2530;
    flex-shrink: 0;
  }
  .ud-context-stat { }
  .ud-context-stat-val {
    font-family: 'Syne', sans-serif;
    font-size: 16px; font-weight: 800;
  }

  /* PANEL WRAPPER - wraps each child component */
  .ud-panel {
    background: #0f1218;
    border: 1px solid #1e2530;
    border-radius: 12px;
    padding: 24px;
    margin-bottom: 20px;
    transition: border-color 0.2s;
  }
  .ud-panel:hover { border-color: rgba(0,229,195,0.12); }
  .ud-panel-header {
    display: flex; align-items: center; justify-content: space-between;
    margin-bottom: 20px;
    padding-bottom: 16px;
    border-bottom: 1px solid #1e2530;
  }
  .ud-panel-title {
    font-family: 'Syne', sans-serif;
    font-size: 15px; font-weight: 700; letter-spacing: -0.3px;
    display: flex; align-items: center; gap: 8px;
  }
  .ud-panel-icon {
    width: 28px; height: 28px; border-radius: 7px;
    display: flex; align-items: center; justify-content: center;
    font-size: 13px; flex-shrink: 0;
  }
  .ud-panel-badge {
    font-size: 10px; color: #4a5568;
    padding: 4px 10px;
    background: #161b24; border: 1px solid #1e2530; border-radius: 20px;
  }
`;

const TABS = [
  { id: "vector",    label: "Uplift Vector",   icon: "⊹", color: "#00e5c3" },
  { id: "optimizer", label: "Optimizer",        icon: "◈", color: "#7c6aff" },
  { id: "explain",   label: "Explainability",   icon: "◉", color: "#ffc107" },
  { id: "llm",       label: "AI Narrative",     icon: "✦", color: "#ff4d6d" },
  { id: "simulator", label: "Action Simulator", icon: "◷", color: "#00e5c3" },
];

const PANELS = {
  vector:    { title: "Uplift Vector Analysis",  icon: "⊹", color: "rgba(0,229,195,0.1)",  iconColor: "#00e5c3", badge: "Treatment response",   Component: UpliftVectorPanel },
  optimizer: { title: "Retention Optimizer",     icon: "◈", color: "rgba(124,106,255,0.1)", iconColor: "#7c6aff", badge: "Best action per user",  Component: OptimizerPanel    },
  explain:   { title: "Model Explainability",    icon: "◉", color: "rgba(255,193,7,0.1)",   iconColor: "#ffc107", badge: "SHAP-powered insights", Component: ExplainPanel      },
  llm:       { title: "AI-Generated Narrative",  icon: "✦", color: "rgba(255,77,109,0.1)",  iconColor: "#ff4d6d", badge: "GPT analysis",          Component: LLMPanel          },
  simulator: { title: "Action Simulator",        icon: "◷", color: "rgba(0,229,195,0.1)",   iconColor: "#00e5c3", badge: "What-if scenarios",     Component: SimulatorPanel    },
};

import { useState } from "react";

export default function UpliftDashboard() {
  const [activeTab, setActiveTab] = useState("vector");
  const panel = PANELS[activeTab];
  const { Component } = panel;

  return (
    <>
      <style>{styles}</style>
      <div className="ud-root">

        {/* HEADER */}
        <div className="ud-header">
          <div className="ud-title">Uplift <span>Intelligence</span> Dashboard</div>
          <div className="ud-subtitle">Treatment response modeling · Causal uplift analysis · Action recommendation</div>
        </div>

        {/* CUSTOMER CONTEXT */}
        <div className="ud-context">
          <div>
            <div className="ud-context-label">Sample Customer</div>
            <div className="ud-context-title">{sampleCustomer?.customer_id ?? "CUST-DEMO"}</div>
          </div>
          <div className="ud-context-divider" />
          {sampleCustomer?.churn_probability !== undefined && (
            <div className="ud-context-stat">
              <div className="ud-context-label">Churn Risk</div>
              <div className="ud-context-stat-val" style={{ color: "#ff4d6d" }}>
                {(sampleCustomer.churn_probability * 100).toFixed(1)}%
              </div>
            </div>
          )}
          {sampleCustomer?.plan_type && (
            <>
              <div className="ud-context-divider" />
              <div className="ud-context-stat">
                <div className="ud-context-label">Segment</div>
                <div className="ud-context-stat-val" style={{ color: "#7c6aff" }}>{sampleCustomer.plan_type}</div>
              </div>
            </>
          )}
          <div style={{ marginLeft: "auto" }}>
            <div className="ud-context-label">Analysis Mode</div>
            <div style={{ fontSize: 12, color: "#00e5c3", display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ width: 6, height: 6, background: "#00e5c3", borderRadius: "50%", display: "inline-block" }} />
              Live Model Active
            </div>
          </div>
        </div>

        {/* TABS */}
        <div className="ud-tabs">
          {TABS.map(t => (
            <button
              key={t.id}
              className={`ud-tab${activeTab === t.id ? " active" : ""}`}
              onClick={() => setActiveTab(t.id)}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {/* ACTIVE PANEL */}
        <div className="ud-panel">
          <div className="ud-panel-header">
            <div className="ud-panel-title">
              <div className="ud-panel-icon" style={{ background: panel.color, color: panel.iconColor }}>
                {panel.icon}
              </div>
              {panel.title}
            </div>
            <div className="ud-panel-badge">{panel.badge}</div>
          </div>
          <Component row={sampleCustomer} />
        </div>

      </div>
    </>
  );
}
