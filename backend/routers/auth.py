from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional
from database import get_db
from models import User, ApprovedStudent
from auth import verify_password, create_access_token, decode_token, hash_password
from datetime import timedelta
import uuid

router = APIRouter(prefix="/api/auth", tags=["auth"])
bearer = HTTPBearer(auto_error=False)


class LoginRequest(BaseModel):
    email: str
    password: str


def user_to_dict(u: User) -> dict:
    return {
        "id": u.id, "email": u.email, "role": u.role, "name": u.name,
        "avatar": u.avatar, "profileComplete": u.profile_complete,
        "createdAt": u.created_at, "rollNo": u.roll_no, "branch": u.branch,
        "skills": u.skills or [], "interests": u.interests or [],
        "teamId": u.team_id, "teamRole": u.team_role, "isCEO": u.is_ceo,
        "mentorId": u.mentor_id, "specialization": u.specialization,
        "assignedTeams": u.assigned_teams or [],
    }


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer),
    db: Session = Depends(get_db),
) -> User:
    if not credentials:
        raise HTTPException(status_code=401, detail="Not authenticated")
    payload = decode_token(credentials.credentials)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    if payload.get("role") == "non-ite":
        return User(
            id="guest",
            email=payload.get("email", "guest@observer.com"),
            role="non-ite",
            name="Guest Observer",
            profile_complete=True
        )
    user = db.query(User).filter(User.id == payload.get("sub")).first()
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user


@router.get("/force-seed")
def force_seed(db: Session = Depends(get_db)):
    from seed import seed
    try:
        seed(db)
        admin = db.query(User).filter(User.email == "shashikant.chaudhary@vnit.ac.in").first()
        return {
            "success": True, 
            "message": "Forced seed successful.", 
            "admin_exists": admin is not None,
            "admin_role": admin.role if admin else None
        }
    except Exception as e:
        return {"success": False, "error": str(e)}

@router.post("/login")
def login(body: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == body.email).first()
    if not user:
        raise HTTPException(status_code=401, detail="No account found with this email address.")
    if not verify_password(body.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Incorrect password. Please try again.")
    token = create_access_token({"sub": user.id, "role": user.role})
    return {"success": True, "token": token, "user": user_to_dict(user)}


class GuestLoginRequest(BaseModel):
    email: str


@router.post("/guest-login")
def guest_login(body: GuestLoginRequest, db: Session = Depends(get_db)):
    import re
    email_regex = re.compile(r"^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$")
    if not email_regex.match(body.email):
        raise HTTPException(status_code=400, detail="Invalid email format.")
    
    token = create_access_token(
        {"sub": "guest", "role": "non-ite", "email": body.email},
        expires_delta=timedelta(hours=2)
    )
    
    guest_user = {
        "id": "guest",
        "email": body.email,
        "role": "non-ite",
        "name": "Guest Observer",
        "avatar": "GO",
        "profileComplete": True,
        "createdAt": "",
        "rollNo": "",
        "branch": "",
        "skills": [],
        "interests": [],
        "teamId": None,
        "teamRole": None,
        "isCEO": False,
        "mentorId": None,
        "specialization": "",
        "assignedTeams": []
    }
    return {"success": True, "token": token, "user": guest_user}


@router.get("/me")
def me(current_user: User = Depends(get_current_user)):
    return user_to_dict(current_user)


@router.post("/logout")
def logout():
    # Stateless JWT — client discards the token
    return {"success": True}


class RegisterRequest(BaseModel):
    email: str
    password: str
    name: str
    rollNo: Optional[str] = None
    branch: Optional[str] = None
    avatar: Optional[str] = None
    skills: Optional[List[str]] = []
    interests: Optional[List[str]] = []


@router.post("/register")
def register(body: RegisterRequest, db: Session = Depends(get_db)):
    # Check approved list
    approved = db.query(ApprovedStudent).filter(ApprovedStudent.email == body.email).first()
    if not approved:
        raise HTTPException(status_code=403,
            detail="This email is not on the approved student list. Contact your ITE coordinator.")
    # Check duplicate
    if db.query(User).filter(User.email == body.email).first():
        raise HTTPException(status_code=409,
            detail="An account with this email already exists. Please log in instead.")
    avatar = body.avatar or ''.join(p[0] for p in body.name.split()[:2]).upper()
    user = User(
        id=str(uuid.uuid4()),
        email=body.email,
        password_hash=hash_password(body.password),
        role="student",
        name=body.name,
        avatar=avatar,
        roll_no=body.rollNo,
        branch=body.branch,
        skills=body.skills,
        interests=body.interests,
        profile_complete=True,
    )
    db.add(user)
    db.commit()
    token = create_access_token({"sub": user.id, "role": user.role})
    return {"success": True, "token": token, "user": user_to_dict(user)}
