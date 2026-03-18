import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import apiClient from "../api/client";
import { useAuth } from "../context/AuthContext";
import AuthCard from "../components/AuthCard";
import { getApiErrorMessage } from "../utils/getApiErrorMessage";

function SignupPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ name: "", email: "", aadharNumber: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [hint, setHint] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    setHint("");

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      setError("Enter a valid email address");
      setLoading(false);
      return;
    }

    if (form.aadharNumber.length !== 12) {
      setError("Aadhar number must be exactly 12 digits");
      setLoading(false);
      return;
    }

    if (form.password.length < 6) {
      setError("Password must be at least 6 characters");
      setLoading(false);
      return;
    }

    try {
      const { data } = await apiClient.post("/signup", {
        ...form,
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        aadharNumber: form.aadharNumber.trim(),
      });
      login(data.token, data.user);
      navigate("/candidates");
    } catch (requestError) {
      const message = getApiErrorMessage(requestError, "Unable to create account");
      setError(message);

      if (message.toLowerCase().includes("already exists")) {
        setHint("This Aadhar number is already registered. Try logging in instead.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCard
      title="Register as a voter"
      subtitle="Create a secure account, review the candidates, and cast one trusted vote."
      alternateLabel="Already registered? Log in"
      alternateTo="/login"
    >
      <form className="form-grid" onSubmit={handleSubmit}>
        <label>
          Full Name
          <input
            name="name"
            onChange={(event) => setForm({ ...form, name: event.target.value })}
            placeholder="Enter your full name"
            required
            value={form.name}
          />
        </label>

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
          Email Address
          <input
            name="email"
            onChange={(event) => setForm({ ...form, email: event.target.value })}
            placeholder="name@example.com"
            required
            type="email"
            value={form.email}
          />
        </label>

        <label>
          Password
          <input
            minLength="6"
            name="password"
            onChange={(event) => setForm({ ...form, password: event.target.value })}
            placeholder="At least 6 characters"
            required
            type="password"
            value={form.password}
          />
        </label>

        {error ? <p className="error-text">{error}</p> : null}
        {hint ? <p className="hint-text">{hint}</p> : null}

        <button disabled={loading} type="submit">
          {loading ? "Creating account..." : "Signup"}
        </button>
      </form>

      <p className="auth-switch">
        <Link to="/login">Already registered? Log in</Link>
      </p>
    </AuthCard>
  );
}

export default SignupPage;
