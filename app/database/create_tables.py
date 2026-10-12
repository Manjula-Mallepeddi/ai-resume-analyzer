from app.database.connection import engine
from app.database.base import Base

# Import all models
from app.models import User

Base.metadata.create_all(bind=engine)

print("✅ Tables created successfully!")