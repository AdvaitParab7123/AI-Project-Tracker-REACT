import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Plus, FolderKanban, Sparkles } from 'lucide-react';
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

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProject.name.trim()) return;
    
    setCreating(true);
    try {
      await projectsAPI.create(newProject);
      setNewProject({ name: '', description: '', type: 'general' });
      setIsCreateOpen(false);
      onProjectCreated();
    } catch (error) {
      console.error('Failed to create project:', error);
    } finally {
      setCreating(false);
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
      <div className="flex flex-col h-full w-64 bg-slate-900 text-slate-100">
        {/* Header */}
        <div className="p-5 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/20">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-base font-semibold text-white">Project Tracker</h1>
              <p className="text-xs text-slate-400">AI Adoption Team</p>
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
                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-all duration-150",
                    location.pathname === '/' && "bg-slate-800 text-white"
                  )}
                >
                  <Home className="h-4 w-4" />
                  <span className="font-medium">Dashboard</span>
                </button>
              </Link>
            </div>

            {/* Projects Section */}
            <div>
              <div className="flex items-center justify-between mb-3 px-1">
                <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Projects
                </h2>
                <button
                  onClick={() => setIsCreateOpen(true)}
                  className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-md transition-all duration-150"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-1">
                {projects.map((project) => (
                  <Link key={project.id} to={`/project/${project.id}`}>
                    <button
                      className={cn(
                        "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all duration-150 text-left",
                        location.pathname === `/project/${project.id}` && "bg-slate-800 text-white"
                      )}
                    >
                      <span className={cn("w-2 h-2 rounded-full flex-shrink-0", getTypeColor(project.type))} />
                      <span className="truncate text-sm">{project.name}</span>
                    </button>
                  </Link>
                ))}
                {projects.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
                    <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center mb-3">
                      <FolderKanban className="h-6 w-6 text-slate-600" />
                    </div>
                    <p className="text-sm text-slate-500">No projects yet</p>
                    <p className="text-xs text-slate-600 mt-1">Click + to create one</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* User Profile */}
        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xs font-semibold text-white shadow-lg shadow-indigo-500/20">
              AT
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">AI Team</p>
              <p className="text-xs text-slate-400 truncate">Open Access</p>
            </div>
          </div>
        </div>
      </div>

      {/* Create Project Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create New Project</DialogTitle>
            <DialogDescription>
              Add a new project to track your team's work.
            </DialogDescription>
          </DialogHeader>
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
              <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={creating}>
                {creating ? 'Creating...' : 'Create Project'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
