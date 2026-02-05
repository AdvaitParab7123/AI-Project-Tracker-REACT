import { useEffect, useState, useCallback } from 'react';
import { Trash2, Plus, Check, MessageSquare, CheckSquare, Calendar, Loader2, Flag } from 'lucide-react';
import { tasksAPI, checklistsAPI, commentsAPI } from '@/lib/api';
import type { Task } from '@/types';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

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
  
  const [newChecklistTitle, setNewChecklistTitle] = useState('');
  const [addingChecklist, setAddingChecklist] = useState(false);
  const [newItemContent, setNewItemContent] = useState<{ [key: string]: string }>({});
  
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
      <Dialog open={true} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[600px]">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!task) {
    return (
      <Dialog open={true} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[600px]">
          <div className="text-center py-12">
            <p className="text-slate-500">Task not found</p>
            <Button onClick={onClose} className="mt-4">Close</Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[650px] max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <div className="flex items-start gap-3">
            <div className="flex-1">
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onBlur={handleSave}
                className="text-xl font-semibold border-0 shadow-none px-0 h-auto focus-visible:ring-0"
                placeholder="Task title..."
              />
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
          {/* Metadata */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-slate-600">
                <Flag className="h-4 w-4" /> Priority
              </Label>
              <Select
                value={priority}
                onValueChange={(value) => { setPriority(value); setTimeout(handleSave, 100); }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">🟢 Low</SelectItem>
                  <SelectItem value="medium">🟡 Medium</SelectItem>
                  <SelectItem value="high">🔴 High</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-slate-600">
                <Calendar className="h-4 w-4" /> Due Date
              </Label>
              <Input
                type="date"
                value={dueDate}
                onChange={(e) => { setDueDate(e.target.value); setTimeout(handleSave, 100); }}
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label className="text-slate-600">Description</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              onBlur={handleSave}
              placeholder="Add a description..."
              rows={3}
              className="resize-none"
            />
          </div>

          {/* Checklists */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="flex items-center gap-2 text-slate-600">
                <CheckSquare className="h-4 w-4" /> Checklists
              </Label>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setAddingChecklist(true)}
                className="text-indigo-600 hover:text-indigo-700 h-8"
              >
                <Plus className="h-4 w-4 mr-1" /> Add
              </Button>
            </div>

            {addingChecklist && (
              <Card className="border-slate-200">
                <CardContent className="p-3">
                  <Input
                    value={newChecklistTitle}
                    onChange={(e) => setNewChecklistTitle(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddChecklist()}
                    placeholder="Checklist title..."
                    className="mb-2"
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <Button size="sm" onClick={handleAddChecklist}>Add</Button>
                    <Button size="sm" variant="ghost" onClick={() => setAddingChecklist(false)}>Cancel</Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {task.checklists.map((checklist) => {
              const completedCount = checklist.items.filter(i => i.completed).length;
              const totalCount = checklist.items.length;
              const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

              return (
                <Card key={checklist.id} className="border-slate-200">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <h4 className="font-medium text-slate-700">{checklist.title}</h4>
                        {totalCount > 0 && (
                          <Badge variant="secondary" className="text-xs">
                            {completedCount}/{totalCount}
                          </Badge>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-slate-400 hover:text-red-500"
                        onClick={() => handleDeleteChecklist(checklist.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    {totalCount > 0 && (
                      <div className="h-1.5 bg-slate-100 rounded-full mb-3 overflow-hidden">
                        <div 
                          className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    )}
                    
                    <div className="space-y-2">
                      {checklist.items.map((item) => (
                        <div key={item.id} className="flex items-center gap-2 group">
                          <button
                            onClick={() => handleToggleItem(item.id, item.completed)}
                            className={cn(
                              "w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all",
                              item.completed 
                                ? "bg-emerald-500 border-emerald-500 text-white" 
                                : "border-slate-300 hover:border-emerald-500"
                            )}
                          >
                            {item.completed && <Check className="h-3 w-3" />}
                          </button>
                          <span className={cn(
                            "flex-1 text-sm",
                            item.completed && "line-through text-slate-400"
                          )}>
                            {item.content}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 opacity-0 group-hover:opacity-100 text-slate-300 hover:text-red-500"
                            onClick={() => handleDeleteItem(item.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>

                    <div className="mt-3">
                      <Input
                        value={newItemContent[checklist.id] || ''}
                        onChange={(e) => setNewItemContent({ ...newItemContent, [checklist.id]: e.target.value })}
                        onKeyDown={(e) => e.key === 'Enter' && handleAddChecklistItem(checklist.id)}
                        placeholder="Add item..."
                        className="h-8 text-sm"
                      />
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Comments */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2 text-slate-600">
              <MessageSquare className="h-4 w-4" /> Comments
            </Label>

            <div className="space-y-3">
              <Textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Write a comment..."
                rows={2}
                className="resize-none"
              />
              <Button
                onClick={handleAddComment}
                disabled={!newComment.trim() || submittingComment}
                size="sm"
              >
                {submittingComment ? 'Posting...' : 'Post Comment'}
              </Button>
            </div>

            <div className="space-y-4 mt-4">
              {task.comments.map((comment) => (
                <div key={comment.id} className="flex gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-slate-100 text-slate-600 text-xs">
                      {comment.author_name.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm text-slate-900">{comment.author_name}</span>
                      <span className="text-xs text-slate-400">
                        {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600 mt-1">{comment.content}</p>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 px-0 text-xs text-slate-400 hover:text-red-500"
                      onClick={() => handleDeleteComment(comment.id)}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
              {task.comments.length === 0 && (
                <p className="text-sm text-slate-400 text-center py-4">No comments yet</p>
              )}
            </div>
          </div>
        </div>

        <DialogFooter className="px-6 py-4 border-t bg-slate-50/50">
          <div className="flex items-center justify-between w-full">
            <Button
              variant="ghost"
              onClick={handleDelete}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4 mr-2" /> Delete Task
            </Button>
            <Button onClick={() => { handleSave(); onClose(); }}>
              Save & Close
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
