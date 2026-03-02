const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Mono:wght@300;400;500&display=swap');
  .kpi-card { background:#0f1218; border:1px solid #1e2530; border-radius:12px; padding:20px 18px; position:relative; overflow:hidden; transition:all 0.2s; font-family:'DM Mono',monospace; }
  .kpi-card:hover { border-color:rgba(0,229,195,0.2); transform:translateY(-2px); }
  .kpi-top-bar { position:absolute; top:0; left:0; right:0; height:2px; opacity:0.8; }
  .kpi-label { font-size:10px; letter-spacing:1.5px; text-transform:uppercase; color:#4a5568; margin-bottom:10px; }
  .kpi-value { font-family:'Syne',sans-serif; font-size:26px; font-weight:800; letter-spacing:-0.5px; line-height:1; }
`;

const DEFAULT_COLOR = "#00e5c3";

export default function KpiCard({ title, value, color }) {
  const c = color || DEFAULT_COLOR;
  return (
    <>
      <style>{styles}</style>
      <div className="kpi-card">
        <div className="kpi-top-bar" style={{background:c}}/>
        <div className="kpi-label">{title}</div>
        <div className="kpi-value" style={{color:c}}>{value ?? "—"}</div>
      </div>
    </>
  );
}
