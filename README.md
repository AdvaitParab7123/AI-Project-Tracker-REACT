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

### Vercel Deployment

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Set up the Neon DB integration in Vercel
4. Deploy the frontend to Vercel
5. Deploy the backend to a service like Railway, Render, or Vercel Serverless Functions

## Features

- Kanban board with drag-and-drop
- Create and manage projects
- Task management with checklists
- Comments on tasks
- Priority levels and due dates
- Responsive design
