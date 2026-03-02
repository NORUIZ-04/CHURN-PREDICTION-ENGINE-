import axios from "axios";

export const runSimulation = (row) => {
  return axios.post(
    "http://127.0.0.1:8000/explain/simulate",
    row
  );
};
