import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function AppShell() {
  const { user, logout } = useAuth();

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div>
          <div className="brand">VoteSphere</div>
          <p className="brand-copy">Secure citizen voting with live counting and simple admin controls.</p>
        </div>

        <nav className="nav-links">
          <NavLink to="/candidates">Candidates</NavLink>
          <NavLink to="/vote-counts">Vote Counts</NavLink>
          <NavLink to="/profile">Profile</NavLink>
          {user?.role === "admin" ? <NavLink to="/admin">Admin</NavLink> : null}
        </nav>

        <div className="user-card">
          <div className="user-avatar">{user?.name?.slice(0, 1)?.toUpperCase() || "V"}</div>
          <strong>{user?.name}</strong>
          <span>{user?.role === "admin" ? "Administrator" : "Registered Voter"}</span>
          <span>{user?.aadharNumber}</span>
          <div className="mini-chip">{user?.hasVoted ? "Vote locked" : "Ready to vote"}</div>
          <button className="secondary-button" onClick={logout} type="button">
            Logout
          </button>
        </div>
      </aside>

      <main className="content-area">
        <div className="top-banner">
          <div>
            <p className="eyebrow">Interactive Portal</p>
            <h1 className="page-title">Welcome back, {user?.name?.split(" ")[0] || "Voter"}</h1>
          </div>
          <div className="top-banner-meta">
            <span>{user?.role === "admin" ? "Admin Access" : "Voter Access"}</span>
            <span>{user?.hasVoted ? "Vote submitted" : "Vote pending"}</span>
          </div>
        </div>
        <Outlet />
      </main>
    </div>
  );
}

export default AppShell;
