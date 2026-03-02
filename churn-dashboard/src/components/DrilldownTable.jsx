import { useState, useMemo } from "react"

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Mono:wght@300;400;500&display=swap');

  .dt-root { font-family:'DM Mono',monospace; color:#e2e8f4; animation:dtFade 0.4s ease; }
  @keyframes dtFade { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }

  .dt-panel { background:#0f1218; border:1px solid #1e2530; border-radius:12px; padding:20px; }
  .dt-header { display:flex; align-items:center; justify-content:space-between; margin-bottom:16px; padding-bottom:14px; border-bottom:1px solid #1e2530; }
  .dt-title { font-family:'Syne',sans-serif; font-size:14px; font-weight:700; }
  .dt-badge { font-size:10px; color:#7c6aff; padding:3px 10px; background:rgba(124,106,255,0.1); border:1px solid rgba(124,106,255,0.2); border-radius:20px; letter-spacing:0.5px; }

  .dt-export-btn { font-family:'Syne',sans-serif; font-size:11px; font-weight:700; padding:7px 14px; border-radius:7px; border:1px solid #1e2530; cursor:pointer; background:#161b24; color:#6b7a95; transition:all 0.2s; display:inline-flex; align-items:center; gap:5px; }
  .dt-export-btn:hover { border-color:rgba(0,229,195,0.3); color:#00e5c3; }

  .dt-table-wrap { overflow-x:auto; max-height:380px; overflow-y:auto; border:1px solid #1e2530; border-radius:8px; }
  .dt-table-wrap::-webkit-scrollbar { width:4px; height:4px; }
  .dt-table-wrap::-webkit-scrollbar-track { background:transparent; }
  .dt-table-wrap::-webkit-scrollbar-thumb { background:#1e2530; border-radius:2px; }

  .dt-table { width:100%; border-collapse:collapse; font-size:12px; }
  .dt-table thead th { font-size:10px; letter-spacing:1.5px; text-transform:uppercase; color:#4a5568; padding:10px 14px; text-align:left; border-bottom:1px solid #1e2530; background:#0f1218; position:sticky; top:0; z-index:1; white-space:nowrap; }
  .dt-table tbody tr { border-bottom:1px solid rgba(255,255,255,0.03); transition:background 0.12s; cursor:pointer; }
  .dt-table tbody tr:hover { background:rgba(0,229,195,0.03); }
  .dt-table td { padding:10px 14px; color:#e2e8f4; white-space:nowrap; }

  .dt-footer { display:flex; align-items:center; justify-content:space-between; margin-top:14px; }
  .dt-page-info { font-size:11px; color:#4a5568; }
  .dt-page-btns { display:flex; gap:8px; }
  .dt-page-btn { font-family:'DM Mono',monospace; font-size:11px; padding:6px 14px; border-radius:7px; border:1px solid #1e2530; background:#161b24; color:#6b7a95; cursor:pointer; transition:all 0.2s; }
  .dt-page-btn:hover:not(:disabled) { border-color:rgba(0,229,195,0.3); color:#00e5c3; }
  .dt-page-btn:disabled { opacity:0.3; cursor:not-allowed; }

  .dt-empty { display:flex; flex-direction:column; align-items:center; justify-content:center; padding:40px; gap:10px; color:#2d3748; font-size:12px; text-align:center; }
`;

export default function DrilldownTable({ rows = [], label = "", onRowClick }) {
  const pageSize = 10
  const [page, setPage] = useState(0)

  // ================= SAFETY =================
  const safeRows = Array.isArray(rows) ? rows : []
  const cols = useMemo(() => safeRows.length ? Object.keys(safeRows[0]) : [], [safeRows])

  if (!safeRows.length) {
    return (
      <>
        <style>{styles}</style>
        <div className="dt-root">
          <div className="dt-panel">
            <div className="dt-empty">
              <div style={{fontSize:24,opacity:0.3}}>◫</div>
              <div>No rows to display</div>
            </div>
          </div>
        </div>
      </>
    )
  }

  // ================= PAGINATION =================
  const totalPages = Math.ceil(safeRows.length / pageSize)
  const pageRows = safeRows.slice(page * pageSize, (page + 1) * pageSize)

  // ================= CSV EXPORT =================
  const escapeCSV = (v) => {
    if (v == null) return ""
    const s = String(v)
    if (s.includes(",") || s.includes('"') || s.includes("\n")) return `"${s.replace(/"/g, '""')}"`
    return s
  }

  const exportCSV = () => {
    const csv = [cols.join(",")].concat(safeRows.map(r => cols.map(c => escapeCSV(r[c])).join(","))).join("\n")
    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "drilldown.csv"
    a.click()
    URL.revokeObjectURL(url)
  }

  // ================= UI =================
  return (
    <>
      <style>{styles}</style>
      <div className="dt-root">
        <div className="dt-panel">
          {/* HEADER */}
          <div className="dt-header">
            <div style={{display:"flex",alignItems:"center",gap:10}}>
              <div className="dt-title">Drilldown</div>
              {label && <span className="dt-badge">{label}</span>}
              <span style={{fontSize:10,color:"#4a5568"}}>{safeRows.length} rows</span>
            </div>
            <button className="dt-export-btn" onClick={exportCSV}>
              ↓ Export CSV
            </button>
          </div>

          {/* TABLE */}
          <div className="dt-table-wrap">
            <table className="dt-table">
              <thead>
                <tr>
                  {cols.map(c => <th key={c}>{c}</th>)}
                </tr>
              </thead>
              <tbody>
                {pageRows.map((r, i) => (
                  <tr key={i} onClick={() => onRowClick?.(r)}>
                    {cols.map(c => (
                      <td key={c}>{String(r[c] ?? "—")}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* FOOTER PAGINATION */}
          <div className="dt-footer">
            <div className="dt-page-info">
              Page {page + 1} of {totalPages} · {safeRows.length} total
            </div>
            <div className="dt-page-btns">
              <button className="dt-page-btn" disabled={page === 0} onClick={() => setPage(p => p - 1)}>
                ← Prev
              </button>
              <button className="dt-page-btn" disabled={page + 1 >= totalPages} onClick={() => setPage(p => p + 1)}>
                Next →
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
