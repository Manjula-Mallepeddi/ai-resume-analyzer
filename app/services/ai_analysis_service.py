import json
import time

from google import genai
from google.genai import errors

from app.config import settings
from app.schemas.analysis import AIAnalysisResult


class AIAnalysisService:
    """Handles Gemini-powered resume analysis and rewriting."""

    MODEL_NAME = "gemini-3.5-flash-lite"
    MAX_RETRIES = 3

    def __init__(self):
        self.client = genai.Client(
            api_key=settings.GEMINI_API_KEY
        )

    def _generate_content(self, prompt: str):
        """
        Generate Gemini content with retry handling for temporary
        service errors such as HTTP 503.
        """

        last_error = None

        for attempt in range(self.MAX_RETRIES):
            try:
                return self.client.models.generate_content(
                    model=self.MODEL_NAME,
                    contents=prompt,
                )

            except errors.ServerError as error:
                last_error = error

                # Retry temporary Gemini server errors.
                if getattr(error, "status_code", None) == 503:
                    if attempt < self.MAX_RETRIES - 1:
                        wait_time = 2 ** attempt
                        time.sleep(wait_time)
                        continue

                raise

            except errors.APIError as error:
                last_error = error

                # Some API errors can expose the HTTP status code
                # directly. Retry temporary 503 errors.
                if getattr(error, "code", None) == 503:
                    if attempt < self.MAX_RETRIES - 1:
                        wait_time = 2 ** attempt
                        time.sleep(wait_time)
                        continue

                raise

        raise last_error

    def analyze(
        self,
        resume_text: str,
        job_description: str,
    ) -> AIAnalysisResult:

        prompt = f"""
You are an expert ATS resume analyzer.

Analyze the resume against the job description.

Resume:
{resume_text}

Job Description:
{job_description}

Return ONLY valid JSON in exactly this format:

{{
    "ats_score": 0,
    "matched_skills": [],
    "missing_skills": [],
    "suggestions": []
}}

Rules:
- ats_score must be a number between 0 and 100.
- matched_skills should contain skills present in both the resume and job description.
- missing_skills should contain important job-description skills missing from the resume.
- suggestions should contain practical resume improvement suggestions.
- Do not include markdown.
- Do not include explanations outside the JSON.
"""

        response = self._generate_content(prompt)

        text = response.text.strip()

        # Remove accidental markdown code fences
        if text.startswith("```"):
            text = (
                text.replace("```json", "")
                .replace("```", "")
                .strip()
            )

        data = json.loads(text)

        return AIAnalysisResult(
            ats_score=float(data["ats_score"]),
            matched_skills=data["matched_skills"],
            missing_skills=data["missing_skills"],
            suggestions=data["suggestions"],
        )

    def rewrite_resume(
        self,
        resume_text: str,
        job_description: str,
    ) -> str:

        prompt = f"""
You are an expert resume writer and ATS optimization specialist.

Rewrite the resume to better match the provided job description.

RESUME:
{resume_text}

JOB DESCRIPTION:
{job_description}

Instructions:
- Preserve the candidate's real experience, education, projects, and certifications.
- Do not invent jobs, skills, achievements, or technologies.
- Improve wording and professional impact.
- Naturally incorporate relevant keywords from the job description when supported by the resume.
- Make the resume ATS-friendly.
- Use clear section headings.
- Use strong action verbs.
- Keep bullet points concise and professional.
- Do not include explanations about the changes.
- Return only the rewritten resume text.
"""

        response = self._generate_content(prompt)

        return response.text.strip()

    def generate_cover_letter(
        self,
        resume_text: str,
        job_description: str,
    ) -> str:

        prompt = f"""
You are an expert career coach and professional cover letter writer.

Create a professional, ATS-friendly cover letter based on the candidate's
resume and the provided job description.

RESUME:
{resume_text}

JOB DESCRIPTION:
{job_description}

Instructions:
- Use only information supported by the resume.
- Do not invent experience, skills, achievements, companies, or qualifications.
- Clearly connect the candidate's relevant skills and projects to the job.
- Highlight relevant Python, FastAPI, SQL, PostgreSQL, REST APIs, Git,
  Generative AI, and other matching skills when supported by the resume.
- Keep the tone professional and confident.
- Keep the cover letter concise, approximately 300-400 words.
- Use proper paragraphs.
- Do not use markdown.
- Do not explain what you changed.
- Return only the cover letter text.
"""

        response = self._generate_content(prompt)

        return response.text.strip()

    def analyze_skill_gap(
        self,
        resume_text: str,
        job_description: str,
    ) -> dict:

        prompt = f"""
You are an expert career coach and technical skill-gap analyst.

Analyze the candidate's resume against the job description.

RESUME:
{resume_text}

JOB DESCRIPTION:
{job_description}

Return ONLY valid JSON in exactly this format:

{{
    "skill_gaps": [],
    "learning_recommendations": []
}}

Rules:
- skill_gaps should contain important skills required by the job description
  that are missing or insufficiently demonstrated in the resume.
- learning_recommendations should provide practical recommendations for
  improving each identified skill gap.
- Focus primarily on technical and job-related skills.
- Do not recommend skills that the candidate already clearly demonstrates.
- Do not invent information about the candidate.
- Keep recommendations practical and suitable for an entry-level candidate.
- Do not include markdown.
- Do not include explanations outside the JSON.
"""

        response = self._generate_content(prompt)

        text = response.text.strip()

        # Remove accidental markdown code fences
        if text.startswith("```"):
            text = (
                text.replace("```json", "")
                .replace("```", "")
                .strip()
            )

        data = json.loads(text)

        return {
            "skill_gaps": data["skill_gaps"],
            "learning_recommendations": data["learning_recommendations"],
        }