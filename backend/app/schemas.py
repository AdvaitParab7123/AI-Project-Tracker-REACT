from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

# ChecklistItem Schemas
class ChecklistItemBase(BaseModel):
    content: str
    completed: bool = False

class ChecklistItemCreate(ChecklistItemBase):
    checklist_id: str

class ChecklistItemUpdate(BaseModel):
    content: Optional[str] = None
    completed: Optional[bool] = None

class ChecklistItem(ChecklistItemBase):
    id: str
    position: int
    checklist_id: str
    created_at: datetime

    class Config:
        from_attributes = True

# Checklist Schemas
class ChecklistBase(BaseModel):
    title: str

class ChecklistCreate(ChecklistBase):
    task_id: str

class ChecklistUpdate(BaseModel):
    title: Optional[str] = None

class Checklist(ChecklistBase):
    id: str
    position: int
    task_id: str
    created_at: datetime
    items: List[ChecklistItem] = []

    class Config:
        from_attributes = True

# Comment Schemas
class CommentBase(BaseModel):
    content: str
    author_name: str = "Team Member"

class CommentCreate(CommentBase):
    task_id: str

class CommentUpdate(BaseModel):
    content: Optional[str] = None

class Comment(CommentBase):
    id: str
    task_id: str
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# Task Schemas
class TaskBase(BaseModel):
    title: str
    description: Optional[str] = None
    priority: str = "medium"
    due_date: Optional[datetime] = None

class TaskCreate(TaskBase):
    column_id: str

class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    priority: Optional[str] = None
    due_date: Optional[datetime] = None
    column_id: Optional[str] = None
    position: Optional[int] = None

class TaskBrief(TaskBase):
    id: str
    position: int
    column_id: str
    created_at: datetime
    checklists: List[Checklist] = []
    comments_count: int = 0

    class Config:
        from_attributes = True

class Task(TaskBase):
    id: str
    position: int
    column_id: str
    created_at: datetime
    updated_at: Optional[datetime] = None
    checklists: List[Checklist] = []
    comments: List[Comment] = []

    class Config:
        from_attributes = True

# Column Schemas
class ColumnBase(BaseModel):
    name: str

class ColumnCreate(ColumnBase):
    project_id: str

class ColumnUpdate(BaseModel):
    name: Optional[str] = None
    position: Optional[int] = None

class Column(ColumnBase):
    id: str
    position: int
    project_id: str
    created_at: datetime
    tasks: List[TaskBrief] = []

    class Config:
        from_attributes = True

# Project Schemas
class ProjectBase(BaseModel):
    name: str
    description: Optional[str] = None
    type: str = "general"

class ProjectCreate(ProjectBase):
    pass

class ProjectUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    type: Optional[str] = None
    archived: Optional[bool] = None

class ProjectBrief(ProjectBase):
    id: str
    archived: bool
    created_at: datetime
    task_count: int = 0

    class Config:
        from_attributes = True

class Project(ProjectBase):
    id: str
    archived: bool
    created_at: datetime
    updated_at: Optional[datetime] = None
    columns: List[Column] = []

    class Config:
        from_attributes = True

# Task reorder schema
class TaskReorder(BaseModel):
    id: str
    column_id: str
    position: int

class TaskReorderRequest(BaseModel):
    tasks: List[TaskReorder]
