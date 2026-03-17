import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import apiClient from "../api/client";
import { useAuth } from "../context/AuthContext";
import AuthCard from "../components/AuthCard";
import { getApiErrorMessage } from "../utils/getApiErrorMessage";

function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ aadharNumber: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const { data } = await apiClient.post("/login", {
        ...form,
        aadharNumber: form.aadharNumber.trim(),
      });
      login(data.token, data.user);
      navigate(data.user.role === "admin" ? "/admin" : "/candidates");
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, "Unable to login"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCard
      title="Sign in to cast your vote"
      subtitle="Use your Aadhar number and password to enter the secure voting portal."
      alternateLabel="Need an account? Create one"
      alternateTo="/signup"
    >
      <form className="form-grid" onSubmit={handleSubmit}>
        <label>
          Aadhar Number
          <input
            inputMode="numeric"
            maxLength="12"
            minLength="12"
            name="aadharNumber"
            onChange={(event) =>
              setForm({ ...form, aadharNumber: event.target.value.replace(/\D/g, "") })
            }
            placeholder="123456789012"
            required
            value={form.aadharNumber}
          />
        </label>

        <label>
          Password
          <input
            name="password"
            onChange={(event) => setForm({ ...form, password: event.target.value })}
            placeholder="Enter your password"
            required
            type="password"
            value={form.password}
          />
        </label>

        {error ? <p className="error-text">{error}</p> : null}

        <button disabled={loading} type="submit">
          {loading ? "Signing in..." : "Login"}
        </button>
      </form>

      <p className="hint-text">
        Admin users sign in from here too. If you configured default admin credentials in the backend `.env`,
        use those details to access the admin dashboard.
      </p>
      <p className="auth-switch">
        <Link to="/signup">Create voter account</Link>
      </p>
    </AuthCard>
  );
}

export default LoginPage;
