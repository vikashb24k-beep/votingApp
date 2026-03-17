import { useState } from "react";
import apiClient from "../api/client";
import { useAuth } from "../context/AuthContext";

function ProfilePage() {
  const { user } = useAuth();
  const [form, setForm] = useState({ currentPassword: "", newPassword: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const { data } = await apiClient.put("/profile/password", form);
      setMessage(data.message);
      setForm({ currentPassword: "", newPassword: "" });
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to update password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="page-shell profile-grid">
      <div className="panel profile-hero-panel">
        <p className="eyebrow">Profile</p>
        <div className="profile-hero">
          <div className="profile-avatar">{user?.name?.slice(0, 1)?.toUpperCase() || "U"}</div>
          <div>
            <h2>{user?.name}</h2>
            <p className="profile-subtitle">Manage your identity, voting status, and account security.</p>
          </div>
        </div>
        <dl className="details-list">
          <div>
            <dt>Role</dt>
            <dd>{user?.role}</dd>
          </div>
          <div>
            <dt>Aadhar Number</dt>
            <dd>{user?.aadharNumber}</dd>
          </div>
          <div>
            <dt>Voting Status</dt>
            <dd>{user?.hasVoted ? "Vote already cast" : "Not voted yet"}</dd>
          </div>
        </dl>
      </div>

      <div className="panel">
        <p className="eyebrow">Security</p>
        <h3>Change password</h3>
        <form className="form-grid" onSubmit={handleSubmit}>
          <label>
            Current Password
            <input
              onChange={(event) => setForm({ ...form, currentPassword: event.target.value })}
              required
              type="password"
              value={form.currentPassword}
            />
          </label>

          <label>
            New Password
            <input
              minLength="6"
              onChange={(event) => setForm({ ...form, newPassword: event.target.value })}
              required
              type="password"
              value={form.newPassword}
            />
          </label>

          {message ? <p className="success-text">{message}</p> : null}
          {error ? <p className="error-text">{error}</p> : null}

          <button disabled={loading} type="submit">
            {loading ? "Updating..." : "Update Password"}
          </button>
        </form>
      </div>
    </section>
  );
}

export default ProfilePage;
