from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .database import engine, Base
from .routes import projects, tasks, checklists, comments

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Project Tracker API",
    description="API for the AI Adoption Team Project Tracker",
    version="1.0.0"
)

# CORS middleware for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(projects.router)
app.include_router(tasks.router)
app.include_router(checklists.router)
app.include_router(comments.router)

@app.get("/")
def root():
    return {"message": "Project Tracker API", "status": "running"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}
