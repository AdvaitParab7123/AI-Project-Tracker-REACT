import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Plus, X } from 'lucide-react';
import { cn } from '../lib/utils';
import { projectsAPI } from '../lib/api';
import { Project } from '../types';

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
      case 'internal': return 'bg-green-500';
      case 'feature_request': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="flex flex-col h-full w-64 bg-gray-900 text-white">
      {/* Header */}
      <div className="p-4 border-b border-gray-800">
        <h1 className="text-xl font-bold">Project Tracker</h1>
        <p className="text-xs text-gray-400 mt-1">AI Adoption Team</p>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-6">
          {/* Dashboard Link */}
          <div>
            <Link to="/">
              <button className={cn(
                "w-full flex items-center gap-2 px-3 py-2 rounded-lg text-gray-300 hover:text-white hover:bg-gray-800 transition-colors",
                location.pathname === '/' && "bg-gray-800 text-white"
              )}>
                <Home size={18} />
                Dashboard
              </button>
            </Link>
          </div>

          {/* Projects Section */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Projects
              </h2>
              <button
                onClick={() => setIsCreateOpen(true)}
                className="p-1 text-gray-400 hover:text-white rounded transition-colors"
              >
                <Plus size={16} />
              </button>
            </div>

            <div className="space-y-1">
              {projects.map((project) => (
                <Link key={project.id} to={`/project/${project.id}`}>
                  <button className={cn(
                    "w-full flex items-center gap-2 px-3 py-2 rounded-lg text-gray-300 hover:text-white hover:bg-gray-800 transition-colors text-left",
                    location.pathname === `/project/${project.id}` && "bg-gray-800 text-white"
                  )}>
                    <span className={cn("w-2 h-2 rounded-full flex-shrink-0", getTypeColor(project.type))} />
                    <span className="truncate">{project.name}</span>
                  </button>
                </Link>
              ))}
              {projects.length === 0 && (
                <p className="text-sm text-gray-500 px-3 py-1">No projects yet</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* User Profile */}
      <div className="p-4 border-t border-gray-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-xs font-medium">
            AT
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium">AI Team</p>
            <p className="text-xs text-gray-400">Open Access</p>
          </div>
        </div>
      </div>

      {/* Create Project Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md text-gray-900">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Create New Project</h2>
              <button onClick={() => setIsCreateOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleCreateProject}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Project Name</label>
                  <input
                    type="text"
                    value={newProject.name}
                    onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="My New Project"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={newProject.description}
                    onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Brief description..."
                    rows={3}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Project Type</label>
                  <select
                    value={newProject.type}
                    onChange={(e) => setNewProject({ ...newProject, type: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="general">General</option>
                    <option value="client">Client Project</option>
                    <option value="internal">Internal Product</option>
                    <option value="feature_request">Feature Request</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {creating ? 'Creating...' : 'Create Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
