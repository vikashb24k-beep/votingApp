import { Link } from "react-router-dom";

function AuthCard({ title, subtitle, alternateLabel, alternateTo, children }) {
  return (
    <div className="auth-layout">
      <section className="auth-hero">
        <div className="hero-orb" />
        <p className="eyebrow">Digital Democracy</p>
        <h1>{title}</h1>
        <p>{subtitle}</p>
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
