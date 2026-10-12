from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from sqlalchemy.orm import Session
from pathlib import Path
import tempfile

from app.database.dependencies import get_db
from app.models.resume import Resume
from app.models.user import User
from app.models.analysis import Analysis
from app.api.dependencies import get_current_user_email
from app.parsers.pdf_parser import extract_text_from_pdf
from app.parsers.docx_parser import extract_text_from_docx

from app.schemas.analysis import (
    ResumeAnalysisRequest,
    ResumeAnalysisResponse,
    ResumeRewriteRequest,
    ResumeRewriteResponse,
    CoverLetterRequest,
    CoverLetterResponse,
    SkillGapRequest,
    SkillGapResponse,
)

from app.services.resume_analysis_service import ResumeAnalysisService


router = APIRouter(
    prefix="/resume",
    tags=["Resume"],
)


# ============================================================
# Upload Resume
# ============================================================

@router.post("/upload")
async def upload_resume(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user_email: str = Depends(get_current_user_email),
):
    allowed_types = {
        "application/pdf": ".pdf",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document": ".docx",
    }

    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=400,
            detail="Only PDF and DOCX files are supported.",
        )

    # Find the logged-in user
    user = (
        db.query(User)
        .filter(User.email == current_user_email)
        .first()
    )

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found.",
        )

    suffix = allowed_types[file.content_type]
    temp_path = None

    try:
        # Save uploaded file temporarily
        with tempfile.NamedTemporaryFile(
            delete=False,
            suffix=suffix,
        ) as temp_file:
            content = await file.read()
            temp_file.write(content)
            temp_path = Path(temp_file.name)

        # Extract resume text
        if suffix == ".pdf":
            text = extract_text_from_pdf(temp_path)
        else:
            text = extract_text_from_docx(temp_path)

        if not text.strip():
            raise HTTPException(
                status_code=400,
                detail="Could not extract text from the resume.",
            )

        # Store resume against authenticated user's UUID
        resume = Resume(
            user_id=user.id,
            filename=file.filename,
            file_type=suffix,
            extracted_text=text,
        )

        db.add(resume)
        db.commit()
        db.refresh(resume)

        return {
            "message": "Resume uploaded successfully",
            "resume_id": resume.id,
            "filename": resume.filename,
            "file_type": resume.file_type,
            "text": resume.extracted_text,
        }

    except HTTPException:
        db.rollback()
        raise

    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"Failed to process resume: {str(e)}",
        )

    finally:
        if temp_path and temp_path.exists():
            temp_path.unlink()


# ============================================================
# Analyze Resume
# ============================================================

@router.post(
    "/analyze",
    response_model=ResumeAnalysisResponse,
)
def analyze_resume(
    request: ResumeAnalysisRequest,
    db: Session = Depends(get_db),
    current_user_email: str = Depends(get_current_user_email),
):
    service = ResumeAnalysisService(db)

    try:
        return service.analyze_resume(
            resume_id=request.resume_id,
            job_description=request.job_description,
            current_user_email=current_user_email,
        )

    except ValueError as e:
        raise HTTPException(
            status_code=404,
            detail=str(e),
        )


# ============================================================
# Rewrite Resume
# ============================================================

@router.post(
    "/rewrite",
    response_model=ResumeRewriteResponse,
)
def rewrite_resume(
    request: ResumeRewriteRequest,
    db: Session = Depends(get_db),
    current_user_email: str = Depends(get_current_user_email),
):
    service = ResumeAnalysisService(db)

    try:
        return service.rewrite_resume(
            resume_id=request.resume_id,
            job_description=request.job_description,
            current_user_email=current_user_email,
        )

    except ValueError as e:
        raise HTTPException(
            status_code=404,
            detail=str(e),
        )


# ============================================================
# Generate Cover Letter
# ============================================================

@router.post(
    "/cover-letter",
    response_model=CoverLetterResponse,
)
def generate_cover_letter(
    request: CoverLetterRequest,
    db: Session = Depends(get_db),
    current_user_email: str = Depends(get_current_user_email),
):
    service = ResumeAnalysisService(db)

    try:
        return service.generate_cover_letter(
            resume_id=request.resume_id,
            job_description=request.job_description,
            current_user_email=current_user_email,
        )

    except ValueError as e:
        raise HTTPException(
            status_code=404,
            detail=str(e),
        )


# ============================================================
# Skill Gap Analysis
# ============================================================

@router.post(
    "/skill-gap",
    response_model=SkillGapResponse,
)
def analyze_skill_gap(
    request: SkillGapRequest,
    db: Session = Depends(get_db),
    current_user_email: str = Depends(get_current_user_email),
):
    service = ResumeAnalysisService(db)

    try:
        return service.analyze_skill_gap(
            resume_id=request.resume_id,
            job_description=request.job_description,
            current_user_email=current_user_email,
        )

    except ValueError as e:
        raise HTTPException(
            status_code=404,
            detail=str(e),
        )


# ============================================================
# Resume Analysis History
# ============================================================

@router.get("/history")
def get_resume_history(
    db: Session = Depends(get_db),
    current_user_email: str = Depends(get_current_user_email),
):
    # Find the logged-in user
    user = (
        db.query(User)
        .filter(User.email == current_user_email)
        .first()
    )

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found.",
        )

    # Get analyses belonging only to this user's resumes
    history = (
        db.query(Analysis, Resume)
        .join(
            Resume,
            Analysis.resume_id == Resume.id,
        )
        .filter(
            Resume.user_id == user.id,
        )
        .order_by(
            Analysis.created_at.desc(),
        )
        .all()
    )

    return [
        {
            "analysis_id": analysis.id,
            "resume_id": resume.id,
            "filename": resume.filename,
            "ats_score": analysis.ats_score,
            "job_description": analysis.job_description,
            "matched_skills": analysis.matched_skills,
            "missing_skills": analysis.missing_skills,
            "suggestions": analysis.suggestions,
            "created_at": analysis.created_at,
        }
        for analysis, resume in history
    ]