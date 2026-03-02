import {
  BarChart, Bar, XAxis, YAxis,
  Tooltip, ResponsiveContainer
} from "recharts"

export default function ShapImportanceChart({ data = [] }) {

  const safe = Array.isArray(data)
    ? data.map(d => ({
        feature: String(d.feature),
        importance: Number(d.importance)
      }))
    : []

  return (
    <div className="card" style={{ height: 420 }}>

      <div className="font-semibold mb-3">
        Global SHAP Feature Importance
      </div>

      <ResponsiveContainer width="100%" height={340}>
        <BarChart
          data={safe}
          layout="vertical"
          margin={{ left: 40 }}
        >
          <XAxis type="number" />
          <YAxis
            dataKey="feature"
            type="category"
            width={180}
          />
          <Tooltip formatter={(v)=>Number(v).toFixed(4)} />
          <Bar dataKey="importance" />
        </BarChart>
      </ResponsiveContainer>

    </div>
  )
}
