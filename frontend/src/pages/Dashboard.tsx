import { Link } from 'react-router-dom';
import { FolderKanban, ListTodo, Activity, ArrowRight, Calendar, Sparkles } from 'lucide-react';
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
    <div className="min-h-full bg-gradient-to-br from-slate-50 via-white to-indigo-50/30">
      <div className="p-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/20">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Dashboard</h1>
          </div>
          <p className="text-slate-500 ml-14">Welcome to the AI Adoption Team Project Tracker</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="stat-card p-6 group">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-semibold text-slate-600">Total Projects</p>
              <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-indigo-100 to-indigo-50 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <FolderKanban className="h-6 w-6 text-indigo-600" />
              </div>
            </div>
            <div className="text-4xl font-bold text-slate-900 mb-1">{projects.length}</div>
            <p className="text-sm text-slate-400 font-medium">Projects in workspace</p>
          </div>

          <div className="stat-card p-6 group">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-semibold text-slate-600">Total Tasks</p>
              <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-emerald-100 to-emerald-50 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <ListTodo className="h-6 w-6 text-emerald-600" />
              </div>
            </div>
            <div className="text-4xl font-bold text-slate-900 mb-1">{totalTasks}</div>
            <p className="text-sm text-slate-400 font-medium">Across all projects</p>
          </div>

          <div className="stat-card p-6 group">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-semibold text-slate-600">Active Projects</p>
              <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-amber-100 to-amber-50 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Activity className="h-6 w-6 text-amber-600" />
              </div>
            </div>
            <div className="text-4xl font-bold text-slate-900 mb-1">{activeProjects}</div>
            <p className="text-sm text-slate-400 font-medium">With active tasks</p>
          </div>
        </div>

        {/* Projects Section */}
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900">Your Projects</h2>
          {projects.length > 0 && (
            <span className="text-sm font-medium text-slate-400">{projects.length} project{projects.length !== 1 ? 's' : ''}</span>
          )}
        </div>

        {projects.length === 0 ? (
          <div className="empty-state-card">
            <div className="flex flex-col items-center justify-center py-24 px-4">
              <div className="h-20 w-20 rounded-3xl bg-gradient-to-br from-slate-100 to-slate-50 flex items-center justify-center mb-6 shadow-sm">
                <FolderKanban className="h-10 w-10 text-slate-400" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">No projects yet</h3>
              <p className="text-slate-500 text-center max-w-sm leading-relaxed">
                Create your first project using the <span className="font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">+</span> button in the sidebar to get started.
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => {
              const typeInfo = getTypeBadge(project.type);
              return (
                <Link key={project.id} to={`/project/${project.id}`}>
                  <div className="project-card p-6 cursor-pointer group h-full">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <h3 className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
                        {project.name}
                      </h3>
                      <Badge variant={typeInfo.variant} className="shrink-0">
                        {typeInfo.label}
                      </Badge>
                    </div>
                    <p className="text-slate-500 text-sm line-clamp-2 mb-4 min-h-[40px] leading-relaxed">
                      {project.description || 'No description provided'}
                    </p>
                    <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                      <div className="flex items-center gap-4 text-sm text-slate-400">
                        <span className="flex items-center gap-1.5 font-medium">
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
                      <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-all duration-200 text-indigo-600 hover:bg-indigo-50">
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
