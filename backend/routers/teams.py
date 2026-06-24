from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional, List
from database import get_db
from models import User, Team
from routers.auth import get_current_user, user_to_dict
import uuid

router = APIRouter(prefix="/api/teams", tags=["teams"])


def team_to_dict(t: Team, db: Session = None) -> dict:
    d = {
        "id": t.id, "startupName": t.startup_name,
        "problemStatement": t.problem_statement, "solution": t.solution,
        "industry": t.industry, "stage": t.stage,
        "ceoId": t.ceo_id, "mentorId": t.mentor_id,
        "members": t.members or [], "createdAt": t.created_at,
    }
    if db:
        if t.ceo_id:
            ceo = db.query(User).filter(User.id == t.ceo_id).first()
            if ceo: d["ceoName"] = ceo.name
        if t.mentor_id:
            mentor = db.query(User).filter(User.id == t.mentor_id).first()
            if mentor: d["mentorName"] = mentor.name
    return d


class CreateTeamRequest(BaseModel):
    startupName: str
    problemStatement: Optional[str] = None
    solution: Optional[str] = None
    industry: Optional[str] = None
    ceoId: Optional[str] = None
    mentorId: Optional[str] = None


class UpdateTeamRequest(BaseModel):
    startupName: Optional[str] = None
    problemStatement: Optional[str] = None
    solution: Optional[str] = None
    industry: Optional[str] = None
    ceoId: Optional[str] = None
    mentorId: Optional[str] = None
    members: Optional[List[dict]] = None


class StageRequest(BaseModel):
    stage: int


@router.get("")
def list_teams(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    query = db.query(Team)
    if current_user.role == "student":
        if current_user.team_id:
            query = query.filter(Team.id == current_user.team_id)
        else:
            return []
    elif current_user.role == "mentor":
        query = query.filter(Team.mentor_id == current_user.id)
    return [team_to_dict(t, db) for t in query.all()]


@router.post("")
def create_team(body: CreateTeamRequest, db: Session = Depends(get_db),
                current_user: User = Depends(get_current_user)):
    if current_user.role not in ("admin", "mentor"):
        raise HTTPException(status_code=403, detail="Admin/Mentor only")
    t = Team(
        id=str(uuid.uuid4()),
        startup_name=body.startupName,
        problem_statement=body.problemStatement,
        solution=body.solution,
        industry=body.industry,
        ceo_id=body.ceoId,
        mentor_id=body.mentorId,
        members=[],
    )
    db.add(t)
    # If ceoId provided, add as member
    if body.ceoId:
        t.members = [{"userId": body.ceoId, "teamRole": "CEO", "isCEO": True}]
        ceo = db.query(User).filter(User.id == body.ceoId).first()
        if ceo:
            ceo.team_id = t.id
            ceo.team_role = "CEO"
            ceo.is_ceo = True
    db.commit()
    return team_to_dict(t, db)


@router.get("/{team_id}")
def get_team(team_id: str, db: Session = Depends(get_db)):
    t = db.query(Team).filter(Team.id == team_id).first()
    if not t:
        raise HTTPException(status_code=404, detail="Team not found")
    result = team_to_dict(t, db)
    # Enrich members with user data
    enriched = []
    for m in (t.members or []):
        u = db.query(User).filter(User.id == m.get("userId")).first()
        enriched.append({**m, "user": user_to_dict(u) if u else None})
    result["members"] = enriched
    return result


@router.patch("/{team_id}")
def update_team(team_id: str, body: UpdateTeamRequest, db: Session = Depends(get_db),
                current_user: User = Depends(get_current_user)):
    if current_user.role not in ("admin", "mentor"):
        raise HTTPException(status_code=403, detail="Admin/Mentor only")
    t = db.query(Team).filter(Team.id == team_id).first()
    if not t:
        raise HTTPException(status_code=404, detail="Team not found")
    if body.startupName is not None:      t.startup_name = body.startupName
    if body.problemStatement is not None: t.problem_statement = body.problemStatement
    if body.solution is not None:         t.solution = body.solution
    if body.industry is not None:         t.industry = body.industry
    if body.ceoId is not None:            t.ceo_id = body.ceoId
    if body.mentorId is not None:         t.mentor_id = body.mentorId
    if body.members is not None:          t.members = body.members
    db.commit()
    return team_to_dict(t, db)


@router.patch("/{team_id}/stage")
def advance_stage(team_id: str, body: StageRequest, db: Session = Depends(get_db),
                  current_user: User = Depends(get_current_user)):
    if current_user.role not in ("admin", "mentor"):
        raise HTTPException(status_code=403, detail="Admin/Mentor only")
    t = db.query(Team).filter(Team.id == team_id).first()
    if not t:
        raise HTTPException(status_code=404, detail="Team not found")
    if not (0 <= body.stage <= 5):
        raise HTTPException(status_code=400, detail="Stage must be 0–5")
    t.stage = body.stage
    db.commit()
    return team_to_dict(t, db)


@router.delete("/{team_id}")
def delete_team(team_id: str, db: Session = Depends(get_db),
                current_user: User = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin only")
    t = db.query(Team).filter(Team.id == team_id).first()
    if not t:
        raise HTTPException(status_code=404, detail="Team not found")
    db.delete(t)
    db.commit()
    return {"success": True}
