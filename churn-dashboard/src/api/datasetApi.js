import { api } from "../api"

export const datasetApi = {

  summary: (path) =>
    api.get("/dataset/summary", { params: { path } }),

  histogram: (path, column, bins = 20) =>
    api.get("/dataset/histogram", {
      params: { path, column, bins }
    }),

  segments: (path, column) =>
    api.get("/dataset/segments", {
      params: { path, column }
    }),

  columns: (path) =>
  api.get("/dataset/columns", { params: { path } }),

  segments: (path, column) =>
  api.get("/dataset/segments", { params: { path, column } }),

  numericBins: (path, column, bins=5) =>
  api.get("/dataset/numeric-bins", {
    params: { path, column, bins }
  }),

  drillSegment(path, column, value) {
    return api.get("/dataset/drilldown/segment", {
      params: { path, column, value }
    })
  },

  drillRange(path, column, low, high) {
    return api.get("/dataset/drilldown/range", {
      params: { path, column, low, high }
    })
  },

  explainSingle: (customerId, topK = 3) =>
  api.post(`/explain/single?customer_id=${customerId}&top_k=${topK}`),

  globalShap(filename) {
    return api.get(`/explain/global/${filename}`)
  },

  globalShap: (path, topK=20) =>
  api.get("/explain/global", {
    params: { path, top_k: topK }
  }),
  
  simulate: (row, action) =>
    api.post("/simulate/action", {
      row,
      action
    }),

    getGlobalShap: (filename) =>
  api.get(`/explain/global/${filename}`),

  getDecisions: (filename, budget=5000, limit=20) =>
    api.get(`/llm/decision_explain/${filename}?budget=${budget}&limit=${limit}`),

  /* ================= EXECUTIVE INSIGHTS (NEW) ================= */

  executiveInsights: (dataset) =>
    api.get("/insights/executive", {
      params: { dataset }
    }),
  
    getCommandCenter: (dataset) =>
      api.get("/dashboard/command-center", {
        params: { dataset }
      }),
      downloadExecutiveReport: (filename, budget = 5000) =>
  api.get(`/report/executive/${filename}`, {
    params: { budget },
    responseType: "blob"   // 🔥 IMPORTANT
  }),
}
