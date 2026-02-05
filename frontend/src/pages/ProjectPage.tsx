import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { Plus, MoreHorizontal } from 'lucide-react';
import { projectsAPI, tasksAPI } from '../lib/api';
import { Project, Task, Column } from '../types';
import { TaskModal } from '../components/TaskModal';
import { cn } from '../lib/utils';

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

    const { source, destination, draggableId } = result;
    
    if (source.droppableId === destination.droppableId && source.index === destination.index) {
      return;
    }

    // Clone columns
    const newColumns = [...project.columns];
    const sourceColumn = newColumns.find(col => col.id === source.droppableId);
    const destColumn = newColumns.find(col => col.id === destination.droppableId);
    
    if (!sourceColumn || !destColumn) return;

    // Remove from source
    const [movedTask] = sourceColumn.tasks.splice(source.index, 1);
    
    // Add to destination
    movedTask.column_id = destination.droppableId;
    destColumn.tasks.splice(destination.index, 0, movedTask);

    // Update positions
    sourceColumn.tasks.forEach((task, idx) => { task.position = idx; });
    destColumn.tasks.forEach((task, idx) => { task.position = idx; });

    // Update state optimistically
    setProject({ ...project, columns: newColumns });

    // Prepare tasks to reorder
    const tasksToUpdate = [
      ...sourceColumn.tasks.map(t => ({ id: t.id, column_id: t.column_id, position: t.position })),
      ...destColumn.tasks.map(t => ({ id: t.id, column_id: t.column_id, position: t.position }))
    ];

    try {
      await tasksAPI.reorder(tasksToUpdate);
    } catch (error) {
      console.error('Failed to reorder tasks:', error);
      fetchProject(); // Revert on error
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
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-400';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500">Project not found</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-6 border-b bg-white">
        <h1 className="text-2xl font-bold text-gray-900">{project.name}</h1>
        {project.description && (
          <p className="text-gray-500 mt-1">{project.description}</p>
        )}
      </div>

      {/* Kanban Board */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="flex-1 overflow-x-auto p-6">
          <div className="flex gap-4 h-full min-w-max">
            {project.columns.map((column) => (
              <div key={column.id} className="w-72 flex-shrink-0 flex flex-col bg-gray-200 rounded-xl">
                {/* Column Header */}
                <div className="p-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-700">{column.name}</h3>
                    <span className="text-sm text-gray-500 bg-gray-300 px-2 py-0.5 rounded-full">
                      {column.tasks.length}
                    </span>
                  </div>
                  <button className="text-gray-400 hover:text-gray-600">
                    <MoreHorizontal size={18} />
                  </button>
                </div>

                {/* Tasks */}
                <Droppable droppableId={column.id}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={cn(
                        "flex-1 p-2 space-y-2 overflow-y-auto min-h-[100px]",
                        snapshot.isDraggingOver && "bg-gray-300"
                      )}
                    >
                      {column.tasks.map((task, index) => (
                        <Draggable key={task.id} draggableId={task.id} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              onClick={() => setSelectedTaskId(task.id)}
                              className={cn(
                                "bg-white rounded-lg p-3 shadow-sm cursor-pointer hover:shadow-md transition-shadow",
                                snapshot.isDragging && "shadow-lg"
                              )}
                            >
                              <div className="flex items-start gap-2 mb-2">
                                <span className={cn("w-2 h-2 rounded-full mt-1.5 flex-shrink-0", getPriorityColor(task.priority))} />
                                <p className="text-sm font-medium text-gray-900">{task.title}</p>
                              </div>
                              {task.description && (
                                <p className="text-xs text-gray-500 line-clamp-2 ml-4">{task.description}</p>
                              )}
                              <div className="flex items-center gap-2 mt-2 ml-4">
                                {task.checklists.length > 0 && (
                                  <span className="text-xs text-gray-400">
                                    ✓ {task.checklists.reduce((sum, cl) => sum + cl.items.filter(i => i.completed).length, 0)}/
                                    {task.checklists.reduce((sum, cl) => sum + cl.items.length, 0)}
                                  </span>
                                )}
                                {(task.comments_count || 0) > 0 && (
                                  <span className="text-xs text-gray-400">💬 {task.comments_count}</span>
                                )}
                                {task.due_date && (
                                  <span className="text-xs text-gray-400">
                                    📅 {new Date(task.due_date).toLocaleDateString()}
                                  </span>
                                )}
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>

                {/* Add Task */}
                <div className="p-2">
                  {addingTaskColumnId === column.id ? (
                    <div className="bg-white rounded-lg p-3 shadow-sm">
                      <input
                        type="text"
                        value={newTaskTitle}
                        onChange={(e) => setNewTaskTitle(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAddTask(column.id)}
                        placeholder="Enter task title..."
                        className="w-full text-sm border-none outline-none"
                        autoFocus
                      />
                      <div className="flex gap-2 mt-2">
                        <button
                          onClick={() => handleAddTask(column.id)}
                          className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                        >
                          Add
                        </button>
                        <button
                          onClick={() => {
                            setAddingTaskColumnId(null);
                            setNewTaskTitle('');
                          }}
                          className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setAddingTaskColumnId(column.id)}
                      className="w-full flex items-center gap-2 p-2 text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-300 rounded-lg transition-colors"
                    >
                      <Plus size={16} />
                      Add a task
                    </button>
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
