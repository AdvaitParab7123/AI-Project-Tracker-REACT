import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import type { DropResult } from '@hello-pangea/dnd';
import { Plus, MoreHorizontal, MessageSquare, CheckSquare, Calendar, Loader2 } from 'lucide-react';
import { projectsAPI, tasksAPI } from '@/lib/api';
import type { Project } from '@/types';
import { TaskModal } from '@/components/TaskModal';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';

interface ProjectPageProps {
  onUpdate: () => void;
}

export function ProjectPage({ onUpdate }: ProjectPageProps) {
  const { id } = useParams<{ id: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [addingTaskColumnId, setAddingTaskColumnId] = useState<string | null>(null);
  const [newTaskTitle, setNewTaskTitle] = useState('');

  const fetchProject = async () => {
    if (!id) return;
    try {
      const data = await projectsAPI.get(id);
      setProject(data);
    } catch (error) {
      console.error('Failed to fetch project:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProject();
  }, [id]);

  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination || !project) return;

    const { source, destination } = result;
    
    if (source.droppableId === destination.droppableId && source.index === destination.index) {
      return;
    }

    const newColumns = [...project.columns];
    const sourceColumn = newColumns.find(col => col.id === source.droppableId);
    const destColumn = newColumns.find(col => col.id === destination.droppableId);
    
    if (!sourceColumn || !destColumn) return;

    const [movedTask] = sourceColumn.tasks.splice(source.index, 1);
    movedTask.column_id = destination.droppableId;
    destColumn.tasks.splice(destination.index, 0, movedTask);

    sourceColumn.tasks.forEach((task, idx) => { task.position = idx; });
    destColumn.tasks.forEach((task, idx) => { task.position = idx; });

    setProject({ ...project, columns: newColumns });

    const tasksToUpdate = [
      ...sourceColumn.tasks.map(t => ({ id: t.id, column_id: t.column_id, position: t.position })),
      ...destColumn.tasks.map(t => ({ id: t.id, column_id: t.column_id, position: t.position }))
    ];

    try {
      await tasksAPI.reorder(tasksToUpdate);
    } catch (error) {
      console.error('Failed to reorder tasks:', error);
      fetchProject();
    }
  };

  const handleAddTask = async (columnId: string) => {
    if (!newTaskTitle.trim()) return;

    try {
      await tasksAPI.create({ title: newTaskTitle, column_id: columnId });
      setNewTaskTitle('');
      setAddingTaskColumnId(null);
      fetchProject();
      onUpdate();
    } catch (error) {
      console.error('Failed to create task:', error);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-amber-500';
      case 'low': return 'bg-emerald-500';
      default: return 'bg-slate-400';
    }
  };

  const getColumnColor = (index: number) => {
    const colors = [
      'from-slate-500/10 to-slate-500/5',
      'from-blue-500/10 to-blue-500/5',
      'from-emerald-500/10 to-emerald-500/5',
      'from-purple-500/10 to-purple-500/5',
    ];
    return colors[index % colors.length];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full bg-gradient-to-br from-slate-50 to-slate-100/50">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
          <p className="text-sm text-slate-500">Loading project...</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex items-center justify-center h-full bg-gradient-to-br from-slate-50 to-slate-100/50">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-slate-900 mb-2">Project not found</h2>
          <p className="text-slate-500">The project you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-slate-50 to-slate-100/50">
      {/* Header */}
      <div className="px-8 py-6 bg-white/80 backdrop-blur border-b border-slate-200/50">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{project.name}</h1>
        {project.description && (
          <p className="text-slate-500 mt-1">{project.description}</p>
        )}
      </div>

      {/* Kanban Board */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="flex-1 overflow-x-auto p-6">
          <div className="flex gap-5 h-full min-w-max">
            {project.columns.map((column, columnIndex) => (
              <div 
                key={column.id} 
                className={cn(
                  "w-80 flex-shrink-0 flex flex-col rounded-xl bg-gradient-to-b",
                  getColumnColor(columnIndex)
                )}
              >
                {/* Column Header */}
                <div className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-slate-700">{column.name}</h3>
                    <span className="text-xs font-medium text-slate-500 bg-white/60 px-2 py-0.5 rounded-full">
                      {column.tasks.length}
                    </span>
                  </div>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-600">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </div>

                {/* Tasks */}
                <Droppable droppableId={column.id}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={cn(
                        "flex-1 px-3 pb-3 space-y-3 overflow-y-auto min-h-[120px] transition-colors rounded-lg mx-1",
                        snapshot.isDraggingOver && "bg-white/40"
                      )}
                    >
                      {column.tasks.map((task, index) => (
                        <Draggable key={task.id} draggableId={task.id} index={index}>
                          {(provided, snapshot) => (
                            <Card
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              onClick={() => setSelectedTaskId(task.id)}
                              className={cn(
                                "border-0 shadow-sm cursor-pointer hover:shadow-md transition-all duration-200 bg-white",
                                snapshot.isDragging && "shadow-lg ring-2 ring-indigo-500/20"
                              )}
                            >
                              <CardContent className="p-4">
                                <div className="flex items-start gap-2.5 mb-2">
                                  <span className={cn("w-2 h-2 rounded-full mt-1.5 flex-shrink-0", getPriorityColor(task.priority))} />
                                  <p className="text-sm font-medium text-slate-900 leading-snug">{task.title}</p>
                                </div>
                                {task.description && (
                                  <p className="text-xs text-slate-500 line-clamp-2 ml-4.5 mb-2">{task.description}</p>
                                )}
                                <div className="flex items-center gap-3 mt-3 ml-4.5">
                                  {task.checklists.length > 0 && (
                                    <span className="flex items-center gap-1 text-xs text-slate-400">
                                      <CheckSquare className="h-3.5 w-3.5" />
                                      {task.checklists.reduce((sum, cl) => sum + cl.items.filter(i => i.completed).length, 0)}/
                                      {task.checklists.reduce((sum, cl) => sum + cl.items.length, 0)}
                                    </span>
                                  )}
                                  {(task.comments_count || 0) > 0 && (
                                    <span className="flex items-center gap-1 text-xs text-slate-400">
                                      <MessageSquare className="h-3.5 w-3.5" />
                                      {task.comments_count}
                                    </span>
                                  )}
                                  {task.due_date && (
                                    <span className="flex items-center gap-1 text-xs text-slate-400">
                                      <Calendar className="h-3.5 w-3.5" />
                                      {new Date(task.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                    </span>
                                  )}
                                </div>
                              </CardContent>
                            </Card>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>

                {/* Add Task */}
                <div className="p-3">
                  {addingTaskColumnId === column.id ? (
                    <Card className="border-0 shadow-sm bg-white">
                      <CardContent className="p-3">
                        <Input
                          value={newTaskTitle}
                          onChange={(e) => setNewTaskTitle(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleAddTask(column.id)}
                          placeholder="Enter task title..."
                          className="mb-2 border-slate-200"
                          autoFocus
                        />
                        <div className="flex gap-2">
                          <Button size="sm" onClick={() => handleAddTask(column.id)}>
                            Add Task
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setAddingTaskColumnId(null);
                              setNewTaskTitle('');
                            }}
                          >
                            Cancel
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ) : (
                    <Button
                      variant="ghost"
                      className="w-full justify-start gap-2 text-slate-500 hover:text-slate-700 hover:bg-white/50"
                      onClick={() => setAddingTaskColumnId(column.id)}
                    >
                      <Plus className="h-4 w-4" />
                      Add a task
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </DragDropContext>

      {/* Task Modal */}
      {selectedTaskId && (
        <TaskModal
          taskId={selectedTaskId}
          onClose={() => setSelectedTaskId(null)}
          onUpdate={() => {
            fetchProject();
            onUpdate();
          }}
        />
      )}
    </div>
  );
}
