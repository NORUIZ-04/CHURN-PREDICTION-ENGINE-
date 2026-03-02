import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Mono:wght@300;400;500&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  .dashboard-root {
    display: flex;
    min-height: 100vh;
    background: #080b10;
    font-family: 'DM Mono', monospace;
    color: #e2e8f4;
    position: relative;
  }

  /* subtle grid on main area */
  .dashboard-root::before {
    content: '';
    position: fixed; inset: 0;
    background-image:
      linear-gradient(rgba(0,229,195,0.018) 1px, transparent 1px),
      linear-gradient(90deg, rgba(0,229,195,0.018) 1px, transparent 1px);
    background-size: 48px 48px;
    pointer-events: none; z-index: 0;
  }

  .main-area {
    flex: 1;
    min-width: 0;
    overflow-y: auto;
    position: relative;
    z-index: 1;
  }

  .main-content {
    padding: 36px 40px;
    min-height: 100vh;
  }

  /* Scrollbar styling for main area */
  .main-area::-webkit-scrollbar { width: 4px; }
  .main-area::-webkit-scrollbar-track { background: transparent; }
  .main-area::-webkit-scrollbar-thumb { background: #1e2530; border-radius: 2px; }
  .main-area::-webkit-scrollbar-thumb:hover { background: #2d3748; }
`;

export default function DashboardLayout() {
  return (
    <>
      <style>{styles}</style>
      <div className="dashboard-root">
        <Sidebar />
        <main className="main-area">
          <div className="main-content">
            <Outlet />
          </div>
        </main>
      </div>
    </>
  );
}
