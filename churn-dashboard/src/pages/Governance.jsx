import { useEffect, useState } from "react";
import { api } from "../api";

export default function Governance() {

  const [rep, setRep] = useState(null);

  useEffect(()=>{
    const datasetPath = useDatasetStore(s => s.datasetPath);
    api.get(`/dataset/histogram?path=${datasetPath}`)
      .then(r=>setRep(r.data))
      .catch(()=>{});
  },[]);

  if (!rep) return <div>Loading...</div>;

  return (
    <div>
      <h2>Fairness Audit</h2>

      <pre>
        {JSON.stringify(rep, null, 2)}
      </pre>
    </div>
  );
}
