import { useEffect, useState, useCallback } from 'react';
import { X, Trash2, Plus, Check, MessageSquare } from 'lucide-react';
import { tasksAPI, checklistsAPI, commentsAPI } from '../lib/api';
import type { Task } from '../types';
import { cn } from '../lib/utils';
import { formatDistanceToNow } from 'date-fns';

interface TaskModalProps {
  taskId: string;
  onClose: () => void;
  onUpdate: () => void;
}

export function TaskModal({ taskId, onClose, onUpdate }: TaskModalProps) {
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('medium');
  const [dueDate, setDueDate] = useState('');
  
  // Checklist states
  const [newChecklistTitle, setNewChecklistTitle] = useState('');
  const [addingChecklist, setAddingChecklist] = useState(false);
  const [newItemContent, setNewItemContent] = useState<{ [key: string]: string }>({});
  
  // Comment states
  const [newComment, setNewComment] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);

  const fetchTask = useCallback(async () => {
    try {
      const data = await tasksAPI.get(taskId);
      setTask(data);
      setTitle(data.title);
      setDescription(data.description || '');
      setPriority(data.priority);
      setDueDate(data.due_date ? data.due_date.split('T')[0] : '');
    } catch (error) {
      console.error('Failed to fetch task:', error);
    } finally {
      setLoading(false);
    }
  }, [taskId]);

  useEffect(() => {
    fetchTask();
  }, [fetchTask]);

  const handleSave = async () => {
    try {
      await tasksAPI.update(taskId, {
        title,
        description: description || null,
        priority,
        due_date: dueDate ? new Date(dueDate).toISOString() : null,
      });
      onUpdate();
    } catch (error) {
      console.error('Failed to save task:', error);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this task?')) return;
    try {
      await tasksAPI.delete(taskId);
      onClose();
      onUpdate();
    } catch (error) {
      console.error('Failed to delete task:', error);
    }
  };

  // Checklist functions
  const handleAddChecklist = async () => {
    if (!newChecklistTitle.trim()) return;
    try {
      await checklistsAPI.create({ title: newChecklistTitle, task_id: taskId });
      setNewChecklistTitle('');
      setAddingChecklist(false);
      fetchTask();
    } catch (error) {
      console.error('Failed to add checklist:', error);
    }
  };

  const handleDeleteChecklist = async (checklistId: string) => {
    try {
      await checklistsAPI.delete(checklistId);
      fetchTask();
    } catch (error) {
      console.error('Failed to delete checklist:', error);
    }
  };

  const handleAddChecklistItem = async (checklistId: string) => {
    const content = newItemContent[checklistId];
    if (!content?.trim()) return;
    try {
      await checklistsAPI.createItem({ content, checklist_id: checklistId });
      setNewItemContent({ ...newItemContent, [checklistId]: '' });
      fetchTask();
    } catch (error) {
      console.error('Failed to add checklist item:', error);
    }
  };

  const handleToggleItem = async (itemId: string, completed: boolean) => {
    try {
      await checklistsAPI.updateItem(itemId, { completed: !completed });
      fetchTask();
    } catch (error) {
      console.error('Failed to toggle item:', error);
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    try {
      await checklistsAPI.deleteItem(itemId);
      fetchTask();
    } catch (error) {
      console.error('Failed to delete item:', error);
    }
  };

  // Comment functions
  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    setSubmittingComment(true);
    try {
      await commentsAPI.create({ content: newComment, task_id: taskId });
      setNewComment('');
      fetchTask();
    } catch (error) {
      console.error('Failed to add comment:', error);
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm('Delete this comment?')) return;
    try {
      await commentsAPI.delete(commentId);
      fetchTask();
    } catch (error) {
      console.error('Failed to delete comment:', error);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl p-8">
          <p className="text-gray-500">Task not found</p>
          <button onClick={onClose} className="mt-4 px-4 py-2 bg-gray-200 rounded-lg">Close</button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={handleSave}
            className="text-xl font-semibold text-gray-900 border-none outline-none flex-1"
          />
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 ml-4">
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Metadata */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
              <select
                value={priority}
                onChange={(e) => { setPriority(e.target.value); setTimeout(handleSave, 100); }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="low">🟢 Low</option>
                <option value="medium">🟡 Medium</option>
                <option value="high">🔴 High</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => { setDueDate(e.target.value); setTimeout(handleSave, 100); }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              onBlur={handleSave}
              placeholder="Add a description..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Checklists */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-700">Checklists</h3>
              <button
                onClick={() => setAddingChecklist(true)}
                className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                <Plus size={14} /> Add checklist
              </button>
            </div>

            {addingChecklist && (
              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <input
                  type="text"
                  value={newChecklistTitle}
                  onChange={(e) => setNewChecklistTitle(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddChecklist()}
                  placeholder="Checklist title..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-2"
                  autoFocus
                />
                <div className="flex gap-2">
                  <button onClick={handleAddChecklist} className="px-3 py-1 bg-blue-600 text-white text-sm rounded">
                    Add
                  </button>
                  <button onClick={() => setAddingChecklist(false)} className="px-3 py-1 text-gray-600 text-sm">
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {task.checklists.map((checklist) => (
              <div key={checklist.id} className="mb-4 p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-700">{checklist.title}</h4>
                  <button
                    onClick={() => handleDeleteChecklist(checklist.id)}
                    className="text-gray-400 hover:text-red-500"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
                
                <div className="space-y-1">
                  {checklist.items.map((item) => (
                    <div key={item.id} className="flex items-center gap-2 group">
                      <button
                        onClick={() => handleToggleItem(item.id, item.completed)}
                        className={cn(
                          "w-5 h-5 rounded border flex items-center justify-center flex-shrink-0",
                          item.completed ? "bg-green-500 border-green-500 text-white" : "border-gray-300"
                        )}
                      >
                        {item.completed && <Check size={12} />}
                      </button>
                      <span className={cn("flex-1 text-sm", item.completed && "line-through text-gray-400")}>
                        {item.content}
                      </span>
                      <button
                        onClick={() => handleDeleteItem(item.id)}
                        className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="mt-2">
                  <input
                    type="text"
                    value={newItemContent[checklist.id] || ''}
                    onChange={(e) => setNewItemContent({ ...newItemContent, [checklist.id]: e.target.value })}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddChecklistItem(checklist.id)}
                    placeholder="Add item..."
                    className="w-full px-2 py-1 text-sm border border-gray-200 rounded"
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Comments */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <MessageSquare size={16} /> Comments
            </h3>

            <div className="mb-4">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Write a comment..."
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={handleAddComment}
                disabled={!newComment.trim() || submittingComment}
                className="mt-2 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {submittingComment ? 'Posting...' : 'Post Comment'}
              </button>
            </div>

            <div className="space-y-3">
              {task.comments.map((comment) => (
                <div key={comment.id} className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-medium flex-shrink-0">
                    {comment.author_name.substring(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">{comment.author_name}</span>
                      <span className="text-xs text-gray-400">
                        {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 mt-1">{comment.content}</p>
                    <button
                      onClick={() => handleDeleteComment(comment.id)}
                      className="text-xs text-gray-400 hover:text-red-500 mt-1"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
              {task.comments.length === 0 && (
                <p className="text-sm text-gray-400 text-center py-4">No comments yet</p>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t bg-gray-50">
          <button
            onClick={handleDelete}
            className="px-4 py-2 text-red-600 hover:text-red-700 flex items-center gap-2"
          >
            <Trash2 size={16} /> Delete Task
          </button>
          <button
            onClick={() => { handleSave(); onClose(); }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Save & Close
          </button>
        </div>
      </div>
    </div>
  );
}
