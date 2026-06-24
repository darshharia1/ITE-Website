from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional, List
from database import get_db
from models import User, ApprovedStudent, Team
from routers.auth import get_current_user, user_to_dict
from auth import hash_password
import uuid, csv, io

router = APIRouter(prefix="/api/users", tags=["users"])


class CreateMentorRequest(BaseModel):
    name: str
    email: str
    password: str = "mentor123"
    specialization: Optional[str] = None


class UpdateUserRequest(BaseModel):
    name: Optional[str] = None
    avatar: Optional[str] = None
    rollNo: Optional[str] = None
    branch: Optional[str] = None
    skills: Optional[List[str]] = None
    interests: Optional[List[str]] = None
    specialization: Optional[str] = None
    profileComplete: Optional[bool] = None
    teamRole: Optional[str] = None
    teamId: Optional[str] = None
    mentorId: Optional[str] = None
    assignedTeams: Optional[List[str]] = None


@router.get("")
def list_users(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin only")
    return [user_to_dict(u) for u in db.query(User).all()]


@router.get("/students")
def list_students(db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    return [user_to_dict(u) for u in db.query(User).filter(User.role == "student").all()]


@router.get("/mentors")
def list_mentors(db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    return [user_to_dict(u) for u in db.query(User).filter(User.role == "mentor").all()]


@router.post("/mentors")
def create_mentor(body: CreateMentorRequest, db: Session = Depends(get_db),
                  current_user: User = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin only")
    if db.query(User).filter(User.email == body.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")
    av = ''.join([p[0] for p in body.name.split(' ') if p])[:2].upper()
    mentor = User(
        id=str(uuid.uuid4()),
        email=body.email,
        password_hash=hash_password(body.password),
        role="mentor",
        name=body.name,
        avatar=av,
        specialization=body.specialization,
        profile_complete=True,
        assigned_teams=[],
    )
    db.add(mentor)
    db.commit()
    return user_to_dict(mentor)


@router.get("/approved")
def list_approved(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin only")
    rows = db.query(ApprovedStudent).all()
    return [{"id": r.id, "name": r.name, "rollNo": r.roll_no, "email": r.email} for r in rows]


@router.post("/approved")
async def bulk_approved(file: UploadFile = File(...), db: Session = Depends(get_db),
                         current_user: User = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin only")
    content = await file.read()
    reader = csv.DictReader(io.StringIO(content.decode()))
    if reader.fieldnames:
        reader.fieldnames = [str(f).strip().lower() for f in reader.fieldnames]
        
    added = 0
    for row in reader:
        email = row.get("email", row.get("email address", "")).strip()
        if not email:
            continue
            
        name = row.get("name", row.get("student name", "")).strip()
        roll_no = row.get("roll_no", row.get("rollno", row.get("enrollment no.", ""))).strip()
        
        exists = db.query(ApprovedStudent).filter(ApprovedStudent.email == email).first()
        if not exists:
            db.add(ApprovedStudent(
                id=str(uuid.uuid4()),
                name=name,
                roll_no=roll_no,
                email=email,
            ))
            added += 1
    db.commit()
    return {"added": added}


@router.delete("/approved")
def clear_approved(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin only")
    db.query(ApprovedStudent).delete()
    db.commit()
    return {"success": True}


@router.get("/{user_id}")
def get_user(user_id: str, db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    u = db.query(User).filter(User.id == user_id).first()
    if not u:
        raise HTTPException(status_code=404, detail="User not found")
    return user_to_dict(u)


@router.patch("/{user_id}")
def update_user(user_id: str, body: UpdateUserRequest, db: Session = Depends(get_db),
                current_user: User = Depends(get_current_user)):
    if current_user.id != user_id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Forbidden")
    u = db.query(User).filter(User.id == user_id).first()
    if not u:
        raise HTTPException(status_code=404, detail="User not found")
    if body.name is not None:           u.name = body.name
    if body.avatar is not None:         u.avatar = body.avatar
    if body.rollNo is not None:         u.roll_no = body.rollNo
    if body.branch is not None:         u.branch = body.branch
    if body.skills is not None:         u.skills = body.skills
    if body.interests is not None:      u.interests = body.interests
    if body.specialization is not None: u.specialization = body.specialization
    if body.profileComplete is not None: u.profile_complete = body.profileComplete
    if body.teamRole is not None:       u.team_role = body.teamRole
    if body.teamId is not None:         u.team_id = body.teamId
    if body.mentorId is not None:       u.mentor_id = body.mentorId
    if body.assignedTeams is not None:  u.assigned_teams = body.assignedTeams
    db.commit()
    return user_to_dict(u)


@router.patch("/{user_id}/assign-team")
def assign_team_to_mentor(user_id: str, db: Session = Depends(get_db),
                           current_user: User = Depends(get_current_user),
                           team_id: str = None):
    """Assign a team to a mentor and update team's mentorId"""
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin only")
    mentor = db.query(User).filter(User.id == user_id, User.role == "mentor").first()
    if not mentor: raise HTTPException(status_code=404, detail="Mentor not found")
    team = db.query(Team).filter(Team.id == team_id).first()
    if not team: raise HTTPException(status_code=404, detail="Team not found")
    team.mentor_id = user_id
    assigned = list(mentor.assigned_teams or [])
    if team_id not in assigned:
        assigned.append(team_id)
    mentor.assigned_teams = assigned
    db.commit()
    return user_to_dict(mentor)


@router.delete("/{user_id}")
def delete_user(user_id: str, db: Session = Depends(get_db),
                current_user: User = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin only")
    u = db.query(User).filter(User.id == user_id).first()
    if not u:
        raise HTTPException(status_code=404, detail="User not found")
    # If removing a mentor, unassign all their teams
    if u.role == "mentor":
        db.query(Team).filter(Team.mentor_id == user_id).update({"mentor_id": None})
    db.delete(u)
    db.commit()
    return {"success": True}
