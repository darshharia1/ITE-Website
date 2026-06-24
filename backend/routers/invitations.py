from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from database import get_db
from models import User, Invitation, Team
from routers.auth import get_current_user, user_to_dict
import uuid

router = APIRouter(prefix="/api/invitations", tags=["invitations"])


def inv_to_dict(i: Invitation) -> dict:
    return {
        "id": i.id, "teamId": i.team_id, "fromUserId": i.from_user_id,
        "toUserId": i.to_user_id, "role": i.role, "status": i.status,
        "createdAt": i.created_at,
    }


class SendInviteRequest(BaseModel):
    toUserId: str
    role: str


class RespondInviteRequest(BaseModel):
    status: str  # "accepted" | "rejected"


@router.get("/pending")
def pending_invites(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    invs = db.query(Invitation).filter(
        Invitation.to_user_id == current_user.id,
        Invitation.status == "pending"
    ).all()
    return [inv_to_dict(i) for i in invs]

@router.get("/sent")
def sent_invites(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    invs = db.query(Invitation).filter(
        Invitation.from_user_id == current_user.id
    ).all()
    return [inv_to_dict(i) for i in invs]


@router.post("")
def send_invite(body: SendInviteRequest, db: Session = Depends(get_db),
                current_user: User = Depends(get_current_user)):
    if not current_user.is_ceo and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Only CEOs can send invitations")
    # Find CEO's team
    team = db.query(Team).filter(Team.ceo_id == current_user.id).first()
    if not team and current_user.role != "admin":
        raise HTTPException(status_code=400, detail="You are not assigned to a team")
    team_id = team.id if team else current_user.team_id
    inv = Invitation(
        id=str(uuid.uuid4()),
        team_id=team_id,
        from_user_id=current_user.id,
        to_user_id=body.toUserId,
        role=body.role,
        status="pending",
    )
    db.add(inv)
    db.commit()
    return inv_to_dict(inv)


@router.patch("/{inv_id}")
def respond_invite(inv_id: str, body: RespondInviteRequest, db: Session = Depends(get_db),
                   current_user: User = Depends(get_current_user)):
    if body.status not in ("accepted", "rejected"):
        raise HTTPException(status_code=400, detail="Status must be accepted or rejected")
    inv = db.query(Invitation).filter(Invitation.id == inv_id).first()
    if not inv:
        raise HTTPException(status_code=404, detail="Invitation not found")
    if inv.to_user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Forbidden")
    inv.status = body.status
    if body.status == "accepted":
        # Add user to team
        team = db.query(Team).filter(Team.id == inv.team_id).first()
        if team:
            members = list(team.members or [])
            # Remove if already exists
            members = [m for m in members if m.get("userId") != current_user.id]
            members.append({"userId": current_user.id, "teamRole": inv.role, "isCEO": False})
            team.members = members
            current_user.team_id = team.id
            current_user.team_role = inv.role
    db.commit()
    return inv_to_dict(inv)
