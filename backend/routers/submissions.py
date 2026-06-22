from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from database import get_db
from models import User, Submission
from routers.auth import get_current_user
import uuid, datetime

router = APIRouter(prefix="/api/submissions", tags=["submissions"])


def sub_to_dict(s: Submission) -> dict:
    return {
        "id": s.id, "studentId": s.student_id, "teamId": s.team_id,
        "taskId": s.task_id, "title": s.title, "content": s.content,
        "fileUrl": s.file_url, "status": s.status, "grade": s.grade,
        "feedback": s.feedback, "submittedAt": s.submitted_at, "gradedAt": s.graded_at,
    }


class CreateSubmissionRequest(BaseModel):
    taskId: Optional[str] = None
    title: str
    content: Optional[str] = None
    fileUrl: Optional[str] = None


class GradeRequest(BaseModel):
    grade: float
    feedback: Optional[str] = None


@router.get("")
def all_submissions(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.role not in ("admin", "mentor"):
        raise HTTPException(status_code=403, detail="Admin/Mentor only")
    return [sub_to_dict(s) for s in db.query(Submission).all()]


@router.get("/my")
def my_submissions(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    subs = db.query(Submission).filter(Submission.student_id == current_user.id).all()
    return [sub_to_dict(s) for s in subs]


@router.post("")
def create_submission(body: CreateSubmissionRequest, db: Session = Depends(get_db),
                      current_user: User = Depends(get_current_user)):
    if current_user.role != "student":
        raise HTTPException(status_code=403, detail="Students only")
    if not current_user.team_id:
        raise HTTPException(status_code=400, detail="You must be in a team to submit")
    s = Submission(
        id=str(uuid.uuid4()),
        student_id=current_user.id,
        team_id=current_user.team_id,
        task_id=body.taskId,
        title=body.title,
        content=body.content,
        file_url=body.fileUrl,
    )
    db.add(s)
    db.commit()
    return sub_to_dict(s)


@router.patch("/{sub_id}/grade")
def grade_submission(sub_id: str, body: GradeRequest, db: Session = Depends(get_db),
                     current_user: User = Depends(get_current_user)):
    if current_user.role not in ("admin", "mentor"):
        raise HTTPException(status_code=403, detail="Admin/Mentor only")
    s = db.query(Submission).filter(Submission.id == sub_id).first()
    if not s:
        raise HTTPException(status_code=404, detail="Submission not found")
    s.grade = body.grade
    s.feedback = body.feedback
    s.status = "graded"
    s.graded_at = datetime.datetime.utcnow().isoformat()
    db.commit()
    return sub_to_dict(s)
