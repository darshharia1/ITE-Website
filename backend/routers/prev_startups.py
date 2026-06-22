from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional, List
from database import get_db
from models import User, PrevStartup
from routers.auth import get_current_user
import uuid

router = APIRouter(prefix="/api/prev-startups", tags=["prev-startups"])


def ps_to_dict(p: PrevStartup) -> dict:
    return {
        "id": p.id, "name": p.name, "description": p.description,
        "industry": p.industry, "year": p.year,
        "founders": p.founders or [], "imageUrl": p.image_url,
        "createdAt": p.created_at,
    }


class CreatePrevStartupRequest(BaseModel):
    name: str
    description: Optional[str] = None
    industry: Optional[str] = None
    year: Optional[int] = None
    founders: Optional[List[str]] = None
    imageUrl: Optional[str] = None


@router.get("")
def list_prev_startups(db: Session = Depends(get_db)):
    return [ps_to_dict(p) for p in db.query(PrevStartup).all()]


@router.post("")
def create_prev_startup(body: CreatePrevStartupRequest, db: Session = Depends(get_db),
                        current_user: User = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin only")
    p = PrevStartup(
        id=str(uuid.uuid4()),
        name=body.name, description=body.description,
        industry=body.industry, year=body.year,
        founders=body.founders or [], image_url=body.imageUrl,
    )
    db.add(p)
    db.commit()
    return ps_to_dict(p)
