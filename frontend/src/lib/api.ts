const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

async function fetchAPI(endpoint: string, options?: RequestInit) {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });
  
  if (!response.ok) {
    throw new Error(`API Error: ${response.statusText}`);
  }
  
  return response.json();
}

// Projects
export const projectsAPI = {
  getAll: () => fetchAPI('/projects'),
  get: (id: string) => fetchAPI(`/projects/${id}`),
  create: (data: { name: string; description?: string; type?: string }) => 
    fetchAPI('/projects', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: any) => 
    fetchAPI(`/projects/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) => 
    fetchAPI(`/projects/${id}`, { method: 'DELETE' }),
};

// Tasks
export const tasksAPI = {
  get: (id: string) => fetchAPI(`/tasks/${id}`),
  create: (data: { title: string; column_id: string; description?: string; priority?: string }) => 
    fetchAPI('/tasks', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: any) => 
    fetchAPI(`/tasks/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) => 
    fetchAPI(`/tasks/${id}`, { method: 'DELETE' }),
  reorder: (tasks: { id: string; column_id: string; position: number }[]) => 
    fetchAPI('/tasks', { method: 'PUT', body: JSON.stringify({ tasks }) }),
};

// Checklists
export const checklistsAPI = {
  create: (data: { title: string; task_id: string }) => 
    fetchAPI('/checklists', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: { title?: string }) => 
    fetchAPI(`/checklists/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) => 
    fetchAPI(`/checklists/${id}`, { method: 'DELETE' }),
  createItem: (data: { content: string; checklist_id: string }) => 
    fetchAPI('/checklists/items', { method: 'POST', body: JSON.stringify(data) }),
  updateItem: (id: string, data: { content?: string; completed?: boolean }) => 
    fetchAPI(`/checklists/items/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteItem: (id: string) => 
    fetchAPI(`/checklists/items/${id}`, { method: 'DELETE' }),
};

// Comments
export const commentsAPI = {
  create: (data: { content: string; task_id: string; author_name?: string }) => 
    fetchAPI('/comments', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: { content: string }) => 
    fetchAPI(`/comments/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) => 
    fetchAPI(`/comments/${id}`, { method: 'DELETE' }),
};
