export default function DriftStatusRow({ feature, status, change_magnitude }) {

  const color =
    status === "DRIFT" ? "text-red-500" :
    status === "WARNING" ? "text-yellow-400" :
    "text-green-400";

  return (
    <div className="flex justify-between text-sm py-2 border-b border-gray-800">
      <div>{feature}</div>
      <div className={color}>{status}</div>
      <div>{change_magnitude?.toFixed(2)}</div>
    </div>
  );
}