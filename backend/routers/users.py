from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional, List
from database import get_db
from models import User, ApprovedStudent
from routers.auth import get_current_user, user_to_dict
import uuid, csv, io

router = APIRouter(prefix="/api/users", tags=["users"])


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
    added = 0
    for row in reader:
        email = row.get("email", "").strip()
        if not email:
            continue
        exists = db.query(ApprovedStudent).filter(ApprovedStudent.email == email).first()
        if not exists:
            db.add(ApprovedStudent(
                id=str(uuid.uuid4()),
                name=row.get("name", "").strip(),
                roll_no=row.get("rollNo", row.get("roll_no", "")).strip(),
                email=email,
            ))
            added += 1
    db.commit()
    return {"added": added}


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
