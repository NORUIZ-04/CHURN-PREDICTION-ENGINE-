import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

const styles = `
  .sbc-tooltip {
    background: #161b24;
    border: 1px solid #2d3748;
    border-radius: 8px;
    padding: 10px 14px;
    font-family: 'DM Mono', monospace;
    font-size: 12px;
    color: #e2e8f4;
  }
  .sbc-tooltip-label { color: #4a5568; font-size: 10px; margin-bottom: 4px; }
  .sbc-tooltip-val { color: #00e5c3; font-weight: 600; font-size: 15px; }
`;

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="sbc-tooltip">
      <div className="sbc-tooltip-label">{String(label ?? "")}</div>
      <div className="sbc-tooltip-val">{Number(payload[0]?.value ?? 0).toLocaleString()}</div>
    </div>
  );
};

const BAR_COLORS = ["#00e5c3","#7c6aff","#ffc107","#ff4d6d","#0080ff","#ff8c42"];

export default function SegmentBarChart({ data = [], title, onBarClick }) {
  const safeData = Array.isArray(data)
    ? data.map(d => ({ segment: String(d.segment ?? ""), count: Number(d.count ?? 0) }))
    : [];

  return (
    <>
      <style>{styles}</style>
      <div style={{ width: "100%", height: 260 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={safeData}
            margin={{ top: 4, right: 4, left: -10, bottom: 20 }}
            style={{ cursor: onBarClick ? "pointer" : "default" }}
          >
            <XAxis
              dataKey="segment"
              tick={{ fontSize: 11, fill: "#4a5568", fontFamily: "DM Mono" }}
              axisLine={{ stroke: "#1e2530" }}
              tickLine={false}
              angle={safeData.length > 5 ? -30 : 0}
              textAnchor={safeData.length > 5 ? "end" : "middle"}
            />
            <YAxis
              tick={{ fontSize: 10, fill: "#4a5568", fontFamily: "DM Mono" }}
              axisLine={false}
              tickLine={false}
              width={36}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,255,255,0.04)" }} />
            <Bar
              dataKey="count"
              radius={[4, 4, 0, 0]}
              maxBarSize={56}
              onClick={(d) => onBarClick?.(d.payload)}
            >
              {safeData.map((_, i) => (
                <Cell key={i} fill={BAR_COLORS[i % BAR_COLORS.length]} opacity={0.85} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </>
  );
}
