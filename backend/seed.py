"""
Seed script — mirrors the exact demo data from the frontend js/data.js
Same emails, roles, teams, tasks, and announcements so the app works
immediately on first run with the README credentials.

In PRODUCTION (ENVIRONMENT=production) only the two real admin accounts
are seeded — no demo users, teams, or tasks are created.
"""
import uuid
import os
from sqlalchemy.orm import Session
from models import User, ApprovedStudent, Team, Task, Announcement, PrevStartup, Base
from auth import hash_password
from database import engine, SessionLocal


def uid():
    return str(uuid.uuid4())


# ── Real production admin accounts ────────────────────────────────────────────
REAL_ADMINS = [
    {
        "email": "shashikant.chaudhary@vnit.ac.in",
        "password": "vP7$kL9@mR2#qX5z",
        "name": "Shashikant Chaudhary",
        "avatar": "SC",
    },
    {
        "email": "admin2@vnit.ac.in",
        "password": "T4&bN8!cY6*wH3f",
        "name": "admin",
        "avatar": "AD",
    },
]

# Emails that belong to demo accounts — deleted in production cleanup
DEMO_EMAILS = {
    "admin@vnit.ac.in",
    "mentor-admin@vnit.ac.in",
    "dr.sharma@vnit.ac.in",
    "dr.patel@vnit.ac.in",
    "aarav.mehta@students.vnit.ac.in",
    "diya.singh@students.vnit.ac.in",
    "rohan.kumar@students.vnit.ac.in",
    "ananya.iyer@students.vnit.ac.in",
    "karan.joshi@students.vnit.ac.in",
    "nisha.verma@students.vnit.ac.in",
    "arjun.nair@students.vnit.ac.in",
    "pooja.desai@students.vnit.ac.in",
    "vikram.rao@students.vnit.ac.in",
    "priya.gupta@students.vnit.ac.in",
}


def _seed_real_admins(db: Session):
    """Ensure the two real admin accounts exist (idempotent)."""
    added = 0
    for admin in REAL_ADMINS:
        if not db.query(User).filter(User.email == admin["email"]).first():
            db.add(User(
                id=uid(),
                email=admin["email"],
                password_hash=hash_password(admin["password"]),
                role="admin",
                name=admin["name"],
                avatar=admin["avatar"],
                profile_complete=True,
                created_at="2024-06-01",
            ))
            added += 1
            print(f"[SEED] Admin created: {admin['name']} <{admin['email']}>")
    if added:
        db.commit()


def _remove_demo_accounts(db: Session):
    """Delete all demo users, teams, tasks, and approved students in production."""
    removed = 0
    for email in DEMO_EMAILS:
        user = db.query(User).filter(User.email == email).first()
        if user:
            db.delete(user)
            removed += 1
    if removed:
        db.commit()
        print(f"[SEED] Removed {removed} demo account(s) from production database.")

    # Also wipe demo teams, tasks, announcements, approved_students
    for model in [Team, Task, Announcement, ApprovedStudent]:
        count = db.query(model).delete()
        if count:
            print(f"[SEED] Cleared {count} row(s) from {model.__tablename__}.")
    db.commit()


