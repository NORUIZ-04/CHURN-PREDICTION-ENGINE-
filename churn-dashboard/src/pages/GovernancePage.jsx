import { useEffect, useState } from "react";
import axios from "axios";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid,
  AreaChart, Area, ReferenceLine
} from "recharts";

import DriftStatusRow from "../components/DriftStatusRow";
import FairnessCard from "../components/FairnessCard";
import ConfidenceGauge from "../components/ConfidenceGauge";

const API = "http://localhost:8000/api/governance";

export default function GovernancePage() {

  const [report, setReport] = useState(null);
  const [drift, setDrift] = useState([]);
  const [history, setHistory] = useState([]);
  const [fairness, setFairness] = useState([]);
  const [loading, setLoading] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(false);

  const dataset_id = "processed_synthetic_5000";

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    try {
      const r = await axios.get(`${API}/report/${dataset_id}`);
      setReport(r.data);
      setDrift(r.data.adwin_results || []);
      setFairness(r.data.fairness_results || []);

      const h = await axios.get(`${API}/confidence-history/${dataset_id}`);
      setHistory(h.data || []);
    } catch (e) {
      console.error(e);
    }
  };

  const runAnalysis = async () => {
    setLoading(true);
    try {
      const res = await axios.post(`${API}/analyze`, {
        dataset_id,
        include_history: true
      });
      setReport(res.data);
      setDrift(res.data.adwin_results || []);
      setFairness(res.data.fairness_results || []);
    } catch (e) {
      alert("Failed");
    }
    setLoading(false);
  };

  useEffect(() => {
    if (!autoRefresh) return;

    const id = setInterval(async () => {
      const res = await axios.get(`${API}/drift-status`);
      setDrift(res.data.features || []);
    }, 30000);

    return () => clearInterval(id);
  }, [autoRefresh]);

  if (!report) return <div className="p-6">Loading...</div>;

  const confidence = report.confidence_result || {};

  return (
    <div className="p-6 space-y-6">

      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Governance Dashboard</h1>
          <p className="text-gray-400 text-sm">Model monitoring & reliability</p>
        </div>

        <div className="flex gap-3">
          <button onClick={runAnalysis} className="bg-blue-500 px-4 py-2 rounded">
            {loading ? "Running..." : "Run Analysis"}
          </button>

          <label className="flex items-center gap-2">
            <input type="checkbox" onChange={() => setAutoRefresh(!autoRefresh)} />
            Auto Refresh
          </label>
        </div>
      </div>

      {/* KPI */}
      <div className="grid grid-cols-4 gap-4">

        <div className="bg-gray-900 p-4 rounded">
          <ConfidenceGauge score={confidence.confidence_score || 0} />
        </div>

        <div className="bg-gray-900 p-4 rounded">
          <div className="text-xl">
            {drift.filter(d => d.status === "DRIFT").length}
          </div>
          <div className="text-gray-400">Drifted Features</div>
        </div>

        <div className="bg-gray-900 p-4 rounded">
          <div>
            {fairness.filter(f => f.overall_fairness === "COMPLIANT").length}
          </div>
          <div className="text-gray-400">Fairness Pass</div>
        </div>

        <div className="bg-gray-900 p-4 rounded">
          <div>{report.active_alerts?.length || 0}</div>
          <div className="text-gray-400">Alerts</div>
        </div>

      </div>

      {/* DRIFT */}
      <div className="grid grid-cols-2 gap-6">

        <div className="bg-gray-900 p-4 rounded">
          <h2 className="mb-4 font-semibold">Feature Drift</h2>

          {drift.map(f => (
            <DriftStatusRow key={f.feature} {...f} />
          ))}
        </div>

        <div className="bg-gray-900 p-4 rounded">
          <h2 className="mb-4 font-semibold">CUSUM</h2>

          <LineChart width={400} height={250} data={history}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Line dataKey="score" stroke="#00e5c3" />
          </LineChart>
        </div>

      </div>

      {/* FAIRNESS */}
      <div className="grid grid-cols-3 gap-4">
        {fairness.map(f => (
          <FairnessCard key={f.attribute_name} {...f} />
        ))}
      </div>

      {/* CONFIDENCE */}
      <div className="bg-gray-900 p-4 rounded">
        <h2 className="mb-4 font-semibold">Confidence History</h2>

        <AreaChart width={800} height={300} data={history}>
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Area dataKey="score" stroke="#00e5c3" fill="#00e5c3" />
          <ReferenceLine y={0.8} stroke="green" />
          <ReferenceLine y={0.6} stroke="orange" />
        </AreaChart>
      </div>

    </div>
  );
}