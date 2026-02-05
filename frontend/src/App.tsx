import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './pages/Dashboard';
import { ProjectPage } from './pages/ProjectPage';
import { projectsAPI } from './lib/api';
import type { Project } from './types';
import { Loader2 } from 'lucide-react';

function App() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProjects = async () => {
    try {
      const data = await projectsAPI.getAll();
      setProjects(data);
    } catch (error) {
      console.error('Failed to fetch projects:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  return (
    <BrowserRouter>
      <div className="flex h-screen bg-background">
        <Sidebar projects={projects} onProjectCreated={fetchProjects} />
        <main className="flex-1 overflow-auto">
          {loading ? (
            <div className="flex items-center justify-center h-full bg-gradient-to-br from-slate-50 to-slate-100/50">
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
                <p className="text-sm text-slate-500">Loading projects...</p>
              </div>
            </div>
          ) : (
            <Routes>
              <Route path="/" element={<Dashboard projects={projects} />} />
              <Route path="/project/:id" element={<ProjectPage onUpdate={fetchProjects} />} />
            </Routes>
          )}
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
