import { useQuery } from "@tanstack/react-query"
import { datasetApi } from "../../api/datasetApi"
import { useDatasetStore } from "../../store/datasetStore"

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Mono:wght@300;400;500&display=swap');
  .scr-grid { display:grid; grid-template-columns:repeat(6,1fr); gap:12px; font-family:'DM Mono',monospace; }
  @media (max-width:1200px) { .scr-grid { grid-template-columns:repeat(3,1fr); } }
  @media (max-width:640px) { .scr-grid { grid-template-columns:repeat(2,1fr); } }
  .scr-kpi { background:#0f1218; border:1px solid #1e2530; border-radius:12px; padding:18px 16px; position:relative; overflow:hidden; transition:all 0.2s; }
  .scr-kpi:hover { border-color:rgba(0,229,195,0.2); transform:translateY(-2px); }
  .scr-kpi-top { position:absolute; top:0; left:0; right:0; height:2px; }
  .scr-kpi-label { font-size:9px; letter-spacing:1.5px; text-transform:uppercase; color:#4a5568; margin-bottom:8px; }
  .scr-kpi-value { font-family:'Syne',sans-serif; font-size:22px; font-weight:800; letter-spacing:-0.5px; line-height:1; }
  .scr-loading { display:grid; grid-template-columns:repeat(6,1fr); gap:12px; }
  .scr-skel { background:#0f1218; border:1px solid #1e2530; border-radius:12px; padding:18px 16px; height:72px; animation:skelPulse 1.4s ease-in-out infinite; }
  @keyframes skelPulse { 0%,100%{opacity:0.4} 50%{opacity:0.8} }
`;

const CARD_COLORS = ["#00e5c3","#ff4d6d","#ff4d6d","#00e5c3","#7c6aff","#ffc107"];

export default function SummaryCardsRow() {
  const path = useDatasetStore(s => s.datasetPath)

  const { data, isLoading } = useQuery({
    queryKey: ["summary", path],
    queryFn: () => datasetApi.summary(path).then(r => r.data),
    enabled: !!path,
    staleTime: 300000
  })

  if (isLoading) return (
    <>
      <style>{styles}</style>
      <div className="scr-loading">
        {[...Array(6)].map((_,i) => <div key={i} className="scr-skel"/>)}
      </div>
    </>
  );

  if (!data) return null

  const cards = [
    ["Customers", data.total_rows],
    ["Churn %", `${(data.churn_rate * 100).toFixed(1)}%`],
    ["Churned", data.churned],
    ["Active", data.active],
    ["Numeric", data.numeric_features],
    ["Categorical", data.categorical_features]
  ]

  return (
    <>
      <style>{styles}</style>
      <div className="scr-grid">
        {cards.map(([label, value], i) => (
          <div key={label} className="scr-kpi">
            <div className="scr-kpi-top" style={{background:CARD_COLORS[i]}}/>
            <div className="scr-kpi-label">{label}</div>
            <div className="scr-kpi-value" style={{color:CARD_COLORS[i]}}>{value}</div>
          </div>
        ))}
      </div>
    </>
  )
}
