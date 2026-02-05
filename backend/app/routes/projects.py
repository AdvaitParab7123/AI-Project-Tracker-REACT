from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from ..database import get_db
from .. import models, schemas

router = APIRouter(prefix="/api/projects", tags=["projects"])

@router.get("", response_model=List[schemas.ProjectBrief])
def get_projects(db: Session = Depends(get_db)):
    projects = db.query(models.Project).filter(models.Project.archived == False).order_by(models.Project.created_at.desc()).all()
    
    result = []
    for project in projects:
        task_count = sum(len(col.tasks) for col in project.columns)
        result.append(schemas.ProjectBrief(
            id=project.id,
            name=project.name,
            description=project.description,
            type=project.type,
            archived=project.archived,
            created_at=project.created_at,
            task_count=task_count
        ))
    return result

@router.post("", response_model=schemas.Project, status_code=201)
def create_project(project: schemas.ProjectCreate, db: Session = Depends(get_db)):
    db_project = models.Project(
        name=project.name,
        description=project.description,
        type=project.type
    )
    db.add(db_project)
    db.flush()
    
    # Create default columns
    default_columns = ["Backlog", "To Do", "In Progress", "Review", "Done"]
    for i, name in enumerate(default_columns):
        col = models.Column(name=name, position=i, project_id=db_project.id)
        db.add(col)
    
    db.commit()
    db.refresh(db_project)
    return db_project

@router.get("/{project_id}", response_model=schemas.Project)
def get_project(project_id: str, db: Session = Depends(get_db)):
    project = db.query(models.Project).filter(models.Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    # Add comments_count to tasks
    for column in project.columns:
        for task in column.tasks:
            task.comments_count = len(task.comments)
    
    return project

@router.put("/{project_id}", response_model=schemas.Project)
def update_project(project_id: str, project_update: schemas.ProjectUpdate, db: Session = Depends(get_db)):
    project = db.query(models.Project).filter(models.Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    update_data = project_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(project, key, value)
    
    db.commit()
    db.refresh(project)
    return project

@router.delete("/{project_id}")
def delete_project(project_id: str, db: Session = Depends(get_db)):
    project = db.query(models.Project).filter(models.Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    db.delete(project)
    db.commit()
    return {"success": True}
