import { Link } from 'react-router-dom';
import { FolderKanban, ListTodo, Activity, ArrowRight, Calendar } from 'lucide-react';
import type { Project } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
    <div className="min-h-full bg-gradient-to-br from-slate-50 to-slate-100/50">
      <div className="p-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Dashboard</h1>
          <p className="text-slate-500 mt-1">Welcome to the AI Adoption Team Project Tracker</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="border-0 shadow-sm bg-white/80 backdrop-blur">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-500">Total Projects</CardTitle>
              <div className="h-9 w-9 rounded-lg bg-indigo-100 flex items-center justify-center">
                <FolderKanban className="h-5 w-5 text-indigo-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900">{projects.length}</div>
              <p className="text-xs text-slate-500 mt-1">Projects in workspace</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-white/80 backdrop-blur">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-500">Total Tasks</CardTitle>
              <div className="h-9 w-9 rounded-lg bg-emerald-100 flex items-center justify-center">
                <ListTodo className="h-5 w-5 text-emerald-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900">{totalTasks}</div>
              <p className="text-xs text-slate-500 mt-1">Across all projects</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-white/80 backdrop-blur">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-500">Active Projects</CardTitle>
              <div className="h-9 w-9 rounded-lg bg-amber-100 flex items-center justify-center">
                <Activity className="h-5 w-5 text-amber-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900">{activeProjects}</div>
              <p className="text-xs text-slate-500 mt-1">With active tasks</p>
            </CardContent>
          </Card>
        </div>

        {/* Projects Section */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-slate-900">Your Projects</h2>
          </div>
        </div>

        {projects.length === 0 ? (
          <Card className="border-0 shadow-sm bg-white/80 backdrop-blur">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="h-16 w-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
                <FolderKanban className="h-8 w-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-medium text-slate-900 mb-2">No projects yet</h3>
              <p className="text-slate-500 text-center max-w-sm mb-4">
                Create your first project using the + button in the sidebar to get started.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => {
              const typeInfo = getTypeBadge(project.type);
              return (
                <Link key={project.id} to={`/project/${project.id}`}>
                  <Card className="border-0 shadow-sm bg-white/80 backdrop-blur hover:shadow-md transition-all duration-200 cursor-pointer group h-full">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-2">
                        <CardTitle className="text-lg font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
                          {project.name}
                        </CardTitle>
                        <Badge variant={typeInfo.variant} className="shrink-0">
                          {typeInfo.label}
                        </Badge>
                      </div>
                      <CardDescription className="line-clamp-2 mt-1">
                        {project.description || 'No description provided'}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 text-sm text-slate-500">
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
                        <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
