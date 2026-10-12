from sqlalchemy.orm import Session

from app.models.user import User
from app.repositories.user_repository import UserRepository
from app.schemas.user import UserCreate, UserLogin
from app.utils.jwt import create_access_token
from app.utils.security import hash_password, verify_password


class AuthService:
    """Handles authentication-related business logic."""

    def __init__(self, db: Session):
        self.user_repo = UserRepository(db)

    def register_user(self, user_data: UserCreate) -> User:
        existing_user = self.user_repo.get_by_email(user_data.email)

        if existing_user:
            raise ValueError("Email already registered.")

        user = User(
            full_name=user_data.full_name,
            email=user_data.email,
            password_hash=hash_password(user_data.password),
        )

        return self.user_repo.create(user)

    def login_user(self, login_data: UserLogin) -> str:
        user = self.user_repo.get_by_email(login_data.email)

        if not user:
            raise ValueError("Invalid email or password.")

        if not verify_password(
            login_data.password,
            user.password_hash,
        ):
            raise ValueError("Invalid email or password.")

        return create_access_token(
            data={"sub": user.email}
        )   