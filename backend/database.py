from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase
import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./ite.db")
IS_PRODUCTION = os.getenv("ENVIRONMENT", "development").lower() == "production"

# SQLAlchemy requires "postgresql://" not "postgres://" (Render uses the old scheme)
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

connect_args = {}
if DATABASE_URL.startswith("sqlite"):
    # SQLite: allow cross-thread usage in dev
    connect_args["check_same_thread"] = False
elif DATABASE_URL.startswith("postgresql") and IS_PRODUCTION:
    # Production only (Render / Neon / Supabase): enforce SSL
    # Local Docker Postgres does not have SSL, so skip this in dev
    connect_args["sslmode"] = "require"

engine = create_engine(DATABASE_URL, connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    pass


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
