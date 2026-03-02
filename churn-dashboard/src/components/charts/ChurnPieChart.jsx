import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";

const styles = `
  .cpc-wrap {
    width: 100%; height: 300px;
    font-family: 'DM Mono', monospace;
  }
  .cpc-tooltip {
    background: #161b24;
    border: 1px solid #2d3748;
    border-radius: 8px;
    padding: 10px 14px;
    font-family: 'DM Mono', monospace;
    font-size: 12px;
    color: #e2e8f4;
  }
  .cpc-tooltip-label { color: #4a5568; font-size: 10px; margin-bottom: 4px; }
  .cpc-legend {
    display: flex; justify-content: center; gap: 20px;
    margin-top: 12px;
  }
  .cpc-legend-item { display: flex; align-items: center; gap: 6px; font-size: 11px; color: #6b7a95; }
  .cpc-legend-dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }
`;

const COLORS = ["#ff4d6d", "#00e5c3"];

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="cpc-tooltip">
      <div className="cpc-tooltip-label">{payload[0].name}</div>
      <div style={{ color: payload[0].fill, fontWeight: 600, fontSize: 16 }}>
        {payload[0].value?.toLocaleString()}
      </div>
      <div style={{ fontSize: 10, color: "#4a5568", marginTop: 2 }}>
        {((payload[0].value / (payload[0].value + (payload[1]?.value ?? 0))) * 100).toFixed(1)}% of total
      </div>
    </div>
  );
};

export default function ChurnPieChart({ churned, active }) {
  const data = [
    { name: "Churned", value: churned },
    { name: "Active",  value: active  },
  ];
  const total = churned + active;

  return (
    <>
      <style>{styles}</style>
      <div className="cpc-wrap">
        <ResponsiveContainer width="100%" height={240}>
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={95}
              paddingAngle={3}
              strokeWidth={0}
            >
              {data.map((_, i) => (
                <Cell key={i} fill={COLORS[i]} opacity={0.9} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
        <div className="cpc-legend">
          <div className="cpc-legend-item">
            <div className="cpc-legend-dot" style={{ background: "#ff4d6d" }} />
            Churned · {churned?.toLocaleString()} ({total ? ((churned/total)*100).toFixed(1) : 0}%)
          </div>
          <div className="cpc-legend-item">
            <div className="cpc-legend-dot" style={{ background: "#00e5c3" }} />
            Active · {active?.toLocaleString()} ({total ? ((active/total)*100).toFixed(1) : 0}%)
          </div>
        </div>
      </div>
    </>
  );
}
