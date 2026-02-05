# Project Tracker

A simple project management app with a React frontend and Python FastAPI backend.

## Tech Stack

- **Frontend**: React + Vite + TypeScript + Tailwind CSS
- **Backend**: Python FastAPI + SQLAlchemy
- **Database**: PostgreSQL (Neon DB)

## Setup Instructions

### 1. Database Setup (Neon DB)

1. Go to [Neon](https://neon.tech) and create a free account
2. Create a new project and database
3. Copy the connection string from the dashboard

### 2. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create .env file with your Neon DB connection string
# Copy .env.example to .env and update DATABASE_URL
copy .env.example .env

# Edit .env and add your Neon DB connection string:
# DATABASE_URL=postgresql://username:password@ep-xxx.region.aws.neon.tech/dbname?sslmode=require

# Run the server
uvicorn app.main:app --reload
```

The API will be available at http://localhost:8000

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Run the development server
npm run dev
```

The app will be available at http://localhost:5173

## API Endpoints

### Projects
- `GET /api/projects` - List all projects
- `POST /api/projects` - Create a project
- `GET /api/projects/{id}` - Get project details
- `PUT /api/projects/{id}` - Update a project
- `DELETE /api/projects/{id}` - Delete a project

### Tasks
- `POST /api/tasks` - Create a task
- `GET /api/tasks/{id}` - Get task details
- `PUT /api/tasks/{id}` - Update a task
- `DELETE /api/tasks/{id}` - Delete a task
- `PUT /api/tasks` - Reorder tasks (batch update)

### Checklists
- `POST /api/checklists` - Create a checklist
- `PUT /api/checklists/{id}` - Update a checklist
- `DELETE /api/checklists/{id}` - Delete a checklist
- `POST /api/checklists/items` - Add checklist item
- `PUT /api/checklists/items/{id}` - Update checklist item
- `DELETE /api/checklists/items/{id}` - Delete checklist item

### Comments
- `POST /api/comments` - Add a comment
- `PUT /api/comments/{id}` - Update a comment
- `DELETE /api/comments/{id}` - Delete a comment

## Deployment

### Frontend Deployment (Vercel)

1. **In Vercel Dashboard:**
   - Import your GitHub repository
   - Set **Root Directory** to `frontend`
   - Framework will auto-detect as Vite
   - Deploy

2. **After first deployment, add environment variable:**
   - Go to Project Settings → Environment Variables
   - Add: `VITE_API_URL` = `your-backend-api-url/api`
   - Redeploy

### Backend Deployment (Railway - Recommended)

1. Go to [Railway.app](https://railway.app)
2. Create new project from GitHub repo
3. Select the `backend` directory as root
4. Add Neon DB connection string as environment variable:
   - Variable: `DATABASE_URL`
   - Value: Your Neon DB connection string
5. Railway will auto-deploy

### Alternative Backend Deployment (Render)

1. Create new Web Service on [Render](https://render.com)
2. Connect GitHub repository
3. Set root directory to `backend`
4. Build command: `pip install -r requirements.txt`
5. Start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
6. Add `DATABASE_URL` environment variable

## Features

- Kanban board with drag-and-drop
- Create and manage projects
- Task management with checklists
- Comments on tasks
- Priority levels and due dates
- Responsive design
