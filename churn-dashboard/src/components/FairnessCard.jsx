import { BarChart, Bar, XAxis, Tooltip } from "recharts";

export default function FairnessCard({
  attribute_name,
  group_0_positive_rate,
  group_1_positive_rate,
  dp_status,
  eo_status
}) {

  const data = [
    { name: "G0", value: group_0_positive_rate },
    { name: "G1", value: group_1_positive_rate }
  ];

  return (
    <div className="bg-gray-900 p-4 rounded">

      <h3>{attribute_name}</h3>

      <div>DP: {dp_status}</div>
      <div>EO: {eo_status}</div>

      <BarChart width={200} height={100} data={data}>
        <XAxis dataKey="name" />
        <Tooltip />
        <Bar dataKey="value" fill="#00e5c3" />
      </BarChart>

    </div>
  );
}