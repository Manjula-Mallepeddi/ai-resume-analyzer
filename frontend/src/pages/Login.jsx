import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginUser } from "../services/api";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleLogin = async (event) => {
    event.preventDefault();

    try {
      setLoading(true);
      setMessage("");

      const response = await loginUser({
        email,
        password,
      });

      const token = response.access_token;

      localStorage.setItem("token", token);

      setMessage("Login successful!");

      setTimeout(() => {
        navigate("/dashboard");
      }, 700);
    } catch (error) {
      const detail = error.response?.data?.detail;

      if (Array.isArray(detail)) {
        setMessage(
          detail.map((item) => item.msg).join(", ")
        );
      } else {
        setMessage(detail || "Login failed.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">

      {/* Background decoration */}
      <div className="login-glow login-glow-one"></div>
      <div className="login-glow login-glow-two"></div>

      <div className="login-shell">

        {/* ================= LEFT SIDE ================= */}

        <section className="login-showcase">

          <div className="showcase-brand">
            <div className="brand-mark">R</div>

            <div>
              <strong>ResumeAI</strong>
              <span>Career Intelligence</span>
            </div>
          </div>

          <div className="showcase-content">

            <div className="ai-label">
              <span className="pulse-dot"></span>
              AI-POWERED CAREER TOOLS
            </div>

            <h1>
              Your resume.
              <br />
              <span>Smarter.</span>
            </h1>

            <p>
              Turn your resume into a stronger job application
              with AI-powered analysis, ATS optimization and
              personalized career insights.
            </p>

            <div className="showcase-stats">

              <div>
                <strong>01</strong>
                <span>Analyze</span>
              </div>

              <div>
                <strong>02</strong>
                <span>Optimize</span>
              </div>

              <div>
                <strong>03</strong>
                <span>Improve</span>
              </div>

            </div>

          </div>

          <div className="showcase-bottom">
            <span>✦</span>
            Built for modern job seekers
          </div>

        </section>

        {/* ================= LOGIN SIDE ================= */}

        <section className="login-panel">

          <div className="login-card">

            <div className="mobile-brand">
              <div className="brand-mark">R</div>

              <div>
                <strong>ResumeAI</strong>
                <span>Career Intelligence</span>
              </div>
            </div>

            <div className="login-heading">

              <div className="heading-label">
                MEMBER ACCESS
              </div>

              <h2>Welcome back.</h2>

              <p>
                Sign in to continue building a stronger
                career profile.
              </p>

            </div>

            <form onSubmit={handleLogin}>

              {/* Email */}

              <div className="login-field">

                <label htmlFor="email">
                  Email address
                </label>

                <div className="login-input">

                  <span>@</span>

                  <input
                    id="email"
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

              <div className="login-field">

                <label htmlFor="password">
                  Password
                </label>

                <div className="login-input">

                  <span>••</span>

                  <input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
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
                className="login-submit"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="login-spinner"></span>
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign in
                    <span>↗</span>
                  </>
                )}
              </button>

            </form>

            {/* Message */}

            {message && (
              <div
                className={`login-message ${
                  message
                    .toLowerCase()
                    .includes("successful")
                    ? "success"
                    : "error"
                }`}
              >
                {message}
              </div>
            )}

            {/* Register */}

            <div className="register-prompt">

              <span>Don't have an account?</span>

              <Link to="/register">
                Create account →
              </Link>

            </div>

            <div className="login-security">
              <span>🔒</span>
              Your account is protected with secure authentication.
            </div>

          </div>

        </section>

      </div>
    </div>
  );
}

export default Login;