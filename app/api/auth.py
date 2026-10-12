from fastapi import APIRouter, HTTPException, status
from app.api.dependencies import get_current_user_email
from fastapi import Depends
from app.api.dependencies import DBSession
from app.schemas.user import (
    UserCreate,
    UserResponse,
    UserLogin,
    Token,
)
from app.services.auth_service import AuthService

router = APIRouter(
    tags=["Authentication"],
)

@router.post("/register", response_model=UserResponse)
def register(
    user_data: UserCreate,
    db: DBSession,
):
    service = AuthService(db)

    try:
        return service.register_user(user_data)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )


@router.post(
    "/login",
    response_model=Token,
)
def login(
    login_data: UserLogin,
    db: DBSession,
):
    service = AuthService(db)

    try:
        access_token = service.login_user(login_data)

        return {
            "access_token": access_token,
            "token_type": "bearer",
        }

    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(e),
        )
@router.get("/me")
def get_me(
    email: str = Depends(get_current_user_email),
):
    return {
        "message": "Authentication successful",
        "email": email,
    }