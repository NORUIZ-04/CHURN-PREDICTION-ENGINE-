import { useDatasetStore } from "../store/datasetStore";
import { useQuery } from "@tanstack/react-query";
import { datasetApi } from "../api/datasetApi";
import { useState } from "react";

import RiskHistogram from "../components/charts/RiskHistogram";
import SegmentBarChart from "../components/charts/SegmentBarChart";
import ChurnPieChart from "../components/charts/ChurnPieChart";
import DrilldownTable from "../components/DrilldownTable";
import ShapPanel from "../components/ShapPanel";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Mono:wght@300;400;500&display=swap');

  .do-root {
    font-family: 'DM Mono', monospace;
    color: #e2e8f4;
    animation: doFade 0.5s ease;
  }
  @keyframes doFade { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }

  /* HEADER */
  .do-header { margin-bottom: 32px; }
  .do-title {
    font-family: 'Syne', sans-serif;
    font-size: 28px; font-weight: 800;
    letter-spacing: -1px; line-height: 1.1;
  }
  .do-title span { color: #00e5c3; }
  .do-subtitle { font-size: 12px; color: #4a5568; margin-top: 6px; }

  /* KPI GRID */
  .do-kpi-grid {
    display: grid; grid-template-columns: repeat(4,1fr);
    gap: 14px; margin-bottom: 28px;
  }
  .do-kpi {
    background: #0f1218; border: 1px solid #1e2530;
    border-radius: 12px; padding: 20px 18px;
    position: relative; overflow: hidden; transition: all 0.2s;
  }
  .do-kpi:hover { border-color: rgba(0,229,195,0.2); transform: translateY(-2px); }
  .do-kpi-top { position:absolute;top:0;left:0;right:0;height:2px; }
  .do-kpi-label { font-size:10px;letter-spacing:1.5px;text-transform:uppercase;color:#4a5568;margin-bottom:10px; }
  .do-kpi-value {
    font-family: 'Syne', sans-serif;
    font-size: 28px; font-weight: 800;
    letter-spacing: -0.5px; line-height: 1;
  }

  /* PANEL */
  .do-panel {
    background: #0f1218; border: 1px solid #1e2530;
    border-radius: 12px; padding: 24px;
    margin-bottom: 20px; transition: border-color 0.2s;
  }
  .do-panel:hover { border-color: rgba(0,229,195,0.1); }
  .do-panel-header {
    display: flex; align-items: center; justify-content: space-between;
    margin-bottom: 20px;
  }
  .do-panel-title {
    font-family: 'Syne', sans-serif;
    font-size: 15px; font-weight: 700; letter-spacing: -0.3px;
  }
  .do-panel-badge {
    font-size: 10px; color: #4a5568;
    padding: 4px 10px; background: #161b24;
    border: 1px solid #1e2530; border-radius: 20px;
  }

  /* SEGMENT SELECTOR */
  .do-seg-wrap { display: flex; align-items: center; gap: 14px; flex-wrap: wrap; }
  .do-seg-label { font-size: 11px; color: #4a5568; letter-spacing: 1px; text-transform: uppercase; }
  .do-seg-select {
    font-family: 'DM Mono', monospace;
    font-size: 12px; color: #e2e8f4;
    background: #161b24;
    border: 1px solid #1e2530; border-radius: 9px;
    padding: 9px 14px; outline: none; cursor: pointer;
    transition: border-color 0.2s; min-width: 200px;
  }
  .do-seg-select:focus { border-color: #00e5c3; }
  .do-seg-select optgroup { background: #161b24; color: #4a5568; }
  .do-seg-select option { background: #161b24; color: #e2e8f4; }

  /* CHARTS GRID */
  .do-charts-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px; }

  /* DRILLDOWN PILL */
  .do-drill-label {
    display: inline-flex; align-items: center; gap: 8px;
    font-size: 11px; color: #00e5c3;
    padding: 5px 12px;
    background: rgba(0,229,195,0.08);
    border: 1px solid rgba(0,229,195,0.2);
    border-radius: 20px; margin-bottom: 14px;
  }

  /* EMPTY */
  .do-empty {
    display:flex;flex-direction:column;align-items:center;justify-content:center;
    min-height:60vh;text-align:center;gap:14px;
  }
  .do-empty-icon {
    width:72px;height:72px;background:#0f1218;border:1px solid #1e2530;
    border-radius:18px;display:flex;align-items:center;justify-content:center;
    font-size:32px;margin-bottom:8px;
  }
  .do-empty-title { font-family:'Syne',sans-serif;font-size:20px;font-weight:800;color:#e2e8f4; }
  .do-empty-sub { font-size:12px;color:#4a5568;line-height:1.9;max-width:340px; }

  .do-loading-bar { height:2px;background:#1e2530;border-radius:1px;overflow:hidden;margin-bottom:24px; }
  .do-loading-fill { height:100%;width:40%;background:linear-gradient(90deg,#00e5c3,#7c6aff);animation:loadSlide 1.2s ease-in-out infinite; }
  @keyframes loadSlide{0%{transform:translateX(-100%)}100%{transform:translateX(350%)}}
`;

export default function DatasetOverview() {
  const path = useDatasetStore(s => s.datasetPath);
  const [segmentCol, setSegmentCol] = useState("plan_type");
  const [drillRows, setDrillRows] = useState(null);
  const [drillLabel, setDrillLabel] = useState(null);
  const [shapData, setShapData] = useState(null);

  const summaryQ  = useQuery({ queryKey:["summary",path],  queryFn:()=>datasetApi.summary(path).then(r=>r.data),                           enabled:!!path });
  const histQ     = useQuery({ queryKey:["hist",path],     queryFn:()=>datasetApi.histogram(path,"monthly_usage").then(r=>r.data),         enabled:!!path });
  const colsQ     = useQuery({ queryKey:["columns",path],  queryFn:()=>datasetApi.columns(path).then(r=>r.data),                           enabled:!!path });
  const isNumeric = colsQ.data?.numeric?.includes(segmentCol);
  const segmentQ  = useQuery({ queryKey:["segment",path,segmentCol,isNumeric], queryFn:()=>isNumeric ? datasetApi.numericBins(path,segmentCol,6).then(r=>r.data) : datasetApi.segments(path,segmentCol).then(r=>r.data), enabled:!!path&&!!colsQ.data });
  const churnSegQ = useQuery({ queryKey:["churnSeg",path], queryFn:()=>datasetApi.segments(path,"churn").then(r=>r.data),                  enabled:!!path });

  const handleBarClick = async (bar) => {
    if (!bar?.segment) return;
    try {
      if (isNumeric) {
        const [low,high] = bar.segment.split("–").map(Number);
        const res = await datasetApi.drillRange(path,segmentCol,low,high);
        setDrillRows(res.data.rows); setDrillLabel(`${segmentCol} in ${bar.segment}`);
      } else {
        const res = await datasetApi.drillSegment(path,segmentCol,bar.segment);
        setDrillRows(res.data.rows); setDrillLabel(`${segmentCol} = ${bar.segment}`);
      }
    } catch(e) { console.error("Drilldown failed",e); }
  };

  const handleHistClick = async (bin) => {
    try {
      const res = await datasetApi.drillRange(path,"monthly_usage",bin.low,bin.high);
      setDrillRows(res.data.rows); setDrillLabel(`monthly_usage in ${bin.label}`);
    } catch(e) { console.error("Hist drill failed",e); }
  };

  const handleRowClick = async (row) => {
    try {
      const res = await datasetApi.explainSingle(row);
      setShapData(res.data);
    } catch(e) { console.error("SHAP failed",e); }
  };

  if (!path) return (
    <><style>{styles}</style>
    <div className="do-empty">
      <div className="do-empty-icon">◈</div>
      <div className="do-empty-title">No Dataset Loaded</div>
      <div className="do-empty-sub">Go to <strong style={{color:"#00e5c3"}}>Data Source</strong> and upload a CSV file to explore your dataset.</div>
    </div></>
  );

  const isLoading = summaryQ.isLoading || histQ.isLoading || colsQ.isLoading || segmentQ.isLoading || churnSegQ.isLoading;
  if (isLoading) return (
    <><style>{styles}</style>
    <div className="do-empty">
      <div className="do-loading-bar" style={{width:"320px"}}><div className="do-loading-fill"/></div>
      <div className="do-empty-title">Analyzing Dataset...</div>
      <div className="do-empty-sub">Loading summary statistics, histograms, and segmentation data.</div>
    </div></>
  );

  const summary   = summaryQ.data || {};
  const churnRate = typeof summary.churn_rate==="number" ? summary.churn_rate : 0;
  const histogramBins = Array.isArray(histQ.data?.histogram) ? histQ.data.histogram : [];

  let segmentData = [];
  if (isNumeric) {
    segmentData = (segmentQ.data?.bins||[]).map(b=>({ segment:`${Number(b.low).toFixed(1)}–${Number(b.high).toFixed(1)}`, count:Number(b.count??0) }));
  } else {
    const raw = segmentQ.data?.segments||{};
    segmentData = Object.entries(raw).map(([k,v])=>({ segment:String(k), count:Number(typeof v==="object"?v.count:v)||0 }));
  }

  const churnRaw = churnSegQ.data?.segments||{};
  const getCount = v => Number(typeof v==="object"?v.count:v)||0;
  const churned  = getCount(churnRaw["1"]);
  const active   = getCount(churnRaw["0"]);

  const kpis = [
    { label:"Total Customers", value:summary.total_rows?.toLocaleString() ?? 0, color:"#7c6aff" },
    { label:"Churn Rate",      value:`${(churnRate*100).toFixed(1)}%`,           color:"#ff4d6d" },
    { label:"Churned",         value:summary.churned?.toLocaleString() ?? 0,     color:"#ff4d6d" },
    { label:"Active",          value:summary.active?.toLocaleString() ?? 0,      color:"#00e5c3" },
  ];

  return (
    <><style>{styles}</style>
    <div className="do-root">

      {/* HEADER */}
      <div className="do-header">
        <div className="do-title">Dataset <span>Overview</span></div>
        <div className="do-subtitle">Exploratory analysis · Segmentation · Drilldown</div>
      </div>

      {/* KPI STRIP */}
      <div className="do-kpi-grid">
        {kpis.map((k,i) => (
          <div className="do-kpi" key={i}>
            <div className="do-kpi-top" style={{background:k.color,opacity:0.7}}/>
            <div className="do-kpi-label">{k.label}</div>
            <div className="do-kpi-value" style={{color:k.color}}>{k.value}</div>
          </div>
        ))}
      </div>

      {/* HISTOGRAM */}
      {histogramBins.length > 0 && (
        <div className="do-panel">
          <div className="do-panel-header">
            <div className="do-panel-title">Monthly Usage Distribution</div>
            <div className="do-panel-badge">Click a bar to drilldown</div>
          </div>
          <RiskHistogram bins={histogramBins} onBinClick={handleHistClick} />
        </div>
      )}

      {/* SEGMENT SELECTOR */}
      {colsQ.data && (
        <div className="do-panel">
          <div className="do-panel-header">
            <div className="do-panel-title">Segment Explorer</div>
            <div className="do-panel-badge">Select a column to segment by</div>
          </div>
          <div className="do-seg-wrap">
            <span className="do-seg-label">Segment by</span>
            <select className="do-seg-select" value={segmentCol} onChange={e=>setSegmentCol(e.target.value)}>
              <optgroup label="Categorical">
                {colsQ.data.categorical.map(c=><option key={c} value={c}>{c}</option>)}
              </optgroup>
              <optgroup label="Numeric">
                {colsQ.data.numeric.map(c=><option key={c} value={c}>{c}</option>)}
              </optgroup>
            </select>
          </div>
        </div>
      )}

      {/* CHARTS */}
      <div className="do-charts-grid">
        {segmentData.length > 0 && (
          <div className="do-panel" style={{marginBottom:0}}>
            <div className="do-panel-header">
              <div className="do-panel-title">Segmentation — {segmentCol}</div>
              <div className="do-panel-badge">Click to drill</div>
            </div>
            <SegmentBarChart data={segmentData} title={`Segmentation — ${segmentCol}`} onBarClick={handleBarClick} />
          </div>
        )}
        {(churned+active) > 0 && (
          <div className="do-panel" style={{marginBottom:0}}>
            <div className="do-panel-header">
              <div className="do-panel-title">Churn vs Active</div>
              <div className="do-panel-badge">{churned+active} total</div>
            </div>
            <ChurnPieChart churned={churned} active={active} />
          </div>
        )}
      </div>

      {/* DRILLDOWN */}
      {drillRows && (
        <div className="do-panel">
          <div className="do-panel-header">
            <div className="do-panel-title">Drilldown Results</div>
            <div className="do-drill-label">◉ {drillLabel}</div>
          </div>
          <DrilldownTable rows={drillRows} label={drillLabel} onRowClick={handleRowClick} />
        </div>
      )}

      {/* SHAP PANEL */}
      {shapData && (
        <div className="do-panel">
          <div className="do-panel-header">
            <div className="do-panel-title">SHAP Explanation</div>
            <div className="do-panel-badge">Single customer analysis</div>
          </div>
          <ShapPanel shap={shapData} />
        </div>
      )}

    </div></>
  );
}
