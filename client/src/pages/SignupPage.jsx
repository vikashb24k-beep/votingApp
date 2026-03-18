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
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [verificationToken, setVerificationToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [error, setError] = useState("");
  const [hint, setHint] = useState("");
  const [otpMessage, setOtpMessage] = useState("");

  const resetOtpState = () => {
    setOtp("");
    setOtpSent(false);
    setOtpVerified(false);
    setVerificationToken("");
    setOtpMessage("");
  };

  const handleEmailChange = (value) => {
    setForm({ ...form, email: value });
    resetOtpState();
    setError("");
    setHint("");
  };

  const handleSendOtp = async () => {
    const email = form.email.trim().toLowerCase();

    setSendingOtp(true);
    setError("");
    setHint("");
    setOtpMessage("");

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Enter a valid email address");
      setSendingOtp(false);
      return;
    }

    try {
      const { data } = await apiClient.post("/auth/send-otp", { email });
      setForm({ ...form, email });
      setOtpSent(true);
      setOtpVerified(false);
      setVerificationToken("");
      setOtpMessage(data.message || "OTP sent successfully");
    } catch (requestError) {
      const message = getApiErrorMessage(requestError, "Unable to send OTP");
      setError(message);

      if (message.toLowerCase().includes("already exists")) {
        setHint("This email is already registered. Try logging in instead.");
      }
    } finally {
      setSendingOtp(false);
    }
  };

  const handleVerifyOtp = async () => {
    const email = form.email.trim().toLowerCase();

    setVerifyingOtp(true);
    setError("");
    setHint("");
    setOtpMessage("");

    if (!otp.trim()) {
      setError("Enter the OTP sent to your email");
      setVerifyingOtp(false);
      return;
    }

    try {
      const { data } = await apiClient.post("/auth/verify-otp", {
        email,
        otp: otp.trim(),
      });
      setOtpVerified(true);
      setVerificationToken(data.verificationToken);
      setOtpMessage(data.message || "OTP verified successfully");
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, "Unable to verify OTP"));
      setOtpVerified(false);
      setVerificationToken("");
    } finally {
      setVerifyingOtp(false);
    }
  };

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

    if (!otpVerified || !verificationToken) {
      setError("Verify your email OTP before creating the account");
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
      const { data } = await apiClient.post("/auth/register", {
        ...form,
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        aadharNumber: form.aadharNumber.trim(),
        verificationToken,
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
            onChange={(event) => handleEmailChange(event.target.value)}
            placeholder="name@example.com"
            required
            type="email"
            value={form.email}
          />
        </label>

        <button className="secondary-button" disabled={sendingOtp || otpVerified} onClick={handleSendOtp} type="button">
          {sendingOtp ? "Sending OTP..." : otpVerified ? "OTP Verified" : "Send OTP"}
        </button>

        {otpSent ? (
          <>
            <label>
              OTP
              <input
                inputMode="numeric"
                maxLength="6"
                minLength="6"
                onChange={(event) => setOtp(event.target.value.replace(/\D/g, ""))}
                placeholder="Enter 6-digit OTP"
                value={otp}
              />
            </label>

            <button className="secondary-button" disabled={verifyingOtp || otpVerified} onClick={handleVerifyOtp} type="button">
              {verifyingOtp ? "Verifying OTP..." : otpVerified ? "OTP Verified" : "Verify OTP"}
            </button>
          </>
        ) : null}

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
        {otpMessage ? <p className="success-text">{otpMessage}</p> : null}
        {hint ? <p className="hint-text">{hint}</p> : null}

        <button disabled={loading || !otpVerified} type="submit">
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
