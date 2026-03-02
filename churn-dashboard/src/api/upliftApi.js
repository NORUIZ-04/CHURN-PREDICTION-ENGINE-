import axios from "axios";

const API = "http://127.0.0.1:8000/uplift";

// ===== UPLIFT VECTOR =====
export const getUpliftVector = (row) =>
  axios.post(`${API}/action-vector`, row);

// ===== SINGLE CUSTOMER OPTIMIZE =====
export const optimizeAction = (row) =>
  axios.post(`${API}/optimize`, row);

// ===== SIMPLE BUDGET OPT =====
export const runBudgetOptimize = (rows, budget) =>
  axios.post(`${API}/optimize/simple`, {
    rows,
    budget,
    customer_value_col: "CLV",
    action_cost: 10
  });
  

// ===== TABLE =====
export const getUpliftTable = (rows) =>
  axios.post(`${API}/actions/table`, { rows });

// ===== CAMPAIGN =====
export const getCampaignAllocation = (payload) =>
  axios.post(`${API}/campaign/allocate`, payload);

// ===== EXPLAIN =====
export const getUpliftExplain = (row) =>
  axios.post(`${API}/explain/uplift`, row);

// ===== LLM =====
export const getLLMStrategy = (row) =>
  axios.post(`${API}/llm/uplift-strategy`, row);

// ===== STRATEGY COMPARE =====
export const compareStrategies = (payload) =>
  axios.post(`${API}/strategy/compare`, payload);

export const evaluateUpliftFile = (filename) =>
  axios.post(`${API}/evaluate/${filename}`);
