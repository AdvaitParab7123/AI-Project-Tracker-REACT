import { Link } from 'react-router-dom';
import type { Project } from '../types';

interface DashboardProps {
  projects: Project[];
}

export function Dashboard({ projects }: DashboardProps) {
  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'client': return { label: 'Client Project', color: 'bg-blue-100 text-blue-800' };
      case 'internal': return { label: 'Internal', color: 'bg-green-100 text-green-800' };
      case 'feature_request': return { label: 'Feature Request', color: 'bg-purple-100 text-purple-800' };
      default: return { label: 'General', color: 'bg-gray-100 text-gray-800' };
    }
  };

  const totalTasks = projects.reduce((sum, p) => sum + (p.task_count || 0), 0);
  const activeProjects = projects.filter((p) => (p.task_count || 0) > 0).length;

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Welcome to the AI Adoption Team Project Tracker</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <p className="text-sm text-gray-500">Total Projects</p>
          <p className="text-4xl font-bold text-gray-900 mt-1">{projects.length}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6">
          <p className="text-sm text-gray-500">Total Tasks</p>
          <p className="text-4xl font-bold text-gray-900 mt-1">{totalTasks}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6">
          <p className="text-sm text-gray-500">Active Projects</p>
          <p className="text-4xl font-bold text-gray-900 mt-1">{activeProjects}</p>
        </div>
      </div>

      {/* Projects Grid */}
      <div className="mb-4">
        <h2 className="text-xl font-semibold text-gray-900">Your Projects</h2>
      </div>

      {projects.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <p className="text-gray-500 mb-4">
            No projects yet. Create your first project using the + button in the sidebar.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => {
            const typeInfo = getTypeLabel(project.type);
            return (
              <Link key={project.id} to={`/project/${project.id}`}>
                <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow cursor-pointer h-full">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{project.name}</h3>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${typeInfo.color}`}>
                      {typeInfo.label}
                    </span>
                  </div>
                  <p className="text-gray-500 text-sm mb-4 line-clamp-2">
                    {project.description || 'No description'}
                  </p>
                  <div className="flex items-center justify-between text-sm text-gray-400">
                    <span>{project.task_count || 0} tasks</span>
                    <span>Created {new Date(project.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
