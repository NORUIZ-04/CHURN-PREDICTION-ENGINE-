import { useState } from "react";
import UpliftBarChart from "../components/uplift/UpliftBarChart";
import BudgetPanel from "../components/uplift/BudgetPanel";
import UpliftExplainPanel from "../components/uplift/UpliftExplainPanel";
import StrategyPanel from "../components/uplift/StrategyPanel";
import UpliftEvaluationPanel from "../components/uplift/UpliftEvaluationPanel";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Mono:wght@300;400;500&display=swap');
  .up-root { font-family:'DM Mono',monospace; color:#e2e8f4; animation:upFade 0.5s ease; padding:24px; }
  @keyframes upFade { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
  .up-page-title { font-family:'Syne',sans-serif; font-size:22px; font-weight:800; margin-bottom:6px; display:flex; align-items:center; gap:10px; }
  .up-page-sub { font-size:12px; color:#4a5568; margin-bottom:24px; }
  .up-section { margin-bottom:20px; }
  .up-section-label { font-size:10px; letter-spacing:2px; text-transform:uppercase; color:#2d3748; margin-bottom:10px; padding-left:2px; }
`;

export default function UpliftPage() {
  const rows = [
    { tenure: 6, monthly_spend: 70, calls: 5, CLV: 1200, customer_value: 1200, budget: 500 },
    { tenure: 18, monthly_spend: 110, calls: 2, CLV: 2400, customer_value: 2400, budget: 500 }
  ];
  const sampleRow = rows[0];
  const chartData = [
    { treatment: "discount", uplift: 0.02 },
    { treatment: "callback", uplift: 0.01 },
    { treatment: "upgrade", uplift: 0.015 }
  ];

  return (
    <>
      <style>{styles}</style>
      <div className="up-root">
        <div className="up-page-title">
          <span style={{color:"#7c6aff"}}>◈</span> Uplift Intelligence Dashboard
        </div>
        <div className="up-page-sub">Treatment effect modeling · Budget optimization · Strategy generation</div>

        <div className="up-section">
          <div className="up-section-label">Uplift by Treatment</div>
          <UpliftBarChart data={chartData} />
        </div>

        <div className="up-section">
          <div className="up-section-label">Budget Optimizer</div>
          <BudgetPanel rows={rows} />
        </div>

        <div className="up-section">
          <div className="up-section-label">Uplift Explainability</div>
          <UpliftExplainPanel row={sampleRow} />
        </div>

        <div className="up-section">
          <div className="up-section-label">AI Strategy Narrative</div>
          <StrategyPanel row={sampleRow} />
        </div>

        <div className="up-section">
          <div className="up-section-label">Model Evaluation</div>
          <UpliftEvaluationPanel rows={rows} />
        </div>
      </div>
    </>
  );
}
