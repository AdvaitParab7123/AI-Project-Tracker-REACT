import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Plus, FolderKanban, Sparkles, AlertCircle, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { projectsAPI } from '@/lib/api';
import type { Project } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface SidebarProps {
  projects: Project[];
  onProjectCreated: () => void;
}

export function Sidebar({ projects, onProjectCreated }: SidebarProps) {
  const location = useLocation();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newProject, setNewProject] = useState({ name: '', description: '', type: 'general' });
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProject.name.trim()) return;
    
    setCreating(true);
    setError(null);
    try {
      await projectsAPI.create(newProject);
      setNewProject({ name: '', description: '', type: 'general' });
      setSuccess(true);
      setTimeout(() => {
        setIsCreateOpen(false);
        setSuccess(false);
        onProjectCreated();
      }, 1000);
    } catch (err) {
      console.error('Failed to create project:', err);
      setError(err instanceof Error ? err.message : 'Failed to create project. Please check your connection and try again.');
    } finally {
      setCreating(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    setIsCreateOpen(open);
    if (!open) {
      setError(null);
      setSuccess(false);
      setNewProject({ name: '', description: '', type: 'general' });
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'client': return 'bg-blue-400';
      case 'internal': return 'bg-emerald-400';
      case 'feature_request': return 'bg-purple-400';
      default: return 'bg-slate-400';
    }
  };

  return (
    <>
      <div className="flex flex-col h-full w-64 bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 text-slate-100 shadow-xl">
        {/* Header */}
        <div className="p-5 border-b border-slate-800/60 bg-slate-900/50 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-500 via-indigo-600 to-purple-600 shadow-lg shadow-indigo-500/30 ring-1 ring-white/10">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-base font-bold text-white tracking-tight">Project Tracker</h1>
              <p className="text-xs text-slate-400 font-medium">AI Adoption Team</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-6">
            {/* Dashboard Link */}
            <div>
              <Link to="/">
                <button
                  className={cn(
                    "w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800/70 transition-all duration-200",
                    location.pathname === '/' && "bg-gradient-to-r from-indigo-600/20 to-purple-600/20 text-white ring-1 ring-indigo-500/30"
                  )}
                >
                  <Home className="h-4.5 w-4.5" />
                  <span className="font-medium">Dashboard</span>
                </button>
              </Link>
            </div>

            {/* Projects Section */}
            <div>
              <div className="flex items-center justify-between mb-3 px-1">
                <h2 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">
                  Projects
                </h2>
                <button
                  onClick={() => setIsCreateOpen(true)}
                  className="p-1.5 text-slate-400 hover:text-white hover:bg-indigo-600/20 rounded-lg transition-all duration-200 hover:ring-1 hover:ring-indigo-500/30"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-1">
                {projects.map((project) => (
                  <Link key={project.id} to={`/project/${project.id}`}>
                    <button
                      className={cn(
                        "w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/70 transition-all duration-200 text-left group",
                        location.pathname === `/project/${project.id}` && "bg-slate-800/80 text-white ring-1 ring-slate-700/50"
                      )}
                    >
                      <span className={cn(
                        "w-2.5 h-2.5 rounded-full flex-shrink-0 ring-2 ring-offset-1 ring-offset-slate-900 transition-all",
                        getTypeColor(project.type),
                        "group-hover:ring-offset-2"
                      )} />
                      <span className="truncate text-sm font-medium">{project.name}</span>
                    </button>
                  </Link>
                ))}
                {projects.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-800/50 flex items-center justify-center mb-4 ring-1 ring-slate-700/50">
                      <FolderKanban className="h-7 w-7 text-slate-500" />
                    </div>
                    <p className="text-sm font-medium text-slate-400">No projects yet</p>
                    <p className="text-xs text-slate-500 mt-1.5">Click <span className="text-indigo-400 font-semibold">+</span> to create one</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* User Profile */}
        <div className="p-4 border-t border-slate-800/60 bg-slate-950/50">
          <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-800/40 transition-all duration-200 cursor-pointer group">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 via-indigo-600 to-purple-600 flex items-center justify-center text-xs font-bold text-white shadow-lg shadow-indigo-500/25 ring-2 ring-white/10 group-hover:ring-white/20 transition-all">
              AT
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">AI Team</p>
              <p className="text-xs text-slate-400 truncate font-medium">Open Access</p>
            </div>
          </div>
        </div>
      </div>

      {/* Create Project Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create New Project</DialogTitle>
            <DialogDescription>
              Add a new project to track your team's work.
            </DialogDescription>
          </DialogHeader>
          
          {/* Success Message */}
          {success && (
            <div className="flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
              <CheckCircle2 className="h-5 w-5 text-emerald-600 flex-shrink-0" />
              <p className="text-sm text-emerald-700 font-medium">Project created successfully!</p>
            </div>
          )}
          
          {/* Error Message */}
          {error && (
            <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-red-700 font-medium">Failed to create project</p>
                <p className="text-xs text-red-600 mt-1">{error}</p>
              </div>
            </div>
          )}
          
          {!success && (
            <form onSubmit={handleCreateProject}>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Project Name</Label>
                  <Input
                    id="name"
                    value={newProject.name}
                    onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                    placeholder="My New Project"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={newProject.description}
                    onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                    placeholder="Brief description of the project..."
                    rows={3}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="type">Project Type</Label>
                  <Select
                    value={newProject.type}
                    onValueChange={(value) => setNewProject({ ...newProject, type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">General</SelectItem>
                      <SelectItem value="client">Client Project</SelectItem>
                      <SelectItem value="internal">Internal Product</SelectItem>
                      <SelectItem value="feature_request">Feature Request</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={creating}>
                  {creating ? 'Creating...' : 'Create Project'}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
