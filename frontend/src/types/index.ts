export interface ChecklistItem {
  id: string;
  content: string;
  completed: boolean;
  position: number;
  checklist_id: string;
  created_at: string;
}

export interface Checklist {
  id: string;
  title: string;
  position: number;
  task_id: string;
  created_at: string;
  items: ChecklistItem[];
}

export interface Comment {
  id: string;
  content: string;
  author_name: string;
  task_id: string;
  created_at: string;
  updated_at?: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  position: number;
  priority: string;
  due_date?: string;
  column_id: string;
  created_at: string;
  updated_at?: string;
  checklists: Checklist[];
  comments: Comment[];
  comments_count?: number;
}

export interface Column {
  id: string;
  name: string;
  position: number;
  project_id: string;
  created_at: string;
  tasks: Task[];
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  type: string;
  archived: boolean;
  created_at: string;
  updated_at?: string;
  columns: Column[];
  task_count?: number;
}