def seed(db: Session):
    is_production = os.getenv("ENVIRONMENT", "development").lower() == "production"

    if is_production:
        print("[SEED] Production mode — removing demo data, seeding real admins only.")
        _remove_demo_accounts(db)
        _seed_real_admins(db)
        return

    # ── Development / local: seed full demo dataset ───────────────────────────
    if db.query(User).first():
        return  # Already seeded

    a1, a2 = uid(), uid()
    m1, m2 = uid(), uid()
    s_ids  = [uid() for _ in range(10)]
    s1,s2,s3,s4,s5,s6,s7,s8,s9,s10 = s_ids
    t1, t2 = uid(), uid()

    # ── Users ──────────────────────────────────────────────────────────────────
    users = [
        User(id=a1, email="admin@vnit.ac.in",        password_hash=hash_password("admin123"),
             role="admin",  name="Prof. Anand Chaturvedi", avatar="AC", profile_complete=True, created_at="2024-06-01"),
        User(id=a2, email="mentor-admin@vnit.ac.in",  password_hash=hash_password("mentor123"),
             role="admin",  name="Coordinator Admin",       avatar="CA", profile_complete=True, created_at="2024-06-01"),
        User(id=m1, email="dr.sharma@vnit.ac.in",     password_hash=hash_password("mentor123"),
             role="mentor", name="Dr. Ravi Sharma",         avatar="RS", profile_complete=True,
             specialization="Product & Market Strategy", assigned_teams=[t1], created_at="2024-06-01"),
        User(id=m2, email="dr.patel@vnit.ac.in",      password_hash=hash_password("mentor123"),
             role="mentor", name="Dr. Priya Patel",          avatar="PP", profile_complete=True,
             specialization="Finance & Operations", assigned_teams=[t2], created_at="2024-06-01"),
        User(id=s1, email="aarav.mehta@students.vnit.ac.in",   password_hash=hash_password("student123"),
             role="student", name="Aarav Mehta",   avatar="AM", roll_no="24BCE001", branch="Computer Science",
             skills=["Python","ML","Business Strategy"], interests=["AgriTech","IoT"],
             team_id=t1, team_role="CEO", is_ceo=True, mentor_id=m1, profile_complete=True, created_at="2024-06-10"),
        User(id=s2, email="diya.singh@students.vnit.ac.in",    password_hash=hash_password("student123"),
             role="student", name="Diya Singh",    avatar="DS", roll_no="24BCE002", branch="Electronics",
             skills=["React","Node.js","System Design"], interests=["SaaS","EdTech"],
             team_id=t1, team_role="CTO", mentor_id=m1, profile_complete=True, created_at="2024-06-10"),
        User(id=s3, email="rohan.kumar@students.vnit.ac.in",   password_hash=hash_password("student123"),
             role="student", name="Rohan Kumar",   avatar="RK", roll_no="24BCE003", branch="Mechanical",
             skills=["Financial Modeling","Excel"], interests=["Fintech"],
             team_id=t1, team_role="CFO", mentor_id=m1, profile_complete=True, created_at="2024-06-10"),
        User(id=s4, email="ananya.iyer@students.vnit.ac.in",   password_hash=hash_password("student123"),
             role="student", name="Ananya Iyer",   avatar="AI", roll_no="24BCE004", branch="Chemical",
             skills=["Marketing","Social Media"], interests=["Branding"],
             team_id=t1, team_role="CMO", mentor_id=m1, profile_complete=True, created_at="2024-06-10"),
        User(id=s5, email="karan.joshi@students.vnit.ac.in",   password_hash=hash_password("student123"),
             role="student", name="Karan Joshi",   avatar="KJ", roll_no="24BCE005", branch="Electrical",
             skills=["Leadership","Data Analysis"], interests=["EdTech"],
             team_id=t2, team_role="CEO", is_ceo=True, mentor_id=m2, profile_complete=True, created_at="2024-06-10"),
        User(id=s6, email="nisha.verma@students.vnit.ac.in",   password_hash=hash_password("student123"),
             role="student", name="Nisha Verma",   avatar="NV", roll_no="24BCE006", branch="Computer Science",
             skills=["Full Stack","AI/ML"], interests=["EdTech"],
             team_id=t2, team_role="CTO", mentor_id=m2, profile_complete=True, created_at="2024-06-10"),
        User(id=s7, email="arjun.nair@students.vnit.ac.in",    password_hash=hash_password("student123"),
             role="student", name="Arjun Nair",    avatar="AN", roll_no="24BCE007", branch="Civil",
             skills=["Finance","Fundraising"], interests=["Fintech"],
             team_id=t2, team_role="CFO", mentor_id=m2, profile_complete=True, created_at="2024-06-10"),
        User(id=s8, email="pooja.desai@students.vnit.ac.in",   password_hash=hash_password("student123"),
             role="student", name="Pooja Desai",   avatar="PD", roll_no="24BCE008", branch="Chemical",
             skills=["UI/UX","Figma"], interests=["HealthTech"],
             profile_complete=True, created_at="2024-06-10"),
        User(id=s9, email="vikram.rao@students.vnit.ac.in",    password_hash=hash_password("student123"),
             role="student", name="Vikram Rao",    avatar="VR", roll_no="24BCE009", branch="Mechanical",
             skills=["IoT","Embedded"], interests=["AgriTech"],
             profile_complete=True, created_at="2024-06-10"),
        User(id=s10,email="priya.gupta@students.vnit.ac.in",   password_hash=hash_password("student123"),
             role="student", name="Priya Gupta",   avatar="PG", roll_no="24BCE010", branch="Electronics",
             skills=["Marketing Analytics"], interests=["Consumer Tech"],
             profile_complete=True, created_at="2024-06-10"),
    ]
    db.add_all(users)

    # ── Approved Students ──────────────────────────────────────────────────────
    approved = [
        ApprovedStudent(id=uid(), name="Aarav Mehta",  roll_no="24BCE001", email="aarav.mehta@students.vnit.ac.in"),
        ApprovedStudent(id=uid(), name="Diya Singh",   roll_no="24BCE002", email="diya.singh@students.vnit.ac.in"),
        ApprovedStudent(id=uid(), name="Rohan Kumar",  roll_no="24BCE003", email="rohan.kumar@students.vnit.ac.in"),
        ApprovedStudent(id=uid(), name="Ananya Iyer",  roll_no="24BCE004", email="ananya.iyer@students.vnit.ac.in"),
        ApprovedStudent(id=uid(), name="Karan Joshi",  roll_no="24BCE005", email="karan.joshi@students.vnit.ac.in"),
        ApprovedStudent(id=uid(), name="Nisha Verma",  roll_no="24BCE006", email="nisha.verma@students.vnit.ac.in"),
        ApprovedStudent(id=uid(), name="Arjun Nair",   roll_no="24BCE007", email="arjun.nair@students.vnit.ac.in"),
        ApprovedStudent(id=uid(), name="Pooja Desai",  roll_no="24BCE008", email="pooja.desai@students.vnit.ac.in"),
        ApprovedStudent(id=uid(), name="Vikram Rao",   roll_no="24BCE009", email="vikram.rao@students.vnit.ac.in"),
        ApprovedStudent(id=uid(), name="Priya Gupta",  roll_no="24BCE010", email="priya.gupta@students.vnit.ac.in"),
    ]
    db.add_all(approved)

    # ── Teams ──────────────────────────────────────────────────────────────────
    teams = [
        Team(id=t1, startup_name="AgriTech Connect",
             problem_statement="Farmers lack real-time market price information, leading to exploitation by middlemen.",
             solution="A mobile-first platform connecting farmers directly to buyers with live price feeds and logistics support.",
             industry="Agriculture Technology", stage=3, ceo_id=s1, mentor_id=m1,
             members=[
                 {"userId": s1, "teamRole": "CEO", "isCEO": True},
                 {"userId": s2, "teamRole": "CTO", "isCEO": False},
                 {"userId": s3, "teamRole": "CFO", "isCEO": False},
                 {"userId": s4, "teamRole": "CMO", "isCEO": False},
             ]),
        Team(id=t2, startup_name="EduBridge",
             problem_statement="Rural students lack access to quality higher education guidance and mentorship.",
             solution="AI-powered platform matching rural students with mentors, providing personalized study plans.",
             industry="Education Technology", stage=1, ceo_id=s5, mentor_id=m2,
             members=[
                 {"userId": s5, "teamRole": "CEO", "isCEO": True},
                 {"userId": s6, "teamRole": "CTO", "isCEO": False},
                 {"userId": s7, "teamRole": "CFO", "isCEO": False},
             ]),
    ]
    db.add_all(teams)

    # ── Tasks ──────────────────────────────────────────────────────────────────
    tasks = [
        Task(id=uid(), title="Submit Business Model Canvas",
             description="Complete the BMC for your startup idea covering all 9 segments.",
             due_date="2024-07-15", stage=0, created_by_id=a1),
        Task(id=uid(), title="Market Research Report",
             description="Conduct surveys with at least 20 potential customers and present findings.",
             due_date="2024-07-30", stage=1, created_by_id=a1),
        Task(id=uid(), title="Customer Interview Summary",
             description="Record and transcribe 5 customer interviews, identify pain points.",
             due_date="2024-08-10", stage=2, created_by_id=a1),
        Task(id=uid(), title="MVP Prototype Demo",
             description="Build a working prototype (Figma or functional) and record a 3-minute demo.",
             due_date="2024-08-25", stage=3, created_by_id=a1),
        Task(id=uid(), title="Pitch Deck Submission",
             description="Create a 10-slide investor pitch deck. Upload PDF or Google Slides link.",
             due_date="2024-09-05", stage=4, created_by_id=a1),
    ]
    db.add_all(tasks)

    # ── Announcements ──────────────────────────────────────────────────────────
    anns = [
        Announcement(id=uid(), title="Welcome to ITE Startup Launch Pad!",
                     body="The ITE cohort 2024 is officially underway. Check the tasks section for your first assignment.",
                     created_by_id=a1, created_by_role="admin", created_by_name="Prof. Anand Chaturvedi",
                     recipients="all"),
        Announcement(id=uid(), title="Mentor Session – Market Research Workshop",
                     body="All teams are required to attend the Market Research workshop on Friday at 3 PM in Seminar Hall.",
                     created_by_id=m1, created_by_role="mentor", created_by_name="Dr. Ravi Sharma",
                     recipients=f"team-{t1}", team_id=t1),
        Announcement(id=uid(), title="Task Deadline Extended",
                     body="The Business Model Canvas deadline has been extended by one week due to semester exams.",
                     created_by_id=a1, created_by_role="admin", created_by_name="Prof. Anand Chaturvedi",
                     recipients="students"),
    ]
    db.add_all(anns)

    db.commit()
    print("[SEED] Database seeded with demo data.")


if __name__ == "__main__":
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    seed(db)
    db.close()
