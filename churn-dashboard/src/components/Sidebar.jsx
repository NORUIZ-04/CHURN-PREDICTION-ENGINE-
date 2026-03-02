import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, Database, BarChart3, Brain,
  Clock, TrendingUp, DollarSign, ShieldCheck,
  Settings, Sparkles, LogOut
} from "lucide-react";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Mono:wght@300;400;500&display=swap');

  .sidebar {
    width: 240px;
    min-width: 240px;
    height: 100vh;
    background: #0a0d13;
    border-right: 1px solid rgba(255,255,255,0.05);
    display: flex;
    flex-direction: column;
    font-family: 'DM Mono', monospace;
    position: sticky;
    top: 0;
    overflow-y: auto;
    scrollbar-width: none;
  }
  .sidebar::-webkit-scrollbar { display: none; }

  .sb-logo {
    padding: 22px 20px;
    border-bottom: 1px solid rgba(255,255,255,0.05);
    display: flex; align-items: center; gap: 10px;
    flex-shrink: 0;
  }
  .sb-logo-icon {
    width: 32px; height: 32px;
    background: #00e5c3;
    border-radius: 7px;
    display: flex; align-items: center; justify-content: center;
    color: #080b10; font-weight: 900; font-size: 15px;
    flex-shrink: 0;
  }
  .sb-logo-text {
    font-family: 'Syne', sans-serif;
    font-size: 16px; font-weight: 800;
    letter-spacing: -0.5px;
    color: #e2e8f4;
  }
  .sb-logo-text span { color: #00e5c3; }

  .sb-nav {
    flex: 1;
    padding: 12px 10px;
    overflow-y: auto;
    scrollbar-width: none;
  }
  .sb-nav::-webkit-scrollbar { display: none; }

  .sb-section {
    font-size: 9px;
    letter-spacing: 2.5px;
    text-transform: uppercase;
    color: #2d3748;
    padding: 14px 10px 6px;
    font-weight: 500;
  }

  .sb-link {
    display: flex;
    align-items: center;
    gap: 9px;
    padding: 9px 10px;
    border-radius: 8px;
    font-size: 12px;
    color: #4a5568;
    text-decoration: none;
    transition: all 0.15s;
    margin-bottom: 1px;
    border: 1px solid transparent;
    white-space: nowrap;
  }
  .sb-link:hover {
    color: #e2e8f4;
    background: rgba(255,255,255,0.04);
  }
  .sb-link.active {
    color: #00e5c3;
    background: rgba(0,229,195,0.08);
    border-color: rgba(0,229,195,0.15);
  }
  .sb-link.active svg { color: #00e5c3; }
  .sb-link svg { flex-shrink: 0; opacity: 0.7; }
  .sb-link.active svg { opacity: 1; }

  .sb-footer {
    padding: 14px 16px;
    border-top: 1px solid rgba(255,255,255,0.05);
    flex-shrink: 0;
  }
  .sb-user {
    display: flex; align-items: center; gap: 10px;
    margin-bottom: 10px;
  }
  .sb-avatar {
    width: 30px; height: 30px;
    background: linear-gradient(135deg, #00e5c3, #0080ff);
    border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-size: 11px; font-weight: 700; color: #080b10;
    font-family: 'Syne', sans-serif;
    flex-shrink: 0;
  }
  .sb-user-info { flex: 1; min-width: 0; }
  .sb-user-name { font-size: 11px; font-weight: 500; color: #e2e8f4; }
  .sb-user-role { font-size: 10px; color: #2d3748; }
  .sb-logout {
    width: 100%;
    display: flex; align-items: center; gap: 8px;
    padding: 8px 10px;
    background: transparent;
    border: 1px solid rgba(255,77,109,0.15);
    border-radius: 8px;
    color: #4a5568;
    font-family: 'DM Mono', monospace;
    font-size: 11px;
    cursor: pointer;
    transition: all 0.2s;
  }
  .sb-logout:hover {
    border-color: rgba(255,77,109,0.4);
    color: #ff4d6d;
    background: rgba(255,77,109,0.05);
  }
  .sb-version {
    font-size: 9px; color: #1e2530;
    margin-top: 10px;
    letter-spacing: 1px;
    text-transform: uppercase;
  }
`;

const Section = ({ label }) => <p className="sb-section">{label}</p>;

const Link = ({ to, icon: Icon, label, end }) => (
  <NavLink
    to={to}
    end={end}
    className={({ isActive }) => `sb-link${isActive ? " active" : ""}`}
  >
    <Icon size={14} />
    {label}
  </NavLink>
);

export default function Sidebar() {
  const navigate = useNavigate();

  function logout() {
    localStorage.removeItem("admin_auth");
    navigate("/");
  }

  return (
    <>
      <style>{styles}</style>
      <aside className="sidebar">

        {/* LOGO */}
        <div className="sb-logo">
          <div className="sb-logo-icon">⚡</div>
          <div className="sb-logo-text">Churn<span>Guard</span></div>
        </div>

        {/* NAV */}
        <nav className="sb-nav">
          <Section label="Dashboard" />
          <Link to="/dashboard" end icon={LayoutDashboard} label="Command Center" />

          <Section label="Data" />
          <Link to="/dashboard/data" icon={Database} label="Data Source" />
          <Link to="/dashboard/overview" icon={BarChart3} label="Dataset Overview" />

          <Section label="Intelligence" />
          <Link to="/dashboard/churn" icon={TrendingUp} label="Churn Prediction" />
          <Link to="/dashboard/explain" icon={Brain} label="Explainability" />
          <Link to="/dashboard/time" icon={Clock} label="Time to Churn" />
          <Link to="/dashboard/uplift" icon={Sparkles} label="Uplift & Actions" />

          <Section label="Decisions" />
          <Link to="/dashboard/budget" icon={DollarSign} label="Budget Optimizer" />
          <Link to="/dashboard/executive-insights" icon={Sparkles} label="Executive Insights" />

          <Section label="Admin" />
          <Link to="/dashboard/governance" icon={ShieldCheck} label="Fairness & Gov." />
          <Link to="/dashboard/admin" icon={Settings} label="Admin Panel" />
        </nav>

        {/* FOOTER */}
        <div className="sb-footer">
          <div className="sb-user">
            <div className="sb-avatar">AD</div>
            <div className="sb-user-info">
              <div className="sb-user-name">Admin</div>
              <div className="sb-user-role">Decision Intelligence</div>
            </div>
          </div>
          <button className="sb-logout" onClick={logout}>
            <LogOut size={12} /> Sign Out
          </button>
          <div className="sb-version">ChurnGuard v3.2 · Live</div>
        </div>

      </aside>
    </>
  );
}
