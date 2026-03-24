const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Mono:wght@300;400;500&display=swap');

  .cg-wrap {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
    font-family: 'DM Mono', monospace;
  }

  .cg-ring-wrap {
    position: relative;
    width: 120px;
    height: 120px;
  }

  .cg-svg { transform: rotate(-90deg); }

  .cg-track {
    fill: none;
    stroke: #1e2530;
    stroke-width: 10;
  }

  .cg-fill {
    fill: none;
    stroke-width: 10;
    stroke-linecap: round;
    transition: stroke-dashoffset 0.8s ease, stroke 0.4s ease;
  }

  .cg-center {
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }

  .cg-score {
    font-family: 'Syne', sans-serif;
    font-size: 22px;
    font-weight: 800;
    line-height: 1;
    letter-spacing: -0.5px;
  }

  .cg-score-label {
    font-size: 9px;
    letter-spacing: 1.5px;
    text-transform: uppercase;
    color: #4a5568;
    margin-top: 2px;
  }

  .cg-label {
    font-size: 10px;
    letter-spacing: 1.5px;
    text-transform: uppercase;
    color: #4a5568;
  }

  .cg-tier {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    padding: 3px 10px;
    border-radius: 20px;
    font-size: 10px;
    font-weight: 500;
  }

  .cg-dot {
    width: 5px; height: 5px;
    border-radius: 50%;
    display: inline-block;
  }
`;

function getColor(score) {
  if (score >= 0.8) return "#00e5c3";
  if (score >= 0.6) return "#ffc107";
  return "#ff4d6d";
}

function getTier(score) {
  if (score >= 0.8) return { label: "HIGH", bg: "rgba(0,229,195,0.1)", color: "#00e5c3", border: "rgba(0,229,195,0.2)" };
  if (score >= 0.6) return { label: "MEDIUM", bg: "rgba(255,193,7,0.1)", color: "#ffc107", border: "rgba(255,193,7,0.2)" };
  return { label: "LOW", bg: "rgba(255,77,109,0.1)", color: "#ff4d6d", border: "rgba(255,77,109,0.2)" };
}

export default function ConfidenceGauge({ score = 0 }) {
  const pct = Math.min(Math.max(score, 0), 1);
  const color = getColor(pct);
  const tier = getTier(pct);

  const r = 50;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - pct);

  return (
    <>
      <style>{styles}</style>
      <div className="cg-wrap">
        <div className="cg-label">Confidence Score</div>

        <div className="cg-ring-wrap">
          <svg className="cg-svg" width="120" height="120" viewBox="0 0 120 120">
            <circle className="cg-track" cx="60" cy="60" r={r}/>
            <circle
              className="cg-fill"
              cx="60" cy="60" r={r}
              stroke={color}
              strokeDasharray={circ}
              strokeDashoffset={offset}
            />
          </svg>
          <div className="cg-center">
            <div className="cg-score" style={{color}}>{(pct * 100).toFixed(0)}</div>
            <div className="cg-score-label">/ 100</div>
          </div>
        </div>

        <div
          className="cg-tier"
          style={{background:tier.bg, color:tier.color, border:`1px solid ${tier.border}`}}
        >
          <span className="cg-dot" style={{background:tier.color}}/>
          {tier.label} CONFIDENCE
        </div>
      </div>
    </>
  );
}
