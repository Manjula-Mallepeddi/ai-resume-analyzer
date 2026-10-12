from typing import Annotated

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from app.database.dependencies import get_db
from app.utils.jwt import verify_access_token


DBSession = Annotated[Session, Depends(get_db)]

security = HTTPBearer()


def get_current_user_email(
    credentials: HTTPAuthorizationCredentials = Depends(security),
) -> str:

    try:
        return verify_access_token(credentials.credentials)

    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token.",
            headers={"WWW-Authenticate": "Bearer"},
        )