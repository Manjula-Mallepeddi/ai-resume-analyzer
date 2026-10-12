import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerUser } from "../services/api";

function Register() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleRegister = async (event) => {
    event.preventDefault();

    try {
      setLoading(true);
      setMessage("");

      await registerUser({
        full_name: fullName,
        email,
        password,
      });

      setMessage("Registration successful! Redirecting to login...");

      setFullName("");
      setEmail("");
      setPassword("");

      setTimeout(() => {
        navigate("/login");
      }, 1000);
    } catch (error) {
      console.error(error);

      const detail = error.response?.data?.detail;

      if (Array.isArray(detail)) {
        setMessage(
          detail.map((item) => item.msg).join(", ")
        );
      } else {
        setMessage(detail || "Registration failed.");
      }
    } finally {
      setLoading(false);
    }
  };

  const isSuccess = message
    .toLowerCase()
    .includes("successful");

  return (
    <div className="auth-page">

      {/* Decorative background */}
      <div className="auth-orb auth-orb-one"></div>
      <div className="auth-orb auth-orb-two"></div>

      <div className="auth-layout">

        {/* Left branding section */}
        <div className="auth-brand">

          <div className="brand-badge">
            ✦ AI CAREER INTELLIGENCE
          </div>

          <h1>
            Turn your resume into
            <span> your career advantage.</span>
          </h1>

          <p>
            Create your ResumeAI account and unlock intelligent
            resume analysis, ATS optimization, AI rewriting,
            cover letters, and skill gap insights.
          </p>

          <div className="brand-features">

            <div className="brand-feature">
              <div className="feature-icon">◈</div>

              <div>
                <strong>Smart Resume Analysis</strong>
                <small>
                  Understand your resume's ATS compatibility.
                </small>
              </div>
            </div>

            <div className="brand-feature">
              <div className="feature-icon">✦</div>

              <div>
                <strong>AI-Powered Optimization</strong>
                <small>
                  Improve your resume for specific job roles.
                </small>
              </div>
            </div>

            <div className="brand-feature">
              <div className="feature-icon">↗</div>

              <div>
                <strong>Career Intelligence</strong>
                <small>
                  Discover missing skills and improve your profile.
                </small>
              </div>
            </div>

          </div>

        </div>

        {/* Register card */}
        <div className="auth-card">

          <div className="auth-card-top">

            <div className="auth-logo">
              <span>R</span>
            </div>

            <div>
              <h2>ResumeAI</h2>
              <small>
                Career Intelligence Platform
              </small>
            </div>

          </div>

          <div className="auth-heading">

            <h1>Create your account</h1>

            <p>
              Start building a stronger career profile today.
            </p>

          </div>

          <form onSubmit={handleRegister}>

            {/* Full Name */}
            <div className="form-group">

              <label>Full name</label>

              <div className="input-wrapper">

                <span className="input-icon">
                  ◉
                </span>

                <input
                  type="text"
                  placeholder="Enter your full name"
                  value={fullName}
                  onChange={(event) => {
                    setFullName(event.target.value);
                    setMessage("");
                  }}
                  required
                />

              </div>

            </div>

            {/* Email */}
            <div className="form-group">

              <label>Email address</label>

              <div className="input-wrapper">

                <span className="input-icon">
                  @
                </span>

                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(event) => {
                    setEmail(event.target.value);
                    setMessage("");
                  }}
                  required
                />

              </div>

            </div>

            {/* Password */}
            <div className="form-group">

              <label>Password</label>

              <div className="input-wrapper">

                <span className="input-icon">
                  ●
                </span>

                <input
                  type="password"
                  placeholder="Create a password"
                  value={password}
                  onChange={(event) => {
                    setPassword(event.target.value);
                    setMessage("");
                  }}
                  required
                />

              </div>

            </div>

            {/* Submit */}
            <button
              type="submit"
              className="auth-submit"
              disabled={loading}
            >

              {loading ? (
                <>
                  <span className="button-spinner"></span>
                  Creating account...
                </>
              ) : (
                <>
                  Create account
                  <span>→</span>
                </>
              )}

            </button>

          </form>

          {/* Message */}
          {message && (
            <div
              className={`auth-message ${
                isSuccess ? "success" : "error"
              }`}
            >
              {message}
            </div>
          )}

          {/* Login link */}
          <div className="auth-divider">
            <span>Already have an account?</span>
          </div>

          <Link
            to="/login"
            className="auth-secondary-button"
          >
            Sign in to ResumeAI
          </Link>

          <p className="auth-footer">
            AI-powered resume optimization
          </p>

        </div>

      </div>

    </div>
  );
}

export default Register;