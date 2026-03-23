import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Home from "./pages/Home";
import Login from "./pages/Login";
import DashboardLayout from "./pages/DashboardLayout";

import DataSource from "./pages/DataSource";
import DatasetOverview from "./pages/DatasetOverview";
import ChurnPrediction from "./pages/ChurnPrediction";
import Explainability from "./pages/Explainability";
import TimeToChurn from "./pages/TimeToChurn";
import UpliftActions from "./pages/UpliftActions";
import BudgetOptimizer from "./pages/BudgetOptimizer";
import AdminPanel from "./pages/AdminPanel";
import GovernancePage from "./pages/GovernancePage";
import ExecutiveInsights from "./pages/ExecutiveInsights";
import CommandCenter from "./pages/CommandCenter";

import ProtectedRoute from "./components/ProtectedRoute";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* ================= PUBLIC ================= */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />

        {/* ================= DASHBOARD ================= */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          {/* DEFAULT */}
          <Route index element={<CommandCenter />} />

          {/* DATA */}
          <Route path="data" element={<DataSource />} />
          <Route path="overview" element={<DatasetOverview />} />

          {/* INTELLIGENCE */}
          <Route path="churn" element={<ChurnPrediction />} />
          <Route path="explain" element={<Explainability />} />
          <Route path="time" element={<TimeToChurn />} />
          <Route path="uplift" element={<UpliftActions />} />

          {/* DECISION */}
          <Route path="budget" element={<BudgetOptimizer />} />

          {/* GOVERNANCE */}
          <Route path="governance" element={<GovernancePage />} />

          {/* ADMIN */}
          <Route path="admin" element={<AdminPanel />} />

          {/* EXECUTIVE */}
          <Route path="executive-insights" element={<ExecutiveInsights />} />

        </Route>

        {/* fallback */}
        <Route path="*" element={<Navigate to="/" />} />

      </Routes>
    </BrowserRouter>
  );
}