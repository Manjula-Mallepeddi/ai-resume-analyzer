import { useState } from "react";

import {
  uploadResume,
  analyzeResume,
  rewriteResume,
  generateCoverLetter,
  analyzeSkillGap,
} from "../services/api";

function Analyzer() {
  const [file, setFile] = useState(null);
  const [jobDescription, setJobDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [rewriteLoading, setRewriteLoading] = useState(false);
  const [coverLetterLoading, setCoverLetterLoading] = useState(false);
  const [skillGapLoading, setSkillGapLoading] = useState(false);

  const [message, setMessage] = useState("");
  const [result, setResult] = useState(null);
  const [resumeId, setResumeId] = useState(null);

  const [rewrittenResume, setRewrittenResume] = useState("");
  const [coverLetter, setCoverLetter] = useState("");
  const [skillGap, setSkillGap] = useState(null);

  // =========================
  // ERROR MESSAGE HANDLER
  // =========================

  const getErrorMessage = (error, fallback) => {
    const detail = error.response?.data?.detail;

    if (Array.isArray(detail)) {
      return detail.map((item) => item.msg).join(", ");
    }

    return detail || error.message || fallback;
  };

  // =========================
  // ANALYZE RESUME
  // =========================

  const handleAnalyze = async (event) => {
    event.preventDefault();

    if (!file) {
      setMessage("Please select your resume.");
      return;
    }

    if (!jobDescription.trim()) {
      setMessage("Please enter the job description.");
      return;
    }

    try {
      setLoading(true);
      setMessage("");

      setResult(null);
      setResumeId(null);
      setRewrittenResume("");
      setCoverLetter("");
      setSkillGap(null);

      const uploadResponse = await uploadResume(file);

      console.log("Upload response:", uploadResponse);

      const uploadedResumeId = uploadResponse.resume_id;

      if (!uploadedResumeId) {
        throw new Error(
          "Resume ID was not returned by the server."
        );
      }

      setResumeId(uploadedResumeId);

      const analysisResponse = await analyzeResume(
        uploadedResumeId,
        jobDescription
      );

      console.log(
        "Analysis response:",
        analysisResponse
      );

      setResult(analysisResponse);

      setMessage(
        "Resume analyzed successfully!"
      );
    } catch (error) {
      console.error(
        "Analysis error:",
        error
      );

      setMessage(
        getErrorMessage(
          error,
          "Something went wrong while analyzing the resume."
        )
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // REWRITE RESUME
  // =========================

  const handleRewrite = async () => {
    if (!resumeId) {
      setMessage(
        "Please analyze your resume first."
      );
      return;
    }

    try {
      setRewriteLoading(true);
      setMessage("");
      setRewrittenResume("");

      const response = await rewriteResume(
        resumeId,
        jobDescription
      );

      console.log(
        "Rewrite response:",
        response
      );

      if (!response.rewritten_resume) {
        throw new Error(
          "Rewritten resume was not returned by the server."
        );
      }

      setRewrittenResume(
        response.rewritten_resume
      );

      setMessage(
        "Resume rewritten successfully!"
      );
    } catch (error) {
      console.error(
        "Rewrite error:",
        error
      );

      setMessage(
        getErrorMessage(
          error,
          "Failed to rewrite resume."
        )
      );
    } finally {
      setRewriteLoading(false);
    }
  };

  // =========================
  // DOWNLOAD RESUME
  // =========================

  const handleDownload = () => {
    if (!rewrittenResume) {
      setMessage(
        "No rewritten resume available to download."
      );
      return;
    }

    const blob = new Blob(
      [rewrittenResume],
      {
        type: "text/plain;charset=utf-8",
      }
    );

    const url =
      window.URL.createObjectURL(blob);

    const link =
      document.createElement("a");

    link.href = url;
    link.download =
      "AI_Rewritten_Resume.txt";

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);

    window.URL.revokeObjectURL(url);

    setMessage(
      "Resume downloaded successfully!"
    );
  };

  // =========================
  // COVER LETTER
  // =========================

  const handleGenerateCoverLetter =
    async () => {
      if (!resumeId) {
        setMessage(
          "Please analyze your resume first."
        );
        return;
      }

      if (!jobDescription.trim()) {
        setMessage(
          "Please enter the job description first."
        );
        return;
      }

      try {
        setCoverLetterLoading(true);
        setMessage("");
        setCoverLetter("");

        const response =
          await generateCoverLetter(
            resumeId,
            jobDescription
          );

        console.log(
          "Cover letter response:",
          response
        );

        if (!response.cover_letter) {
          throw new Error(
            "Cover letter was not returned by the server."
          );
        }

        setCoverLetter(
          response.cover_letter
        );

        setMessage(
          "Cover letter generated successfully!"
        );
      } catch (error) {
        console.error(
          "Cover letter error:",
          error
        );

        setMessage(
          getErrorMessage(
            error,
            "Failed to generate cover letter."
          )
        );
      } finally {
        setCoverLetterLoading(false);
      }
    };

  // =========================
  // SKILL GAP
  // =========================

  const handleSkillGapAnalysis =
    async () => {
      if (!resumeId) {
        setMessage(
          "Please analyze your resume first."
        );
        return;
      }

      if (!jobDescription.trim()) {
        setMessage(
          "Please enter the job description first."
        );
        return;
      }

      try {
        setSkillGapLoading(true);
        setMessage("");
        setSkillGap(null);

        const response =
          await analyzeSkillGap(
            resumeId,
            jobDescription
          );

        console.log(
          "Skill gap response:",
          response
        );

        setSkillGap(response);

        setMessage(
          "Skill gap analysis completed successfully!"
        );
      } catch (error) {
        console.error(
          "Skill gap error:",
          error
        );

        setMessage(
          getErrorMessage(
            error,
            "Failed to analyze skill gap."
          )
        );
      } finally {
        setSkillGapLoading(false);
      }
    };

  // =========================
  // FILE SELECT
  // =========================

  const handleFileChange = (event) => {
    const selectedFile =
      event.target.files[0];

    setFile(selectedFile);
    setMessage("");

    setResult(null);
    setResumeId(null);
    setRewrittenResume("");
    setCoverLetter("");
    setSkillGap(null);
  };

  // =========================
  // UI
  // =========================

  return (
    <div className="ai-analyzer-page">

      {/* Decorative background */}
      <div className="analyzer-glow analyzer-glow-one"></div>
      <div className="analyzer-glow analyzer-glow-two"></div>

      <div className="analyzer-container">

        {/* =========================
            HEADER
        ========================= */}

        <div className="analyzer-hero">

          <div className="analyzer-eyebrow">
            <span>✦</span>
            AI CAREER INTELLIGENCE
          </div>

          <h1>
            Resume intelligence,
            <span> built for your next opportunity.</span>
          </h1>

          <p>
            Upload your resume, provide a target job
            description, and let AI identify exactly
            where your application can improve.
          </p>

        </div>

        {/* =========================
            INPUT WORKSPACE
        ========================= */}

        <form
          onSubmit={handleAnalyze}
          className="analysis-workspace"
        >

          {/* Resume */}
          <div className="workspace-panel">

            <div className="panel-heading">

              <div className="panel-number">
                01
              </div>

              <div>
                <h2>Resume</h2>
                <p>
                  Upload the resume you want to analyze.
                </p>
              </div>

            </div>

            <label className="resume-dropzone">

              <input
                type="file"
                accept=".pdf,.docx"
                onChange={handleFileChange}
              />

              <div className="drop-icon">
                ↑
              </div>

              <strong>
                {file
                  ? "Resume selected"
                  : "Drop your resume here"}
              </strong>

              <span>
                {file
                  ? file.name
                  : "PDF or DOCX • Ready for AI analysis"}
              </span>

              <small>
                Click to browse files
              </small>

            </label>

          </div>

          {/* Job Description */}
          <div className="workspace-panel">

            <div className="panel-heading">

              <div className="panel-number">
                02
              </div>

              <div>
                <h2>Target role</h2>
                <p>
                  Paste the job description you are targeting.
                </p>
              </div>

            </div>

            <textarea
              className="job-description-input"
              placeholder="Paste the job description here..."
              value={jobDescription}
              onChange={(event) => {
                setJobDescription(
                  event.target.value
                );
                setMessage("");
              }}
            />

            <div className="input-footer">

              <span>
                AI will compare your resume against these requirements.
              </span>

              <strong>
                {jobDescription.length}
              </strong>

            </div>

          </div>

          {/* Analyze */}
          <div className="analysis-action">

            <div>
              <span>
                READY TO ANALYZE
              </span>

              <p>
                Your resume and target role are ready.
              </p>
            </div>

            <button
              type="submit"
              className="primary-ai-button"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="button-spinner"></span>
                  Analyzing...
                </>
              ) : (
                <>
                  Run AI Analysis
                  <span>→</span>
                </>
              )}
            </button>

          </div>

        </form>

        {/* =========================
            MESSAGE
        ========================= */}

        {message && (
          <div className="analyzer-message">
            <span>✦</span>
            {message}
          </div>
        )}

        {/* =========================
            RESULTS
        ========================= */}

        {result && (
          <div className="ai-results">

            <div className="results-title">

              <div>
                <span>
                  ANALYSIS COMPLETE
                </span>

                <h2>
                  Your career snapshot
                </h2>
              </div>

              <div className="analysis-status">
                ● AI analysis complete
              </div>

            </div>

            {/* ATS SCORE */}
            <div className="ats-dashboard">

              <div className="ats-score-panel">

                <span className="result-label">
                  ATS COMPATIBILITY
                </span>

                <div className="ats-number">
                  {Math.round(
                    result.ats_score
                  )}
                  <small>%</small>
                </div>

                <div className="ats-bar">
                  <div
                    style={{
                      width: `${Math.min(
                        100,
                        Math.max(
                          0,
                          result.ats_score
                        )
                      )}%`,
                    }}
                  ></div>
                </div>

                <p>
                  Your resume currently matches
                  approximately{" "}
                  <strong>
                    {Math.round(
                      result.ats_score
                    )}%
                  </strong>{" "}
                  of the target role requirements.
                </p>

              </div>

              <div className="ats-insight">

                <span className="result-label">
                  AI INSIGHT
                </span>

                <h3>
                  {result.ats_score >= 80
                    ? "Strong application foundation."
                    : result.ats_score >= 60
                    ? "Good foundation with room to optimize."
                    : "Your resume has significant optimization opportunities."}
                </h3>

                <p>
                  Review the matched skills,
                  missing skills, and AI recommendations
                  below to strengthen your application.
                </p>

              </div>

            </div>

            {/* SKILLS */}
            <div className="skill-analysis-grid">

              {/* Matched */}
              <div className="skill-analysis-card matched-card">

                <div className="card-top-line">

                  <span className="card-index">
                    01
                  </span>

                  <span className="card-tag">
                    MATCHED
                  </span>

                </div>

                <h3>
                  Skills you already have
                </h3>

                <p>
                  Skills detected in your resume
                  that align with the job.
                </p>

                <div className="skills-list">

                  {result.matched_skills?.length > 0 ? (
                    result.matched_skills.map(
                      (skill, index) => (
                        <span
                          className="skill matched"
                          key={index}
                        >
                          ✓ {skill}
                        </span>
                      )
                    )
                  ) : (
                    <p>
                      No matched skills found.
                    </p>
                  )}

                </div>

              </div>

              {/* Missing */}
              <div className="skill-analysis-card missing-card">

                <div className="card-top-line">

                  <span className="card-index">
                    02
                  </span>

                  <span className="card-tag">
                    OPPORTUNITY
                  </span>

                </div>

                <h3>
                  Skills to strengthen
                </h3>

                <p>
                  Important requirements not clearly
                  present in your resume.
                </p>

                <div className="skills-list">

                  {result.missing_skills?.length > 0 ? (
                    result.missing_skills.map(
                      (skill, index) => (
                        <span
                          className="skill missing"
                          key={index}
                        >
                          + {skill}
                        </span>
                      )
                    )
                  ) : (
                    <p>
                      No missing skills found.
                    </p>
                  )}

                </div>

              </div>

            </div>

            {/* SUGGESTIONS */}
            <div className="ai-insights-card">

              <div className="insights-heading">

                <div className="insight-symbol">
                  ✦
                </div>

                <div>
                  <span>
                    AI RECOMMENDATIONS
                  </span>

                  <h3>
                    Make your resume stronger
                  </h3>
                </div>

              </div>

              {result.suggestions?.length > 0 ? (
                <div className="suggestion-list">

                  {result.suggestions.map(
                    (suggestion, index) => (
                      <div
                        className="suggestion-item"
                        key={index}
                      >

                        <span>
                          {String(
                            index + 1
                          ).padStart(2, "0")}
                        </span>

                        <p>
                          {suggestion}
                        </p>

                      </div>
                    )
                  )}

                </div>
              ) : (
                <p>
                  No additional suggestions available.
                </p>
              )}

            </div>

            {/* =========================
                AI TOOLS
            ========================= */}

            <div className="ai-tools-heading">

              <span>
                AI CAREER TOOLS
              </span>

              <h2>
                Take the next step
              </h2>

              <p>
                Use your analysis to generate
                job-ready career materials.
              </p>

            </div>

            <div className="ai-tools-grid">

              {/* Rewrite */}
              <div className="ai-tool-card">

                <div className="tool-icon">
                  ✨
                </div>

                <span className="tool-label">
                  RESUME OPTIMIZATION
                </span>

                <h3>
                  Rewrite Resume
                </h3>

                <p>
                  Generate an AI-optimized version
                  tailored to your target role.
                </p>

                <button
                  type="button"
                  className="tool-button"
                  onClick={handleRewrite}
                  disabled={rewriteLoading}
                >
                  {rewriteLoading
                    ? "Rewriting..."
                    : "Rewrite with AI →"}
                </button>

              </div>

              {/* Cover Letter */}
              <div className="ai-tool-card">

                <div className="tool-icon">
                  ✉
                </div>

                <span className="tool-label">
                  APPLICATION WRITING
                </span>

                <h3>
                  Cover Letter
                </h3>

                <p>
                  Create a personalized cover letter
                  based on your resume and target job.
                </p>

                <button
                  type="button"
                  className="tool-button"
                  onClick={
                    handleGenerateCoverLetter
                  }
                  disabled={
                    coverLetterLoading
                  }
                >
                  {coverLetterLoading
                    ? "Generating..."
                    : "Generate Letter →"}
                </button>

              </div>

              {/* Skill Gap */}
              <div className="ai-tool-card">

                <div className="tool-icon">
                  ◎
                </div>

                <span className="tool-label">
                  CAREER DEVELOPMENT
                </span>

                <h3>
                  Skill Gap
                </h3>

                <p>
                  Discover what to learn next
                  for your target role.
                </p>

                <button
                  type="button"
                  className="tool-button"
                  onClick={
                    handleSkillGapAnalysis
                  }
                  disabled={
                    skillGapLoading
                  }
                >
                  {skillGapLoading
                    ? "Analyzing..."
                    : "Analyze Skill Gap →"}
                </button>

              </div>

            </div>

            {/* =========================
                REWRITTEN RESUME
            ========================= */}

            {rewrittenResume && (
              <div className="generated-panel">

                <div className="generated-header">

                  <div>
                    <span>
                      AI GENERATED
                    </span>

                    <h3>
                      Optimized Resume
                    </h3>
                  </div>

                  <button
                    type="button"
                    className="download-button"
                    onClick={handleDownload}
                  >
                    ↓ Download
                  </button>

                </div>

                <div className="generated-document">

                  {rewrittenResume
                    .split("\n")
                    .map(
                      (line, index) => (
                        <p key={index}>
                          {line || "\u00A0"}
                        </p>
                      )
                    )}

                </div>

              </div>
            )}

            {/* =========================
                COVER LETTER RESULT
            ========================= */}

            {coverLetter && (
              <div className="generated-panel">

                <div className="generated-header">

                  <div>
                    <span>
                      AI GENERATED
                    </span>

                    <h3>
                      Personalized Cover Letter
                    </h3>
                  </div>

                </div>

                <div className="generated-document">

                  {coverLetter
                    .split("\n")
                    .map(
                      (line, index) => (
                        <p key={index}>
                          {line || "\u00A0"}
                        </p>
                      )
                    )}

                </div>

              </div>
            )}

            {/* =========================
                SKILL GAP RESULT
            ========================= */}

            {skillGap && (
              <div className="generated-panel skill-gap-result">

                <div className="generated-header">

                  <div>
                    <span>
                      CAREER INTELLIGENCE
                    </span>

                    <h3>
                      Your Skill Gap
                    </h3>
                  </div>

                </div>

                <div className="gap-section">

                  <span className="gap-label">
                    SKILLS TO IMPROVE
                  </span>

                  {skillGap.skill_gaps?.length > 0 ? (
                    <div className="skills-list">

                      {skillGap.skill_gaps.map(
                        (skill, index) => (
                          <span
                            className="skill missing"
                            key={index}
                          >
                            + {skill}
                          </span>
                        )
                      )}

                    </div>
                  ) : (
                    <p>
                      No skill gaps found.
                    </p>
                  )}

                </div>

                <div className="gap-section">

                  <span className="gap-label">
                    LEARNING RECOMMENDATIONS
                  </span>

                  {skillGap.learning_recommendations?.length > 0 ? (
                    <div className="recommendation-list">

                      {skillGap.learning_recommendations.map(
                        (recommendation, index) => (
                          <div
                            className="recommendation-item"
                            key={index}
                          >
                            <span>
                              {String(
                                index + 1
                              ).padStart(2, "0")}
                            </span>

                            <p>
                              {recommendation}
                            </p>
                          </div>
                        )
                      )}

                    </div>
                  ) : (
                    <p>
                      No learning recommendations available.
                    </p>
                  )}

                </div>

              </div>
            )}

          </div>
        )}

      </div>

    </div>
  );
}

export default Analyzer;