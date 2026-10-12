import re


class ATSService:
    """Basic ATS-style resume matching service."""

    def analyze(self, resume_text: str, job_description: str) -> dict:
        resume_lower = resume_text.lower()
        job_lower = job_description.lower()

        # Common technical skills to detect.
        skills = [
            "python",
            "fastapi",
            "sql",
            "postgresql",
            "javascript",
            "html",
            "css",
            "git",
            "github",
            "docker",
            "rest api",
            "machine learning",
            "generative ai",
            "prompt engineering",
            "n8n",
            "workflow automation",
            "postgres",
            "langchain",
            "tensorflow",
            "pandas",
            "numpy",
        ]

        required_skills = [
            skill
            for skill in skills
            if re.search(r"\b" + re.escape(skill) + r"\b", job_lower)
        ]

        matched_skills = [
            skill
            for skill in required_skills
            if re.search(r"\b" + re.escape(skill) + r"\b", resume_lower)
        ]

        missing_skills = [
            skill
            for skill in required_skills
            if skill not in matched_skills
        ]

        if required_skills:
            ats_score = (
                len(matched_skills) / len(required_skills)
            ) * 100
        else:
            ats_score = 0.0

        suggestions = []

        if missing_skills:
            suggestions.append(
                "Consider adding relevant missing skills if you have experience with them."
            )

        if "experience" in job_lower and "experience" not in resume_lower:
            suggestions.append(
                "Add relevant experience or internship details."
            )

        if "project" in job_lower and "project" not in resume_lower:
            suggestions.append(
                "Highlight projects that demonstrate the required skills."
            )

        if not suggestions:
            suggestions.append(
                "Resume contains several skills relevant to the job description."
            )

        return {
            "ats_score": round(ats_score, 2),
            "matched_skills": matched_skills,
            "missing_skills": missing_skills,
            "suggestions": suggestions,
        }