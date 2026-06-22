from sqlalchemy import Column, String, Boolean, Integer, Float, JSON
from database import Base
import datetime


# ─── Models ───────────────────────────────────────────────────────────────────

class User(Base):
    __tablename__ = "users"

    id              = Column(String, primary_key=True, index=True)
    email           = Column(String, unique=True, index=True, nullable=False)
    password_hash   = Column(String, nullable=False)
    role            = Column(String, default="student")
    name            = Column(String, nullable=False)
    avatar          = Column(String, nullable=True)
    profile_complete = Column(Boolean, default=False)
    created_at      = Column(String, default=lambda: datetime.date.today().isoformat())

    # Student fields
    roll_no         = Column(String, nullable=True)
    branch          = Column(String, nullable=True)
    skills          = Column(JSON, default=list)
    interests       = Column(JSON, default=list)
    team_id         = Column(String, nullable=True)
    team_role       = Column(String, nullable=True)
    is_ceo          = Column(Boolean, default=False)
    mentor_id       = Column(String, nullable=True)

    # Mentor fields
    specialization  = Column(String, nullable=True)
    assigned_teams  = Column(JSON, default=list)


class ApprovedStudent(Base):
    __tablename__ = "approved_students"

    id      = Column(String, primary_key=True)
    name    = Column(String, nullable=False)
    roll_no = Column(String, unique=True, nullable=False)
    email   = Column(String, unique=True, nullable=False)


class Team(Base):
    __tablename__ = "teams"

    id                = Column(String, primary_key=True, index=True)
    startup_name      = Column(String, nullable=False)
    problem_statement = Column(String, nullable=True)
    solution          = Column(String, nullable=True)
    industry          = Column(String, nullable=True)
    stage             = Column(Integer, default=0)
    ceo_id            = Column(String, nullable=True)
    mentor_id         = Column(String, nullable=True)
    members           = Column(JSON, default=list)  # [{userId, teamRole, isCEO}]
    created_at        = Column(String, default=lambda: datetime.date.today().isoformat())


class Invitation(Base):
    __tablename__ = "invitations"

    id           = Column(String, primary_key=True, index=True)
    team_id      = Column(String, nullable=False)
    from_user_id = Column(String, nullable=False)
    to_user_id   = Column(String, nullable=False)
    role         = Column(String, nullable=False)
    status       = Column(String, default="pending")
    created_at   = Column(String, default=lambda: datetime.datetime.utcnow().isoformat())


class Task(Base):
    __tablename__ = "tasks"

    id            = Column(String, primary_key=True, index=True)
    title         = Column(String, nullable=False)
    description   = Column(String, nullable=True)
    due_date      = Column(String, nullable=True)
    stage         = Column(Integer, nullable=True)
    created_by_id = Column(String, nullable=True)
    created_at    = Column(String, default=lambda: datetime.datetime.utcnow().isoformat())


class Submission(Base):
    __tablename__ = "submissions"

    id           = Column(String, primary_key=True, index=True)
    student_id   = Column(String, nullable=False)
    team_id      = Column(String, nullable=False)
    task_id      = Column(String, nullable=True)
    title        = Column(String, nullable=False)
    content      = Column(String, nullable=True)
    file_url     = Column(String, nullable=True)
    status       = Column(String, default="pending")
    grade        = Column(Float, nullable=True)
    feedback     = Column(String, nullable=True)
    submitted_at = Column(String, default=lambda: datetime.datetime.utcnow().isoformat())
    graded_at    = Column(String, nullable=True)


class Announcement(Base):
    __tablename__ = "announcements"

    id              = Column(String, primary_key=True, index=True)
    title           = Column(String, nullable=False)
    body            = Column(String, nullable=True)
    created_by_id   = Column(String, nullable=False)
    created_by_role = Column(String, nullable=False)
    created_by_name = Column(String, nullable=False)
    recipients      = Column(String, default="all")  # "all" | "students" | "mentors" | "team-<id>"
    team_id         = Column(String, nullable=True)
    created_at      = Column(String, default=lambda: datetime.datetime.utcnow().isoformat())


class PrevStartup(Base):
    __tablename__ = "prev_startups"

    id          = Column(String, primary_key=True, index=True)
    name        = Column(String, nullable=False)
    description = Column(String, nullable=True)
    industry    = Column(String, nullable=True)
    year        = Column(Integer, nullable=True)
    founders    = Column(JSON, default=list)
    image_url   = Column(String, nullable=True)
    created_at  = Column(String, default=lambda: datetime.datetime.utcnow().isoformat())
