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
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
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
      case 'client': return 'bg-blue-500';
      case 'internal': return 'bg-emerald-500';
      case 'feature_request': return 'bg-purple-500';
      default: return 'bg-slate-500';
    }
  };

  return (
    <>
      <div className="flex flex-col h-full w-64 bg-sidebar text-sidebar-foreground border-r border-sidebar-muted/20">
        {/* Header */}
        <div className="p-5">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-base font-semibold tracking-tight">Project Tracker</h1>
              <p className="text-xs text-sidebar-foreground/60">AI Adoption Team</p>
            </div>
          </div>
        </div>

        <Separator className="bg-sidebar-muted/30" />

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-6">
            {/* Dashboard Link */}
            <div>
              <Link to="/">
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full justify-start gap-3 text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-sidebar-accent",
                    location.pathname === '/' && "bg-sidebar-accent text-sidebar-foreground"
                  )}
                >
                  <Home className="h-4 w-4" />
                  Dashboard
                </Button>
              </Link>
            </div>

            {/* Projects Section */}
            <div>
              <div className="flex items-center justify-between mb-3 px-2">
                <h2 className="text-xs font-semibold text-sidebar-foreground/50 uppercase tracking-wider">
                  Projects
                </h2>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-sidebar-foreground/50 hover:text-sidebar-foreground hover:bg-sidebar-accent"
                  onClick={() => setIsCreateOpen(true)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-1">
                {projects.map((project) => (
                  <Link key={project.id} to={`/project/${project.id}`}>
                    <Button
                      variant="ghost"
                      className={cn(
                        "w-full justify-start gap-3 text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent font-normal",
                        location.pathname === `/project/${project.id}` && "bg-sidebar-accent text-sidebar-foreground"
                      )}
                    >
                      <span className={cn("w-2 h-2 rounded-full flex-shrink-0", getTypeColor(project.type))} />
                      <span className="truncate">{project.name}</span>
                    </Button>
                  </Link>
                ))}
                {projects.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
                    <FolderKanban className="h-10 w-10 text-sidebar-foreground/20 mb-3" />
                    <p className="text-sm text-sidebar-foreground/40">No projects yet</p>
                    <p className="text-xs text-sidebar-foreground/30 mt-1">Click + to create one</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <Separator className="bg-sidebar-muted/30" />

        {/* User Profile */}
        <div className="p-4">
          <div className="flex items-center gap-3">
            <Avatar className="h-9 w-9">
              <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-xs font-medium">
                AT
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">AI Team</p>
              <p className="text-xs text-sidebar-foreground/50 truncate">Open Access</p>
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
