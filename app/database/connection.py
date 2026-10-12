import os

from dotenv import load_dotenv
from sqlalchemy import create_engine

from sqlalchemy import create_engine

from app.config import settings

engine = create_engine(
    settings.DATABASE_URL,
    echo=True,
)

engine = create_engine(
    settings.DATABASE_URL,
    echo=True,
)