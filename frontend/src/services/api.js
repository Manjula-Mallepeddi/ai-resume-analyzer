import axios from "axios";

const api = axios.create({
  baseURL: "http://127.0.0.1:8000",
});


// ============================================================
// Add JWT token to every request
// ============================================================

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});


// ============================================================
// Authentication
// ============================================================

export const registerUser = async (userData) => {
  const response = await api.post("/auth/register", userData);
  return response.data;
};


export const loginUser = async (userData) => {
  const response = await api.post("/auth/login", userData);
  return response.data;
};


// ============================================================
// Resume Upload
// ============================================================

export const uploadResume = async (file) => {
  const formData = new FormData();

  formData.append("file", file);

  const response = await api.post(
    "/resume/upload",
    formData
  );

  return response.data;
};


// ============================================================
// Resume Analysis
// ============================================================

export const analyzeResume = async (
  resumeId,
  jobDescription
) => {
  const response = await api.post(
    "/resume/analyze",
    {
      resume_id: resumeId,
      job_description: jobDescription,
    }
  );

  return response.data;
};


// ============================================================
// Resume Rewrite
// ============================================================

export const rewriteResume = async (
  resumeId,
  jobDescription
) => {
  const response = await api.post(
    "/resume/rewrite",
    {
      resume_id: resumeId,
      job_description: jobDescription,
    }
  );

  return response.data;
};


// ============================================================
// Cover Letter
// ============================================================

export const generateCoverLetter = async (
  resumeId,
  jobDescription
) => {
  const response = await api.post(
    "/resume/cover-letter",
    {
      resume_id: resumeId,
      job_description: jobDescription,
    }
  );

  return response.data;
};


// ============================================================
// Skill Gap Analysis
// ============================================================

export const analyzeSkillGap = async (
  resumeId,
  jobDescription
) => {
  const response = await api.post(
    "/resume/skill-gap",
    {
      resume_id: resumeId,
      job_description: jobDescription,
    }
  );

  return response.data;
};


// ============================================================
// Resume Analysis History
// ============================================================

export const getResumeHistory = async () => {
  const response = await api.get(
    "/resume/history"
  );

  return response.data;
};


export default api;