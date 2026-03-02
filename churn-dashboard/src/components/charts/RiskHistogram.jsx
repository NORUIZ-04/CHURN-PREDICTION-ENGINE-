import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

const styles = `
  .rh-tooltip {
    background: #161b24;
    border: 1px solid #2d3748;
    border-radius: 8px;
    padding: 10px 14px;
    font-family: 'DM Mono', monospace;
    font-size: 12px;
    color: #e2e8f4;
  }
  .rh-tooltip-label { color: #4a5568; font-size: 10px; margin-bottom: 4px; }
  .rh-tooltip-val { color: #7c6aff; font-weight: 600; font-size: 15px; }
`;

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rh-tooltip">
      <div className="rh-tooltip-label">Range: {String(label ?? "")}</div>
      <div className="rh-tooltip-val">{Number(payload[0]?.value ?? 0).toLocaleString()} customers</div>
    </div>
  );
};

// Color bars from teal → purple → red based on index position
function binColor(i, total) {
  const pct = i / Math.max(total - 1, 1);
  if (pct < 0.33) return "#00e5c3";
  if (pct < 0.66) return "#7c6aff";
  return "#ff4d6d";
}

export default function RiskHistogram({ bins = [], onBinClick }) {
  const data = bins.map(b => ({
    label: `${Number(b.bin_start).toFixed(1)}–${Number(b.bin_end).toFixed(1)}`,
    count: Number(b.count ?? 0),
    low:   Number(b.bin_start),
    high:  Number(b.bin_end),
  }));

  return (
    <>
      <style>{styles}</style>
      <div style={{ width: "100%", height: 260 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 4, right: 4, left: -10, bottom: 4 }}
            style={{ cursor: onBinClick ? "pointer" : "default" }}
          >
            <XAxis
              dataKey="label"
              tick={{ fontSize: 10, fill: "#4a5568", fontFamily: "DM Mono" }}
              axisLine={{ stroke: "#1e2530" }}
              tickLine={false}
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
              maxBarSize={52}
              onClick={(d) => onBinClick?.(d.payload)}
            >
              {data.map((_, i) => (
                <Cell key={i} fill={binColor(i, data.length)} opacity={0.85} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </>
  );
}
