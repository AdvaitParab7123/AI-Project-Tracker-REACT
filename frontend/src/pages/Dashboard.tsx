import { Link } from 'react-router-dom';
import { FolderKanban, ListTodo, Activity, ArrowRight, Calendar } from 'lucide-react';
import type { Project } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface DashboardProps {
  projects: Project[];
}

export function Dashboard({ projects }: DashboardProps) {
  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'client': return { label: 'Client', variant: 'info' as const };
      case 'internal': return { label: 'Internal', variant: 'success' as const };
      case 'feature_request': return { label: 'Feature', variant: 'purple' as const };
      default: return { label: 'General', variant: 'secondary' as const };
    }
  };

  const totalTasks = projects.reduce((sum, p) => sum + (p.task_count || 0), 0);
  const activeProjects = projects.filter((p) => (p.task_count || 0) > 0).length;

  return (
    <div className="min-h-full bg-slate-50">
      <div className="p-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Dashboard</h1>
          <p className="text-slate-500 mt-1">Welcome to the AI Adoption Team Project Tracker</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="card p-6 transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-medium text-slate-500">Total Projects</p>
              <div className="h-10 w-10 rounded-xl bg-indigo-50 flex items-center justify-center">
                <FolderKanban className="h-5 w-5 text-indigo-600" />
              </div>
            </div>
            <div className="text-3xl font-bold text-slate-900">{projects.length}</div>
            <p className="text-sm text-slate-400 mt-1">Projects in workspace</p>
          </div>

          <div className="card p-6 transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-medium text-slate-500">Total Tasks</p>
              <div className="h-10 w-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                <ListTodo className="h-5 w-5 text-emerald-600" />
              </div>
            </div>
            <div className="text-3xl font-bold text-slate-900">{totalTasks}</div>
            <p className="text-sm text-slate-400 mt-1">Across all projects</p>
          </div>

          <div className="card p-6 transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-medium text-slate-500">Active Projects</p>
              <div className="h-10 w-10 rounded-xl bg-amber-50 flex items-center justify-center">
                <Activity className="h-5 w-5 text-amber-600" />
              </div>
            </div>
            <div className="text-3xl font-bold text-slate-900">{activeProjects}</div>
            <p className="text-sm text-slate-400 mt-1">With active tasks</p>
          </div>
        </div>

        {/* Projects Section */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-slate-900">Your Projects</h2>
        </div>

        {projects.length === 0 ? (
          <div className="card">
            <div className="flex flex-col items-center justify-center py-20 px-4">
              <div className="h-16 w-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
                <FolderKanban className="h-8 w-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">No projects yet</h3>
              <p className="text-slate-500 text-center max-w-sm">
                Create your first project using the <span className="font-medium text-indigo-600">+</span> button in the sidebar to get started.
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => {
              const typeInfo = getTypeBadge(project.type);
              return (
                <Link key={project.id} to={`/project/${project.id}`}>
                  <div className="card p-6 transition-all duration-200 cursor-pointer group h-full">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <h3 className="text-lg font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
                        {project.name}
                      </h3>
                      <Badge variant={typeInfo.variant} className="shrink-0">
                        {typeInfo.label}
                      </Badge>
                    </div>
                    <p className="text-slate-500 text-sm line-clamp-2 mb-4 min-h-[40px]">
                      {project.description || 'No description provided'}
                    </p>
                    <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                      <div className="flex items-center gap-4 text-sm text-slate-400">
                        <span className="flex items-center gap-1.5">
                          <ListTodo className="h-4 w-4" />
                          {project.task_count || 0} tasks
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Calendar className="h-4 w-4" />
                          {new Date(project.created_at).toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric' 
                          })}
                        </span>
                      </div>
                      <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity text-indigo-600">
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
