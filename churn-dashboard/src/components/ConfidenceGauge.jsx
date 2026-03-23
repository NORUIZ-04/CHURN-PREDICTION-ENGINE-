import { RadialBarChart, RadialBar } from "recharts";

export default function ConfidenceGauge({ score }) {

  const data = [{ value: score * 100 }];

  return (
    <RadialBarChart width={200} height={200} data={data}>
      <RadialBar dataKey="value" fill="#00e5c3" />
      <text x="50%" y="50%" textAnchor="middle" fill="#fff">
        {score?.toFixed(2)}
      </text>
    </RadialBarChart>
  );
}