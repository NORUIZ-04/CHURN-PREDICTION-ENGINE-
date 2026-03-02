import { Link } from "react-router-dom";
import { useEffect, useState } from "react";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Mono:wght@300;400;500&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  .home-root {
    font-family: 'DM Mono', monospace;
    background: #080b10;
    color: #e2e8f4;
    min-height: 100vh;
    overflow-x: hidden;
    position: relative;
  }

  /* Grid background */
  .home-root::before {
    content: '';
    position: fixed;
    inset: 0;
    background-image:
      linear-gradient(rgba(0,229,195,0.025) 1px, transparent 1px),
      linear-gradient(90deg, rgba(0,229,195,0.025) 1px, transparent 1px);
    background-size: 48px 48px;
    pointer-events: none;
    z-index: 0;
  }

  /* Glow orbs */
  .orb {
    position: fixed;
    border-radius: 50%;
    pointer-events: none;
    z-index: 0;
    filter: blur(80px);
    opacity: 0.55;
  }
  .orb-1 {
    width: 500px; height: 500px;
    background: radial-gradient(circle, rgba(0,229,195,0.18), transparent 70%);
    top: -120px; right: -80px;
    animation: floatOrb 8s ease-in-out infinite;
  }
  .orb-2 {
    width: 400px; height: 400px;
    background: radial-gradient(circle, rgba(100,80,255,0.14), transparent 70%);
    bottom: 80px; left: -100px;
    animation: floatOrb 10s ease-in-out infinite reverse;
  }
  @keyframes floatOrb {
    0%, 100% { transform: translate(0, 0); }
    50% { transform: translate(20px, 30px); }
  }

  /* NAV */
  .nav {
    position: fixed; top: 0; left: 0; right: 0;
    z-index: 100;
    display: flex; align-items: center; justify-content: space-between;
    padding: 18px 56px;
    border-bottom: 1px solid rgba(255,255,255,0.05);
    background: rgba(8,11,16,0.8);
    backdrop-filter: blur(12px);
  }
  .nav-logo {
    display: flex; align-items: center; gap: 10px;
    font-family: 'Syne', sans-serif;
    font-size: 18px; font-weight: 800;
    letter-spacing: -0.5px;
  }
  .nav-logo-icon {
    width: 32px; height: 32px;
    background: #00e5c3;
    border-radius: 7px;
    display: flex; align-items: center; justify-content: center;
    font-size: 15px; color: #080b10; font-weight: 900;
  }
  .nav-logo span { color: #00e5c3; }
  .nav-pill {
    font-size: 10px; letter-spacing: 2px;
    padding: 4px 10px;
    border: 1px solid rgba(0,229,195,0.3);
    border-radius: 20px;
    color: #00e5c3;
  }
  .nav-login-btn {
    font-family: 'DM Mono', monospace;
    font-size: 12px; font-weight: 500;
    padding: 9px 22px;
    background: transparent;
    border: 1px solid rgba(255,255,255,0.15);
    border-radius: 8px;
    color: #e2e8f4;
    cursor: pointer;
    text-decoration: none;
    transition: all 0.2s;
    display: inline-block;
  }
  .nav-login-btn:hover {
    border-color: #00e5c3;
    color: #00e5c3;
    background: rgba(0,229,195,0.05);
  }

  /* HERO */
  .hero {
    position: relative; z-index: 1;
    min-height: 100vh;
    display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    text-align: center;
    padding: 120px 32px 80px;
  }
  .hero-eyebrow {
    display: inline-flex; align-items: center; gap: 8px;
    font-size: 11px; letter-spacing: 2.5px; text-transform: uppercase;
    color: #00e5c3;
    margin-bottom: 28px;
    padding: 6px 16px;
    border: 1px solid rgba(0,229,195,0.25);
    border-radius: 20px;
    background: rgba(0,229,195,0.06);
    opacity: 0;
    animation: fadeUp 0.7s ease 0.1s forwards;
  }
  .eyebrow-dot {
    width: 6px; height: 6px;
    background: #00e5c3;
    border-radius: 50%;
    animation: pulse 2s infinite;
  }
  @keyframes pulse {
    0%,100%{opacity:1;transform:scale(1);}
    50%{opacity:0.4;transform:scale(0.7);}
  }

  .hero-title {
    font-family: 'Syne', sans-serif;
    font-size: clamp(40px, 6vw, 80px);
    font-weight: 800;
    line-height: 1.05;
    letter-spacing: -2px;
    max-width: 900px;
    margin-bottom: 28px;
    opacity: 0;
    animation: fadeUp 0.7s ease 0.2s forwards;
  }
  .hero-title .accent { color: #00e5c3; }
  .hero-title .accent2 { color: #ff4d6d; }

  .hero-sub {
    font-size: 15px; line-height: 1.8;
    color: #6b7a95;
    max-width: 560px;
    margin-bottom: 48px;
    opacity: 0;
    animation: fadeUp 0.7s ease 0.3s forwards;
  }

  .hero-actions {
    display: flex; align-items: center; gap: 14px;
    opacity: 0;
    animation: fadeUp 0.7s ease 0.4s forwards;
  }
  .btn-cta {
    font-family: 'Syne', sans-serif;
    font-size: 14px; font-weight: 700;
    padding: 14px 32px;
    background: #00e5c3;
    color: #080b10;
    border: none; border-radius: 10px;
    cursor: pointer; text-decoration: none;
    display: inline-block;
    transition: all 0.2s;
    letter-spacing: -0.3px;
  }
  .btn-cta:hover {
    background: #00ffd5;
    transform: translateY(-2px);
    box-shadow: 0 12px 32px rgba(0,229,195,0.25);
  }
  .btn-secondary {
    font-family: 'DM Mono', monospace;
    font-size: 13px; font-weight: 400;
    padding: 14px 28px;
    background: transparent;
    color: #6b7a95;
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 10px;
    cursor: pointer; text-decoration: none;
    display: inline-block;
    transition: all 0.2s;
  }
  .btn-secondary:hover { color: #e2e8f4; border-color: rgba(255,255,255,0.2); }

  /* TICKER */
  .ticker-wrap {
    margin-top: 80px;
    width: 100%; max-width: 900px;
    opacity: 0;
    animation: fadeUp 0.7s ease 0.5s forwards;
  }
  .ticker-label {
    font-size: 10px; letter-spacing: 2px; text-transform: uppercase;
    color: #3a4558; margin-bottom: 20px;
  }
  .ticker-cards {
    display: grid; grid-template-columns: repeat(4, 1fr);
    gap: 1px;
    background: rgba(255,255,255,0.05);
    border: 1px solid rgba(255,255,255,0.05);
    border-radius: 12px;
    overflow: hidden;
  }
  .ticker-card {
    background: rgba(255,255,255,0.02);
    padding: 22px 20px;
    text-align: left;
    transition: background 0.2s;
  }
  .ticker-card:hover { background: rgba(0,229,195,0.04); }
  .ticker-val {
    font-family: 'Syne', sans-serif;
    font-size: 26px; font-weight: 800;
    color: #e2e8f4;
    margin-bottom: 4px;
  }
  .ticker-val .unit { font-size: 14px; color: #00e5c3; }
  .ticker-desc { font-size: 10px; color: #3a4558; letter-spacing: 1px; text-transform: uppercase; }

  /* FEATURES SECTION */
  .features {
    position: relative; z-index: 1;
    padding: 100px 56px;
    max-width: 1200px;
    margin: 0 auto;
  }
  .section-label {
    font-size: 10px; letter-spacing: 3px; text-transform: uppercase;
    color: #00e5c3; margin-bottom: 16px;
  }
  .section-title {
    font-family: 'Syne', sans-serif;
    font-size: clamp(28px, 4vw, 42px);
    font-weight: 800;
    letter-spacing: -1px;
    margin-bottom: 60px;
    max-width: 480px;
    line-height: 1.1;
  }
  .features-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;
  }
  .feature-card {
    background: rgba(255,255,255,0.02);
    border: 1px solid rgba(255,255,255,0.06);
    border-radius: 14px;
    padding: 28px;
    transition: all 0.25s;
    position: relative;
    overflow: hidden;
  }
  .feature-card::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, rgba(0,229,195,0.04), transparent);
    opacity: 0;
    transition: opacity 0.25s;
  }
  .feature-card:hover { border-color: rgba(0,229,195,0.2); transform: translateY(-3px); }
  .feature-card:hover::before { opacity: 1; }
  .feature-icon {
    width: 40px; height: 40px;
    border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
    font-size: 18px;
    margin-bottom: 18px;
  }
  .feature-name {
    font-family: 'Syne', sans-serif;
    font-size: 15px; font-weight: 700;
    margin-bottom: 10px;
    letter-spacing: -0.3px;
  }
  .feature-desc {
    font-size: 12px; line-height: 1.8;
    color: #4a5568;
  }

  /* FOOTER STRIP */
  .footer-strip {
    position: relative; z-index: 1;
    border-top: 1px solid rgba(255,255,255,0.05);
    padding: 28px 56px;
    display: flex; align-items: center; justify-content: space-between;
  }
  .footer-copy { font-size: 11px; color: #2d3748; }
  .footer-badge {
    font-size: 10px; color: #2d3748;
    display: flex; align-items: center; gap: 6px;
  }
  .footer-online { width: 6px; height: 6px; background: #00e5c3; border-radius: 50%; }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;

const features = [
  {
    icon: "◈", color: "rgba(0,229,195,0.12)", iconColor: "#00e5c3",
    name: "Churn Prediction Engine",
    desc: "ML-powered probability scores for every customer. Identify at-risk accounts before they leave."
  },
  {
    icon: "⊹", color: "rgba(255,77,109,0.12)", iconColor: "#ff4d6d",
    name: "Uplift Modeling",
    desc: "Go beyond prediction. Know which customers will respond to intervention and which won't."
  },
  {
    icon: "◷", color: "rgba(255,193,7,0.12)", iconColor: "#ffc107",
    name: "Time to Churn",
    desc: "Survival analysis that estimates exactly when a customer is likely to churn — down to the week."
  },
  {
    icon: "◉", color: "rgba(124,106,255,0.12)", iconColor: "#7c6aff",
    name: "Budget Optimizer",
    desc: "Allocate retention spend intelligently across segments using knapsack optimization algorithms."
  },
  {
    icon: "◫", color: "rgba(0,229,195,0.12)", iconColor: "#00e5c3",
    name: "SHAP Explainability",
    desc: "Full model transparency. Understand exactly why each customer received their risk score."
  },
  {
    icon: "⊛", color: "rgba(255,193,7,0.12)", iconColor: "#ffc107",
    name: "Executive Insights",
    desc: "AI-generated narrative reports and strategic recommendations ready for leadership."
  },
];

export default function Home() {
  const [count, setCount] = useState({ customers: 0, accuracy: 0, revenue: 0, saved: 0 });

  useEffect(() => {
    const targets = { customers: 12000, accuracy: 917, revenue: 34, saved: 2400 };
    const duration = 1800;
    const steps = 60;
    const interval = duration / steps;
    let step = 0;
    const timer = setInterval(() => {
      step++;
      const progress = step / steps;
      const ease = 1 - Math.pow(1 - progress, 3);
      setCount({
        customers: Math.floor(targets.customers * ease),
        accuracy: Math.floor(targets.accuracy * ease),
        revenue: Math.floor(targets.revenue * ease),
        saved: Math.floor(targets.saved * ease),
      });
      if (step >= steps) clearInterval(timer);
    }, interval);
    return () => clearInterval(timer);
  }, []);

  return (
    <>
      <style>{styles}</style>
      <div className="home-root">
        <div className="orb orb-1" />
        <div className="orb orb-2" />

        {/* NAV */}
        <nav className="nav">
          <div className="nav-logo">
            <div className="nav-logo-icon">⚡</div>
            Churn<span>Guard</span>
          </div>
          <div className="nav-pill">v3.2 · LIVE</div>
          <Link to="/login" className="nav-login-btn">Admin Login →</Link>
        </nav>

        {/* HERO */}
        <section className="hero">
          <div className="hero-eyebrow">
            <div className="eyebrow-dot" />
            Customer Retention Intelligence Platform
          </div>

          <h1 className="hero-title">
            Predict Churn.<br />
            <span className="accent">Act Before</span> They <span className="accent2">Leave.</span>
          </h1>

          <p className="hero-sub">
            Enterprise-grade ML models that identify at-risk customers, 
            recommend retention actions, and optimize your budget — all in one platform.
          </p>

          <div className="hero-actions">
            <Link to="/login" className="btn-cta">Launch Platform →</Link>
            <a href="#features" className="btn-secondary">See Features</a>
          </div>

          {/* STATS */}
          <div className="ticker-wrap">
            <div className="ticker-label">Platform metrics · Real-time</div>
            <div className="ticker-cards">
              <div className="ticker-card">
                <div className="ticker-val">{count.customers.toLocaleString()}<span className="unit">+</span></div>
                <div className="ticker-desc">Customers Analyzed</div>
              </div>
              <div className="ticker-card">
                <div className="ticker-val">{(count.accuracy / 10).toFixed(1)}<span className="unit">%</span></div>
                <div className="ticker-desc">Model Accuracy</div>
              </div>
              <div className="ticker-card">
                <div className="ticker-val">₹{count.revenue}<span className="unit">L</span></div>
                <div className="ticker-desc">Revenue Protected</div>
              </div>
              <div className="ticker-card">
                <div className="ticker-val">{count.saved.toLocaleString()}<span className="unit">+</span></div>
                <div className="ticker-desc">Customers Saved</div>
              </div>
            </div>
          </div>
        </section>

        {/* FEATURES */}
        <section className="features" id="features">
          <div className="section-label">What's Inside</div>
          <h2 className="section-title">Every tool your retention team needs</h2>
          <div className="features-grid">
            {features.map((f, i) => (
              <div className="feature-card" key={i} style={{ animationDelay: `${i * 0.05}s` }}>
                <div className="feature-icon" style={{ background: f.color, color: f.iconColor }}>
                  {f.icon}
                </div>
                <div className="feature-name">{f.name}</div>
                <div className="feature-desc">{f.desc}</div>
              </div>
            ))}
          </div>
        </section>

        {/* FOOTER */}
        <footer className="footer-strip">
          <div className="footer-copy">© 2025 ChurnGuard Intelligence Platform</div>
          <div className="footer-badge">
            <div className="footer-online" />
            All systems operational
          </div>
        </footer>
      </div>
    </>
  );
}
