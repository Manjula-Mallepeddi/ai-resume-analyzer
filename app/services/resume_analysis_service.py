from sqlalchemy.orm import Session

from app.models.resume import Resume
from app.models.user import User
from app.models.analysis import Analysis
from app.services.ai_analysis_service import AIAnalysisService


class ResumeAnalysisService:
    """Handles resume analysis and AI-powered resume operations."""

    def __init__(self, db: Session):
        self.db = db
        self.ai_service = AIAnalysisService()

    def _get_user_resume(
        self,
        resume_id: int,
        current_user_email: str,
    ) -> Resume:
        """
        Get a resume only if it belongs to the authenticated user.
        """

        user = (
            self.db.query(User)
            .filter(User.email == current_user_email)
            .first()
        )

        if not user:
            raise ValueError("User not found.")

        resume = (
            self.db.query(Resume)
            .filter(
                Resume.id == resume_id,
                Resume.user_id == user.id,
            )
            .first()
        )

        if not resume:
            raise ValueError(
                "Resume not found or you do not have access to it."
            )

        return resume

    def analyze_resume(
        self,
        resume_id: int,
        job_description: str,
        current_user_email: str,
    ) -> dict:

        # 1. Verify ownership
        resume = self._get_user_resume(
            resume_id,
            current_user_email,
        )

        # 2. Send resume + job description to Gemini
        result = self.ai_service.analyze(
            resume_text=resume.extracted_text,
            job_description=job_description,
        )

        # 3. Save analysis to PostgreSQL
        analysis = Analysis(
            resume_id=resume.id,
            job_description=job_description,
            ats_score=result.ats_score,
            matched_skills=result.matched_skills,
            missing_skills=result.missing_skills,
            suggestions=result.suggestions,
        )

        self.db.add(analysis)
        self.db.commit()
        self.db.refresh(analysis)

        # 4. Return the same response as before
        return {
            "resume_id": resume.id,
            **result.model_dump(),
        }

    def rewrite_resume(
        self,
        resume_id: int,
        job_description: str,
        current_user_email: str,
    ) -> dict:

        resume = self._get_user_resume(
            resume_id,
            current_user_email,
        )

        rewritten_resume = self.ai_service.rewrite_resume(
            resume_text=resume.extracted_text,
            job_description=job_description,
        )

        return {
            "resume_id": resume.id,
            "rewritten_resume": rewritten_resume,
        }

    def generate_cover_letter(
        self,
        resume_id: int,
        job_description: str,
        current_user_email: str,
    ) -> dict:

        resume = self._get_user_resume(
            resume_id,
            current_user_email,
        )

        cover_letter = self.ai_service.generate_cover_letter(
            resume_text=resume.extracted_text,
            job_description=job_description,
        )

        return {
            "resume_id": resume.id,
            "cover_letter": cover_letter,
        }

    def analyze_skill_gap(
        self,
        resume_id: int,
        job_description: str,
        current_user_email: str,
    ) -> dict:

        resume = self._get_user_resume(
            resume_id,
            current_user_email,
        )

        result = self.ai_service.analyze_skill_gap(
            resume_text=resume.extracted_text,
            job_description=job_description,
        )

        return {
            "resume_id": resume.id,
            **result,
        }