import { NavLink, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const navigationItems = [
  { to: "/candidates", label: "Candidates", accent: "Ballot" },
  { to: "/vote-counts", label: "Vote Counts", accent: "Live" },
  { to: "/profile", label: "Profile", accent: "Account" },
];

function AppShell() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const firstName = user?.name?.split(" ")[0] || "Voter";
  const isAdmin = user?.role === "admin";
  const sessionTone = user?.hasVoted ? "Submitted" : isAdmin ? "Control Room" : "Ready to Cast";

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-top">
          <div className="brand-mark">
            <span className="brand-dot" />
            <div>
              <div className="brand">VoteSphere</div>
              <p className="brand-copy">Secure citizen voting with live counting and simple admin controls.</p>
            </div>
          </div>

          <div className="sidebar-status-card">
            <span className="status-label">Session Tone</span>
            <strong>{sessionTone}</strong>
            <p>{isAdmin ? "Monitor and manage the election experience in real time." : "Review candidates, track momentum, and cast one trusted vote."}</p>
          </div>
        </div>

        <nav className="nav-links" aria-label="Primary navigation">
          {navigationItems.map((item) => (
            <NavLink key={item.to} to={item.to}>
              <span>{item.label}</span>
              <small>{item.accent}</small>
            </NavLink>
          ))}
          {isAdmin ? (
            <NavLink to="/admin">
              <span>Admin</span>
              <small>Manage</small>
            </NavLink>
          ) : null}
        </nav>

        <div className="user-card">
          <div className="user-card-top">
            <div className="user-avatar">{user?.name?.slice(0, 1)?.toUpperCase() || "V"}</div>
            <div>
              <strong>{user?.name}</strong>
              <p className="user-role">{isAdmin ? "Administrator" : "Registered Voter"}</p>
            </div>
          </div>

          <div className="user-meta-grid">
            <div>
              <span>ID</span>
              <strong>{user?.aadharNumber || "Not available"}</strong>
            </div>
            <div>
              <span>Status</span>
              <strong>{user?.hasVoted ? "Vote locked" : "Ready to vote"}</strong>
            </div>
          </div>

          <div className="presence-meter" aria-hidden="true">
            <div className={`presence-meter-bar ${user?.hasVoted ? "is-complete" : ""}`} />
          </div>

          <div className="mini-chip">{user?.hasVoted ? "Vote submitted" : "Awaiting your choice"}</div>
          <button className="secondary-button" onClick={logout} type="button">
            Logout
          </button>
        </div>
      </aside>

      <main className="content-area">
        <div className="top-banner">
          <div>
            <p className="eyebrow">Interactive Portal</p>
            <h1 className="page-title">Welcome back, {firstName}</h1>
            <p className="banner-copy">
              {isAdmin
                ? "Oversee candidate activity, keep the ballot healthy, and track the live result pulse."
                : "Explore the ballot, watch the live scoreboard, and lock in your choice with confidence."}
            </p>
          </div>
          <div className="top-banner-meta">
            <span>{isAdmin ? "Admin Access" : "Voter Access"}</span>
            <span>{user?.hasVoted ? "Vote submitted" : "Vote pending"}</span>
            <span>{location.pathname.replace("/", "") || "home"}</span>
          </div>
        </div>
        <Outlet />
      </main>
    </div>
  );
}

export default AppShell;
