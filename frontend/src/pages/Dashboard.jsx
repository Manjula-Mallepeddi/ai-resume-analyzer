import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { getResumeHistory } from "../services/api";


function Dashboard() {
  const navigate = useNavigate();

  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [historyError, setHistoryError] = useState("");
  const [showHistory, setShowHistory] = useState(false);


  // ============================================================
  // Load Resume Analysis History
  // ============================================================

  useEffect(() => {
    const loadHistory = async () => {
      try {
        setLoadingHistory(true);
        setHistoryError("");

        const data = await getResumeHistory();

        setHistory(data);
      } catch (error) {
        console.error("Failed to load resume history:", error);

        if (error.response?.status === 401) {
          localStorage.removeItem("token");
          navigate("/login", { replace: true });
          return;
        }

        setHistoryError(
          error.response?.data?.detail ||
          "Unable to load your resume history."
        );
      } finally {
        setLoadingHistory(false);
      }
    };

    loadHistory();
  }, [navigate]);


  // ============================================================
  // Logout
  // ============================================================

  const handleLogout = () => {
    localStorage.removeItem("token");

    navigate("/login", { replace: true });
  };


  // ============================================================
  // Format Date
  // ============================================================

  const formatDate = (dateString) => {
    if (!dateString) {
      return "Date unavailable";
    }

    const date = new Date(dateString);

    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };


  // ============================================================
  // Get ATS Score Class
  // ============================================================

  const getScoreClass = (score) => {
    if (score >= 80) {
      return "score-excellent";
    }

    if (score >= 60) {
      return "score-good";
    }

    return "score-low";
  };


  return (
    <div className="dashboard-page">

      {/* Decorative background elements */}

      <div className="dashboard-glow glow-one"></div>
      <div className="dashboard-glow glow-two"></div>


      <div className="dashboard-wrapper">

        {/* ======================================================
            Top Navigation
        ====================================================== */}

        <div className="dashboard-topbar">

          <div className="dashboard-logo">
            Resume<span>AI</span>
          </div>

          <button
            className="dashboard-logout"
            onClick={handleLogout}
          >
            Logout
          </button>

        </div>


        {/* ======================================================
            Hero Section
        ====================================================== */}

        <section className="dashboard-hero">

          <div className="hero-badge">
            <span className="badge-dot"></span>
            AI-Powered Career Assistant
          </div>


          <h1>
            Build a Resume That
            <span> Gets Noticed.</span>
          </h1>


          <p>
            ResumeAI analyzes your resume against real job requirements,
            identifies skill gaps, improves your content, and helps you
            create stronger job applications.
          </p>


          <div className="hero-actions">

            <button
              className="hero-primary-button"
              onClick={() => navigate("/analyzer")}
            >
              <span>Analyze My Resume</span>
              <span className="arrow">→</span>
            </button>

          </div>

        </section>


        {/* ======================================================
            Analysis History
        ====================================================== */}

        <section className="dashboard-history">

          <div className="history-header">

            <div className="features-heading">

              <p className="section-label">
                YOUR RESUME JOURNEY
              </p>

              <h2>
                Analysis
                <span> History.</span>
              </h2>

            </div>


            <button
              className="history-toggle-button"
              onClick={() => setShowHistory(!showHistory)}
              type="button"
            >
              <span>
                {showHistory
                  ? "Hide Analysis History"
                  : "View Analysis History"}
              </span>

              <span
                className={`history-toggle-arrow ${
                  showHistory ? "open" : ""
                }`}
              >
                ↓
              </span>

            </button>

          </div>


          {/* ====================================================
              Hidden / Visible History Content
          ==================================================== */}

          {showHistory && (
            <div className="history-content">

              {/* Loading State */}

              {loadingHistory && (
                <div className="history-state">

                  <div className="history-spinner"></div>

                  <p>
                    Loading your analysis history...
                  </p>

                </div>
              )}


              {/* Error State */}

              {!loadingHistory && historyError && (
                <div className="history-state history-error">

                  <div className="history-state-icon">
                    ⚠️
                  </div>

                  <h3>
                    Unable to load history
                  </h3>

                  <p>
                    {historyError}
                  </p>

                </div>
              )}


              {/* Empty State */}

              {!loadingHistory &&
                !historyError &&
                history.length === 0 && (
                  <div className="history-state">

                    <div className="history-state-icon">
                      📄
                    </div>

                    <h3>
                      No analyses yet
                    </h3>

                    <p>
                      Upload your resume and analyze it against a job
                      description to see your results here.
                    </p>

                    <button
                      className="hero-primary-button"
                      onClick={() => navigate("/analyzer")}
                      type="button"
                    >
                      <span>
                        Analyze My Resume
                      </span>

                      <span className="arrow">
                        →
                      </span>
                    </button>

                  </div>
                )
              }


              {/* History Cards */}

              {!loadingHistory &&
                !historyError &&
                history.length > 0 && (
                  <div className="history-grid">

                    {history.map((item) => (
                      <div
                        className="history-card"
                        key={item.analysis_id}
                      >

                        {/* Card Top */}

                        <div className="history-card-top">

                          <div className="history-file">

                            <div className="history-file-icon">
                              📄
                            </div>

                            <div>
                              <h3>
                                {item.filename}
                              </h3>

                              <p>
                                Resume ID: {item.resume_id}
                              </p>
                            </div>

                          </div>


                          {/* ATS Score */}

                          <div
                            className={`history-score ${getScoreClass(
                              item.ats_score
                            )}`}
                          >

                            <strong>
                              {Math.round(item.ats_score)}
                            </strong>

                            <span>
                              ATS
                            </span>

                          </div>

                        </div>


                        <div className="history-divider"></div>


                        {/* Analysis Details */}

                        <div className="history-details">

                          <div className="history-detail">

                            <span className="history-detail-label">
                              ANALYZED
                            </span>

                            <span className="history-detail-value">
                              {formatDate(item.created_at)}
                            </span>

                          </div>


                          <div className="history-detail">

                            <span className="history-detail-label">
                              MATCHED SKILLS
                            </span>

                            <span className="history-detail-value">
                              {item.matched_skills?.length || 0}
                            </span>

                          </div>


                          <div className="history-detail">

                            <span className="history-detail-label">
                              MISSING SKILLS
                            </span>

                            <span className="history-detail-value">
                              {item.missing_skills?.length || 0}
                            </span>

                          </div>

                        </div>


                        {/* Matched Skills */}

                        {item.matched_skills?.length > 0 && (
                          <div className="history-skills">

                            <p>
                              Matched Skills
                            </p>

                            <div className="skill-tags">

                              {item.matched_skills
                                .slice(0, 5)
                                .map((skill, index) => (
                                  <span
                                    key={`${item.analysis_id}-matched-${index}`}
                                    className="skill-tag matched"
                                  >
                                    {skill}
                                  </span>
                                ))}

                            </div>

                          </div>
                        )}


                        {/* Missing Skills */}

                        {item.missing_skills?.length > 0 && (
                          <div className="history-skills">

                            <p>
                              Missing Skills
                            </p>

                            <div className="skill-tags">

                              {item.missing_skills
                                .slice(0, 5)
                                .map((skill, index) => (
                                  <span
                                    key={`${item.analysis_id}-missing-${index}`}
                                    className="skill-tag missing"
                                  >
                                    {skill}
                                  </span>
                                ))}

                            </div>

                          </div>
                        )}

                      </div>
                    ))}

                  </div>
                )
              }

            </div>
          )}

        </section>


        {/* ======================================================
            Feature Section
        ====================================================== */}

        <section className="dashboard-features">

          <div className="features-heading">

            <p className="section-label">
              WHAT RESUMEAI CAN DO
            </p>

            <h2>
              Everything you need to
              <span> improve your resume.</span>
            </h2>

          </div>


          <div className="feature-grid">

            {/* Feature 1 */}

            <div className="feature-card">

              <div className="feature-number">
                01
              </div>

              <div className="feature-icon">
                📊
              </div>

              <h3>
                ATS Resume Analysis
              </h3>

              <p>
                Compare your resume with a job description and
                discover your ATS compatibility score, matched
                skills, missing skills, and improvement areas.
              </p>

              <button
                onClick={() => navigate("/analyzer")}
                className="feature-link"
                type="button"
              >
                Analyze Resume →
              </button>

            </div>


            {/* Feature 2 */}

            <div className="feature-card">

              <div className="feature-number">
                02
              </div>

              <div className="feature-icon">
                ✨
              </div>

              <h3>
                AI Resume Rewrite
              </h3>

              <p>
                Transform your existing resume into a stronger,
                job-focused version using AI-powered rewriting
                suggestions.
              </p>

              <button
                onClick={() => navigate("/analyzer")}
                className="feature-link"
                type="button"
              >
                Improve Resume →
              </button>

            </div>


            {/* Feature 3 */}

            <div className="feature-card">

              <div className="feature-number">
                03
              </div>

              <div className="feature-icon">
                ✉️
              </div>

              <h3>
                Cover Letter Generator
              </h3>

              <p>
                Generate a personalized cover letter based on
                your resume and the job description in seconds.
              </p>

              <button
                onClick={() => navigate("/analyzer")}
                className="feature-link"
                type="button"
              >
                Create Cover Letter →
              </button>

            </div>


            {/* Feature 4 */}

            <div className="feature-card">

              <div className="feature-number">
                04
              </div>

              <div className="feature-icon">
                🎯
              </div>

              <h3>
                Skill Gap Analysis
              </h3>

              <p>
                Find the important skills you are missing and
                understand what you should learn to become a
                stronger candidate.
              </p>

              <button
                onClick={() => navigate("/analyzer")}
                className="feature-link"
                type="button"
              >
                Find Skill Gaps →
              </button>

            </div>

          </div>

        </section>


        {/* ======================================================
            Bottom CTA
        ====================================================== */}

        <section className="dashboard-cta">

          <div>

            <p className="section-label">
              READY TO GET STARTED?
            </p>

            <h2>
              Turn your resume into
              <span> your advantage.</span>
            </h2>

          </div>


          <button
            className="cta-button"
            onClick={() => navigate("/analyzer")}
            type="button"
          >
            Start Analyzing
            <span>→</span>
          </button>

        </section>


        {/* ======================================================
            Footer
        ====================================================== */}

        <footer className="dashboard-footer">

          <div className="footer-logo">
            Resume<span>AI</span>
          </div>

          <p>
            AI-powered resume optimization for modern job seekers.
          </p>

          <span className="footer-copy">
            © 2026 ResumeAI
          </span>

        </footer>

      </div>

    </div>
  );
}


export default Dashboard;