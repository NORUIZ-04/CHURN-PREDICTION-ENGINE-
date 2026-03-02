import { useQuery } from "@tanstack/react-query"
import { datasetApi } from "../../api/datasetApi"
import { useDatasetStore } from "../../store/datasetStore"

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Mono:wght@300;400;500&display=swap');
  .qp-panel { background:#0f1218; border:1px solid #1e2530; border-radius:12px; padding:20px; font-family:'DM Mono',monospace; color:#e2e8f4; }
  .qp-header { display:flex; align-items:center; justify-content:space-between; margin-bottom:16px; padding-bottom:14px; border-bottom:1px solid #1e2530; }
  .qp-title { font-family:'Syne',sans-serif; font-size:14px; font-weight:700; display:flex; align-items:center; gap:7px; }
  .qp-badge { font-size:10px; color:#00e5c3; padding:3px 10px; background:rgba(0,229,195,0.1); border:1px solid rgba(0,229,195,0.2); border-radius:20px; }
  .qp-dup-row { display:flex; align-items:center; justify-content:space-between; background:#161b24; border:1px solid #1e2530; border-radius:8px; padding:12px 14px; margin-bottom:14px; }
  .qp-dup-label { font-size:11px; color:#6b7a95; }
  .qp-dup-value { font-family:'Syne',sans-serif; font-size:16px; font-weight:700; color:#ffc107; }
  .qp-section-label { font-size:10px; letter-spacing:1.5px; text-transform:uppercase; color:#2d3748; margin-bottom:8px; }
  .qp-missing-list { display:flex; flex-direction:column; gap:6px; }
  .qp-missing-row { background:#161b24; border:1px solid #1e2530; border-radius:8px; padding:10px 14px; }
  .qp-missing-top { display:flex; align-items:center; justify-content:space-between; margin-bottom:6px; }
  .qp-missing-col { font-size:12px; color:#e2e8f4; }
  .qp-missing-pct { font-size:12px; font-weight:700; font-family:'Syne',sans-serif; }
  .qp-bar-bg { height:3px; background:#1e2530; border-radius:2px; overflow:hidden; }
  .qp-bar-fill { height:100%; border-radius:2px; }
`;

function getMissingColor(pct) {
  if (pct > 30) return "#ff4d6d";
  if (pct > 10) return "#ffc107";
  return "#00e5c3";
}

export default function QualityPanel() {
  const path = useDatasetStore(s => s.datasetPath)

  const { data, isLoading } = useQuery({
    queryKey: ["quality", path],
    queryFn: () => datasetApi.quality(path).then(r => r.data),
    enabled: !!path
  })

  if (!path || (!data && !isLoading)) return null

  return (
    <>
      <style>{styles}</style>
      <div className="qp-panel">
        <div className="qp-header">
          <div className="qp-title"><span style={{color:"#00e5c3"}}>◎</span> Data Quality</div>
          {data && <span className="qp-badge">{data.missing?.length || 0} issues</span>}
        </div>

        {isLoading && <div style={{fontSize:12,color:"#4a5568",padding:"20px 0",textAlign:"center"}}>Analyzing data quality…</div>}

        {data && (
          <>
            <div className="qp-dup-row">
              <span className="qp-dup-label">Duplicate Rows</span>
              <span className="qp-dup-value">{data.duplicates}</span>
            </div>

            {data.missing?.length > 0 && (
              <>
                <div className="qp-section-label">Missing Values</div>
                <div className="qp-missing-list">
                  {data.missing.map(m => {
                    const pct = Number(m.missing_percent);
                    const color = getMissingColor(pct);
                    return (
                      <div key={m.column} className="qp-missing-row">
                        <div className="qp-missing-top">
                          <span className="qp-missing-col">{m.column}</span>
                          <span className="qp-missing-pct" style={{color}}>{pct.toFixed(1)}%</span>
                        </div>
                        <div className="qp-bar-bg">
                          <div className="qp-bar-fill" style={{width:`${Math.min(pct,100)}%`,background:color}}/>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}

            {data.missing?.length === 0 && (
              <div style={{textAlign:"center",padding:"16px 0",fontSize:12,color:"#00e5c3"}}>✓ No missing values detected</div>
            )}
          </>
        )}
      </div>
    </>
  )
}
