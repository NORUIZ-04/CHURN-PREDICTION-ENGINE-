const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Mono:wght@300;400;500&display=swap');

  .dsr-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 14px;
    border-bottom: 1px solid rgba(255,255,255,0.03);
    font-family: 'DM Mono', monospace;
    font-size: 12px;
    transition: background 0.12s;
    gap: 12px;
  }

  .dsr-row:hover { background: rgba(255,255,255,0.02); }
  .dsr-row:last-child { border-bottom: none; }

  .dsr-feature {
    color: #e2e8f4;
    flex: 1;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .dsr-bar-wrap {
    flex: 1;
    max-width: 100px;
    height: 3px;
    background: #1e2530;
    border-radius: 2px;
    overflow: hidden;
  }

  .dsr-bar-fill {
    height: 100%;
    border-radius: 2px;
    transition: width 0.5s ease;
  }

  .dsr-magnitude {
    font-size: 11px;
    color: #6b7a95;
    width: 40px;
    text-align: right;
    flex-shrink: 0;
  }

  .dsr-pill {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 2px 9px;
    border-radius: 20px;
    font-size: 10px;
    letter-spacing: 0.5px;
    font-weight: 500;
    flex-shrink: 0;
    min-width: 72px;
    justify-content: center;
  }

  .dsr-dot {
    width: 5px; height: 5px;
    border-radius: 50%;
    display: inline-block;
  }
`;

function getStatusStyle(status) {
  switch (status) {
    case "DRIFT":
      return { bg:"rgba(255,77,109,0.1)", color:"#ff4d6d", border:"rgba(255,77,109,0.2)", barColor:"#ff4d6d" };
    case "WARNING":
      return { bg:"rgba(255,193,7,0.1)", color:"#ffc107", border:"rgba(255,193,7,0.2)", barColor:"#ffc107" };
    default:
      return { bg:"rgba(0,229,195,0.08)", color:"#00e5c3", border:"rgba(0,229,195,0.15)", barColor:"#00e5c3" };
  }
}

export default function DriftStatusRow({ feature, status, change_magnitude }) {
  const s = getStatusStyle(status);
  const mag = change_magnitude ?? 0;
  const barPct = Math.min(mag * 100, 100);

  return (
    <>
      <style>{styles}</style>
      <div className="dsr-row">
        <span className="dsr-feature">{feature}</span>

        <div className="dsr-bar-wrap">
          <div
            className="dsr-bar-fill"
            style={{ width:`${barPct}%`, background: s.barColor }}
          />
        </div>

        <span className="dsr-magnitude">{mag.toFixed(3)}</span>

        <span
          className="dsr-pill"
          style={{ background:s.bg, color:s.color, border:`1px solid ${s.border}` }}
        >
          <span className="dsr-dot" style={{background:s.color}}/>
          {status || "STABLE"}
        </span>
      </div>
    </>
  );
}
