from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from database import get_db
from models import User, Task
from routers.auth import get_current_user
import uuid

router = APIRouter(prefix="/api/tasks", tags=["tasks"])


def task_to_dict(t: Task) -> dict:
    return {
        "id": t.id, "title": t.title, "description": t.description,
        "dueDate": t.due_date, "stage": t.stage,
        "createdById": t.created_by_id, "createdAt": t.created_at,
    }


class CreateTaskRequest(BaseModel):
    title: str
    description: Optional[str] = None
    dueDate: Optional[str] = None
    stage: Optional[int] = None


class UpdateTaskRequest(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    dueDate: Optional[str] = None
    stage: Optional[int] = None


@router.get("")
def list_tasks(db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    return [task_to_dict(t) for t in db.query(Task).all()]


@router.post("")
def create_task(body: CreateTaskRequest, db: Session = Depends(get_db),
                current_user: User = Depends(get_current_user)):
    if current_user.role not in ("admin", "mentor"):
        raise HTTPException(status_code=403, detail="Admin/Mentor only")
    t = Task(
        id=str(uuid.uuid4()),
        title=body.title,
        description=body.description,
        due_date=body.dueDate,
        stage=body.stage,
        created_by_id=current_user.id,
    )
    db.add(t)
    db.commit()
    return task_to_dict(t)


@router.patch("/{task_id}")
def update_task(task_id: str, body: UpdateTaskRequest, db: Session = Depends(get_db),
                current_user: User = Depends(get_current_user)):
    if current_user.role not in ("admin", "mentor"):
        raise HTTPException(status_code=403, detail="Admin/Mentor only")
    t = db.query(Task).filter(Task.id == task_id).first()
    if not t:
        raise HTTPException(status_code=404, detail="Task not found")
    if body.title is not None:       t.title = body.title
    if body.description is not None: t.description = body.description
    if body.dueDate is not None:     t.due_date = body.dueDate
    if body.stage is not None:       t.stage = body.stage
    db.commit()
    return task_to_dict(t)


@router.delete("/{task_id}")
def delete_task(task_id: str, db: Session = Depends(get_db),
                current_user: User = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin only")
    t = db.query(Task).filter(Task.id == task_id).first()
    if not t:
        raise HTTPException(status_code=404, detail="Task not found")
    db.delete(t)
    db.commit()
    return {"success": True}
