from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database import get_db
from .. import models, schemas

router = APIRouter(prefix="/api/checklists", tags=["checklists"])

@router.post("", response_model=schemas.Checklist, status_code=201)
def create_checklist(checklist: schemas.ChecklistCreate, db: Session = Depends(get_db)):
    # Get highest position
    last_checklist = db.query(models.Checklist).filter(
        models.Checklist.task_id == checklist.task_id
    ).order_by(models.Checklist.position.desc()).first()
    
    position = (last_checklist.position + 1) if last_checklist else 0
    
    db_checklist = models.Checklist(
        title=checklist.title,
        task_id=checklist.task_id,
        position=position
    )
    db.add(db_checklist)
    db.commit()
    db.refresh(db_checklist)
    return db_checklist

@router.put("/{checklist_id}", response_model=schemas.Checklist)
def update_checklist(checklist_id: str, checklist_update: schemas.ChecklistUpdate, db: Session = Depends(get_db)):
    checklist = db.query(models.Checklist).filter(models.Checklist.id == checklist_id).first()
    if not checklist:
        raise HTTPException(status_code=404, detail="Checklist not found")
    
    update_data = checklist_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(checklist, key, value)
    
    db.commit()
    db.refresh(checklist)
    return checklist

@router.delete("/{checklist_id}")
def delete_checklist(checklist_id: str, db: Session = Depends(get_db)):
    checklist = db.query(models.Checklist).filter(models.Checklist.id == checklist_id).first()
    if not checklist:
        raise HTTPException(status_code=404, detail="Checklist not found")
    
    db.delete(checklist)
    db.commit()
    return {"success": True}

# Checklist Items
@router.post("/items", response_model=schemas.ChecklistItem, status_code=201)
def create_checklist_item(item: schemas.ChecklistItemCreate, db: Session = Depends(get_db)):
    # Get highest position
    last_item = db.query(models.ChecklistItem).filter(
        models.ChecklistItem.checklist_id == item.checklist_id
    ).order_by(models.ChecklistItem.position.desc()).first()
    
    position = (last_item.position + 1) if last_item else 0
    
    db_item = models.ChecklistItem(
        content=item.content,
        completed=item.completed,
        checklist_id=item.checklist_id,
        position=position
    )
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item

@router.put("/items/{item_id}", response_model=schemas.ChecklistItem)
def update_checklist_item(item_id: str, item_update: schemas.ChecklistItemUpdate, db: Session = Depends(get_db)):
    item = db.query(models.ChecklistItem).filter(models.ChecklistItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Checklist item not found")
    
    update_data = item_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(item, key, value)
    
    db.commit()
    db.refresh(item)
    return item

@router.delete("/items/{item_id}")
def delete_checklist_item(item_id: str, db: Session = Depends(get_db)):
    item = db.query(models.ChecklistItem).filter(models.ChecklistItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Checklist item not found")
    
    db.delete(item)
    db.commit()
    return {"success": True}
