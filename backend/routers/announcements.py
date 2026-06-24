from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from database import get_db
from models import User, Announcement
from routers.auth import get_current_user
import uuid

router = APIRouter(prefix="/api/announcements", tags=["announcements"])


def ann_to_dict(a: Announcement) -> dict:
    return {
        "id": a.id, "title": a.title, "body": a.body,
        "createdById": a.created_by_id, "createdByRole": a.created_by_role,
        "createdByName": a.created_by_name, "recipients": a.recipients,
        "teamId": a.team_id, "createdAt": a.created_at,
    }


class CreateAnnouncementRequest(BaseModel):
    title: str
    body: Optional[str] = None
    recipients: str = "all"  # "all" | "students" | "mentors" | "team-<id>"
    teamId: Optional[str] = None


from sqlalchemy import or_

@router.get("")
def list_announcements(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    query = db.query(Announcement)

    if current_user.role == "admin":
        # Admin can see all global and targeted announcements
        pass
    elif current_user.role == "mentor":
        # Mentors see global, mentor-specific, and all team announcements
        query = query.filter(
            or_(
                Announcement.recipients == "all",
                Announcement.recipients == "mentors",
                Announcement.recipients.startswith("team-")
            )
        )
    elif current_user.role == "student":
        # Students see global, student-specific, and their own team announcements
        filters = [
            Announcement.recipients == "all",
            Announcement.recipients == "students"
        ]
        if current_user.team_id:
            filters.append(Announcement.recipients == f"team-{current_user.team_id}")
        query = query.filter(or_(*filters))

    # Optimal SQL ordering and fetching
    all_anns = query.order_by(Announcement.created_at.desc()).all()
    
    return [ann_to_dict(a) for a in all_anns]


@router.post("")
def create_announcement(body: CreateAnnouncementRequest, db: Session = Depends(get_db),
                        current_user: User = Depends(get_current_user)):
    if current_user.role not in ("admin", "mentor"):
        raise HTTPException(status_code=403, detail="Admin/Mentor only")
    a = Announcement(
        id=str(uuid.uuid4()),
        title=body.title,
        body=body.body,
        created_by_id=current_user.id,
        created_by_role=current_user.role,
        created_by_name=current_user.name,
        recipients=body.recipients,
        team_id=body.teamId,
    )
    db.add(a)
    db.commit()
    return ann_to_dict(a)


@router.delete("/{ann_id}")
def delete_announcement(ann_id: str, db: Session = Depends(get_db),
                        current_user: User = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin only")
    a = db.query(Announcement).filter(Announcement.id == ann_id).first()
    if not a:
        raise HTTPException(status_code=404, detail="Not found")
    db.delete(a)
    db.commit()
    return {"success": True}
