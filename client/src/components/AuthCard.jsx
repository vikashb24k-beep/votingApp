import { Link } from "react-router-dom";

function AuthCard({ title, subtitle, alternateLabel, alternateTo, children }) {
  return (
    <div className="auth-layout">
      <section className="auth-hero">
        <div className="hero-orb hero-orb-primary" />
        <div className="hero-orb hero-orb-secondary" />
        <p className="eyebrow">Digital Democracy</p>
        <h1>{title}</h1>
        <p>{subtitle}</p>

        <div className="hero-stat-grid">
          <div className="hero-stat-card">
            <span>Secure Access</span>
            <strong>Token-based entry</strong>
          </div>
          <div className="hero-stat-card">
            <span>Live Momentum</span>
            <strong>Auto-refresh results</strong>
          </div>
        </div>

        <div className="hero-pill-row">
          <span>Trusted vote</span>
          <span>Single submission</span>
          <span>Admin oversight</span>
        </div>
      </section>

      <section className="auth-panel">
        {children}
        <p className="auth-switch">
          <Link to={alternateTo}>{alternateLabel}</Link>
        </p>
      </section>
    </div>
  );
}

export default AuthCard;
