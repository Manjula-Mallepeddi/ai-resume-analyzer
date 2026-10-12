from pydantic import BaseModel, Field


class ResumeAnalysisRequest(BaseModel):
    resume_id: int
    job_description: str = Field(..., min_length=20)


class AIAnalysisResult(BaseModel):
    ats_score: float
    matched_skills: list[str]
    missing_skills: list[str]
    suggestions: list[str]


class ResumeAnalysisResponse(BaseModel):
    resume_id: int
    ats_score: float
    matched_skills: list[str]
    missing_skills: list[str]
    suggestions: list[str]

class ResumeRewriteRequest(BaseModel):
    resume_id: int
    job_description: str = Field(..., min_length=20)


class ResumeRewriteResponse(BaseModel):
    resume_id: int
    rewritten_resume: str

class CoverLetterRequest(BaseModel):
    resume_id: int
    job_description: str = Field(..., min_length=20)


class CoverLetterResponse(BaseModel):
    resume_id: int
    cover_letter: str

class SkillGapRequest(BaseModel):
    resume_id: int
    job_description: str = Field(..., min_length=20)


class SkillGapResponse(BaseModel):
    resume_id: int
    skill_gaps: list[str]
    learning_recommendations: list[str]