from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from database import get_db
from models import User, Team, Announcement, Task, Submission
from routers.auth import get_current_user

router = APIRouter(prefix="/api/admin", tags=["admin"])

@router.get("/stats-summary")
def get_stats_summary(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin only")
        
    # Aggregate Queries using func.count for efficiency
    total_students = db.query(func.count(User.id)).filter(User.role == "student").scalar() or 0
    students_in_teams = db.query(func.count(User.id)).filter(User.role == "student", User.team_id != None).scalar() or 0
    
    active_teams = db.query(func.count(Team.id)).scalar() or 0
    mentors = db.query(func.count(User.id)).filter(User.role == "mentor").scalar() or 0
    announcements = db.query(func.count(Announcement.id)).scalar() or 0
    
    tasks = db.query(func.count(Task.id)).scalar() or 0
    submissions = db.query(func.count(Submission.id)).scalar() or 0
    
    return {
        "students": {
            "total": total_students,
            "in_teams": students_in_teams
        },
        "teams": active_teams,
        "mentors": mentors,
        "announcements": announcements,
        "tasks": {
            "total": tasks,
            "submissions": submissions
        }
    }
