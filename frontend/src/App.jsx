import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Analyzer from "./pages/Analyzer";


/* =========================
   PROTECTED ROUTE
========================= */

function ProtectedRoute({ children }) {
  const token = localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
}


/* =========================
   HOME PAGE
========================= */

function Home() {
  return (
    <div className="home-page">

      <div className="home-content">

        <div className="home-badge">
          ✦ AI-Powered Career Assistant
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

        <div className="home-actions">

          <a
            href="/analyzer"
            className="home-button primary"
          >
            <span>✨</span>
            Analyze Resume
          </a>

          <a
            href="/login"
            className="home-button secondary"
          >
            Login
          </a>

          <a
            href="/register"
            className="home-button secondary"
          >
            Create Account
          </a>

        </div>

        <div className="home-features">

          <div>
            <strong>ATS Analysis</strong>
            <span>Check your resume compatibility</span>
          </div>

          <div>
            <strong>AI Optimization</strong>
            <span>Improve your resume instantly</span>
          </div>

          <div>
            <strong>Career Insights</strong>
            <span>Discover missing skills</span>
          </div>

        </div>

      </div>

    </div>
  );
}


/* =========================
   MAIN APP
========================= */

function App() {
  return (
    <BrowserRouter>

      <Routes>

        {/* Public Routes */}

        <Route
          path="/"
          element={<Home />}
        />

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/register"
          element={<Register />}
        />


        {/* Protected Routes */}

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/analyzer"
          element={
            <ProtectedRoute>
              <Analyzer />
            </ProtectedRoute>
          }
        />


        {/* Unknown URL */}

        <Route
          path="*"
          element={<Navigate to="/" replace />}
        />

      </Routes>

    </BrowserRouter>
  );
}

export default App;