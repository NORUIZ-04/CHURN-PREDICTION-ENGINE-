import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Mono:wght@300;400;500&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  .login-root {
    font-family: 'DM Mono', monospace;
    background: #080b10;
    color: #e2e8f4;
    min-height: 100vh;
    display: flex;
    position: relative;
    overflow: hidden;
  }

  /* Grid */
  .login-root::before {
    content: '';
    position: fixed; inset: 0;
    background-image:
      linear-gradient(rgba(0,229,195,0.025) 1px, transparent 1px),
      linear-gradient(90deg, rgba(0,229,195,0.025) 1px, transparent 1px);
    background-size: 48px 48px;
    pointer-events: none; z-index: 0;
  }

  /* LEFT PANEL */
  .login-left {
    position: relative; z-index: 1;
    flex: 1;
    display: flex; flex-direction: column;
    justify-content: space-between;
    padding: 48px 56px;
    border-right: 1px solid rgba(255,255,255,0.05);
    background: linear-gradient(135deg, rgba(0,229,195,0.03) 0%, transparent 60%);
  }

  .login-left-logo {
    display: flex; align-items: center; gap: 10px;
    font-family: 'Syne', sans-serif;
    font-size: 20px; font-weight: 800;
    letter-spacing: -0.5px;
  }
  .login-left-logo-icon {
    width: 36px; height: 36px;
    background: #00e5c3;
    border-radius: 8px;
    display: flex; align-items: center; justify-content: center;
    color: #080b10; font-size: 16px; font-weight: 900;
  }
  .login-left-logo span { color: #00e5c3; }

  .login-left-center { flex: 1; display: flex; flex-direction: column; justify-content: center; padding: 60px 0; }
  .login-left-eyebrow {
    font-size: 10px; letter-spacing: 3px; text-transform: uppercase;
    color: #00e5c3; margin-bottom: 24px;
    display: flex; align-items: center; gap: 8px;
  }
  .login-left-eyebrow::before {
    content: ''; display: block;
    width: 24px; height: 1px; background: #00e5c3;
  }
  .login-left-headline {
    font-family: 'Syne', sans-serif;
    font-size: clamp(32px, 3.5vw, 52px);
    font-weight: 800;
    line-height: 1.1;
    letter-spacing: -1.5px;
    margin-bottom: 24px;
  }
  .login-left-headline span { color: #00e5c3; }
  .login-left-desc {
    font-size: 13px; line-height: 1.9;
    color: #4a5568;
    max-width: 400px;
    margin-bottom: 48px;
  }

  .feature-list { display: flex; flex-direction: column; gap: 16px; }
  .feature-item {
    display: flex; align-items: center; gap: 14px;
    font-size: 12px; color: #6b7a95;
  }
  .feature-item-dot {
    width: 8px; height: 8px;
    border-radius: 50%;
    flex-shrink: 0;
  }

  .login-left-footer {
    font-size: 11px; color: #2d3748;
    display: flex; align-items: center; gap: 8px;
  }
  .login-status-dot { width: 6px; height: 6px; background: #00e5c3; border-radius: 50%; animation: pulse 2s infinite; }
  @keyframes pulse { 0%,100%{opacity:1;}50%{opacity:0.3;} }

  /* RIGHT PANEL */
  .login-right {
    position: relative; z-index: 1;
    width: 480px;
    display: flex; flex-direction: column;
    justify-content: center;
    padding: 60px 56px;
  }

  .login-card-header { margin-bottom: 40px; }
  .login-card-title {
    font-family: 'Syne', sans-serif;
    font-size: 26px; font-weight: 800;
    letter-spacing: -0.5px;
    margin-bottom: 8px;
  }
  .login-card-sub { font-size: 12px; color: #4a5568; }

  .form-group { margin-bottom: 20px; }
  .form-label {
    display: block;
    font-size: 10px; letter-spacing: 1.5px; text-transform: uppercase;
    color: #4a5568; margin-bottom: 8px;
    font-weight: 500;
  }
  .form-input-wrap { position: relative; }
  .form-input-icon {
    position: absolute; left: 14px; top: 50%; transform: translateY(-50%);
    font-size: 14px; color: #2d3748;
    pointer-events: none;
  }
  .form-input {
    width: 100%;
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 10px;
    padding: 13px 14px 13px 40px;
    font-family: 'DM Mono', monospace;
    font-size: 13px; color: #e2e8f4;
    outline: none;
    transition: all 0.2s;
  }
  .form-input::placeholder { color: #2d3748; }
  .form-input:focus {
    border-color: #00e5c3;
    background: rgba(0,229,195,0.04);
    box-shadow: 0 0 0 3px rgba(0,229,195,0.08);
  }
  .form-input.error { border-color: #ff4d6d; background: rgba(255,77,109,0.04); }

  .error-msg {
    margin-top: 8px;
    font-size: 11px; color: #ff4d6d;
    display: flex; align-items: center; gap: 6px;
    animation: shake 0.4s ease;
  }
  @keyframes shake {
    0%,100%{transform:translateX(0);}
    20%,60%{transform:translateX(-4px);}
    40%,80%{transform:translateX(4px);}
  }

  .form-divider {
    border: none;
    border-top: 1px solid rgba(255,255,255,0.05);
    margin: 8px 0 20px;
  }

  .btn-login {
    width: 100%;
    font-family: 'Syne', sans-serif;
    font-size: 15px; font-weight: 700;
    padding: 15px;
    background: #00e5c3;
    color: #080b10;
    border: none; border-radius: 10px;
    cursor: pointer;
    transition: all 0.2s;
    letter-spacing: -0.3px;
    display: flex; align-items: center; justify-content: center; gap: 8px;
    position: relative; overflow: hidden;
  }
  .btn-login:hover:not(:disabled) {
    background: #00ffd5;
    transform: translateY(-1px);
    box-shadow: 0 8px 24px rgba(0,229,195,0.28);
  }
  .btn-login:disabled { opacity: 0.6; cursor: not-allowed; }
  .btn-login .spinner {
    width: 16px; height: 16px;
    border: 2px solid rgba(0,0,0,0.2);
    border-top-color: #080b10;
    border-radius: 50%;
    animation: spin 0.6s linear infinite;
  }
  @keyframes spin { to { transform: rotate(360deg); } }

  .login-hint {
    margin-top: 24px;
    padding: 14px;
    background: rgba(255,255,255,0.02);
    border: 1px solid rgba(255,255,255,0.05);
    border-radius: 10px;
    font-size: 11px; color: #2d3748;
    line-height: 1.7;
  }
  .login-hint strong { color: #4a5568; }

  .login-back {
    margin-top: 28px;
    font-size: 12px; color: #2d3748;
    text-align: center;
  }
  .login-back a { color: #00e5c3; text-decoration: none; }
  .login-back a:hover { text-decoration: underline; }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(16px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .login-right { animation: fadeUp 0.6s ease 0.1s both; }
  .login-left { animation: fadeUp 0.6s ease both; }
`;

export default function Login() {
  const [id, setId] = useState("");
  const [pw, setPw] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();

  function login() {
    setError("");
    if (!id || !pw) { setError("Please fill in all fields."); return; }
    setLoading(true);
    setTimeout(() => {
      if (id === "admin" && pw === "admin123") {
        localStorage.setItem("admin_auth", "1");
        nav("/dashboard/data");
      } else {
        setError("Invalid credentials. Please try again.");
        setLoading(false);
      }
    }, 900);
  }

  function handleKey(e) { if (e.key === "Enter") login(); }

  return (
    <>
      <style>{styles}</style>
      <div className="login-root">

        {/* LEFT */}
        <div className="login-left">
          <div className="login-left-logo">
            <div className="login-left-logo-icon">⚡</div>
            Churn<span>Guard</span>
          </div>

          <div className="login-left-center">
            <div className="login-left-eyebrow">Admin Access</div>
            <h1 className="login-left-headline">
              Retention<br />Intelligence<br /><span>Command Center</span>
            </h1>
            <p className="login-left-desc">
              Secure access to the full churn prediction suite — 
              ML models, uplift analysis, budget optimizer, and executive reports.
            </p>
            <div className="feature-list">
              {[
                { color: "#00e5c3", label: "Churn prediction with 91.7% accuracy" },
                { color: "#ff4d6d", label: "Uplift modeling & treatment optimization" },
                { color: "#ffc107", label: "Survival analysis & time-to-churn" },
                { color: "#7c6aff", label: "AI-powered executive insights" },
              ].map((f, i) => (
                <div className="feature-item" key={i}>
                  <div className="feature-item-dot" style={{ background: f.color }} />
                  {f.label}
                </div>
              ))}
            </div>
          </div>

          <div className="login-left-footer">
            <div className="login-status-dot" />
            Model v3.2 · All systems online
          </div>
        </div>

        {/* RIGHT */}
        <div className="login-right">
          <div className="login-card-header">
            <div className="login-card-title">Welcome back</div>
            <div className="login-card-sub">Sign in to your admin account to continue</div>
          </div>

          <div className="form-group">
            <label className="form-label">Admin ID</label>
            <div className="form-input-wrap">
              <span className="form-input-icon">◉</span>
              <input
                className={`form-input${error ? " error" : ""}`}
                placeholder="Enter your admin ID"
                value={id}
                onChange={e => setId(e.target.value)}
                onKeyDown={handleKey}
                autoComplete="username"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div className="form-input-wrap">
              <span className="form-input-icon">◈</span>
              <input
                className={`form-input${error ? " error" : ""}`}
                type="password"
                placeholder="Enter your password"
                value={pw}
                onChange={e => setPw(e.target.value)}
                onKeyDown={handleKey}
                autoComplete="current-password"
              />
            </div>
            {error && (
              <div className="error-msg">
                ⚠ {error}
              </div>
            )}
          </div>

          <hr className="form-divider" />

          <button className="btn-login" onClick={login} disabled={loading}>
            {loading
              ? <><div className="spinner" /> Authenticating...</>
              : <>Access Dashboard →</>
            }
          </button>

          <div className="login-hint">
            <strong>Demo credentials:</strong><br />
            ID: <strong>admin</strong> · Password: <strong>admin123</strong>
          </div>

          <div className="login-back">
            <Link to="/">← Back to home</Link>
          </div>
        </div>

      </div>
    </>
  );
}
