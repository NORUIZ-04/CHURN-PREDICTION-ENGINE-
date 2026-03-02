import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children }) {

  const ok = localStorage.getItem("admin_auth");

  if (!ok) return <Navigate to="/login" />;

  return children;
}
