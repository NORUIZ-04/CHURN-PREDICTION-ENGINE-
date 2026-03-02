import axios from "axios";

const API = "http://127.0.0.1:8000";

export function getTtcSummary(filename) {
  return axios.get(`/timetochurn/summary/${filename}`);
}
