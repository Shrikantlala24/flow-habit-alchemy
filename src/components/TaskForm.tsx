
import React, { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogTrigger
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel 
} from '@/components/ui/form';
import { X, Plus, Calendar } from 'lucide-react';
import { 
  Task, 
  TaskCategory, 
  TaskPriority, 
  TaskFrequency, 
  SubTask 
} from '@/types';
import { saveTask, generateId } from '@/utils/storage';

interface TaskFormProps {
  task?: Task;
  onSave: () => void;
  trigger?: React.ReactNode;
}

const TaskForm: React.FC<TaskFormProps> = ({ task, onSave, trigger }) => {
  const isEditing = !!task;
  
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState(task?.title || '');
  const [description, setDescription] = useState(task?.description || '');
  const [category, setCategory] = useState<TaskCategory>(task?.category || 'personal');
  const [priority, setPriority] = useState<TaskPriority>(task?.priority || 'medium');
  const [frequency, setFrequency] = useState<TaskFrequency>(task?.frequency || 'daily');
  const [dueDate, setDueDate] = useState(task?.dueDate || '');
  const [subtasks, setSubtasks] = useState<SubTask[]>(task?.subtasks || []);
  const [newSubtask, setNewSubtask] = useState('');
  
  const handleAddSubtask = () => {
    if (newSubtask.trim()) {
      setSubtasks([
        ...subtasks, 
        { id: generateId(), title: newSubtask, completed: false }
      ]);
      setNewSubtask('');
    }
  };

  const handleRemoveSubtask = (id: string) => {
    setSubtasks(subtasks.filter(subtask => subtask.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) return;
    
    const newTask: Task = {
      id: task?.id || generateId(),
      title,
      description,
      category,
      priority,
      frequency,
      dueDate: dueDate || undefined,
      completed: task?.completed || false,
      completedAt: task?.completedAt,
      createdAt: task?.createdAt || new Date().toISOString(),
      subtasks,
    };
    
    saveTask(newTask);
    onSave();
    setOpen(false);
    
    // Reset form if not editing
    if (!isEditing) {
      setTitle('');
      setDescription('');
      setCategory('personal');
      setPriority('medium');
      setFrequency('daily');
      setDueDate('');
      setSubtasks([]);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger ? (
        <DialogTrigger asChild>
          {trigger}
        </DialogTrigger>
      ) : (
        <DialogTrigger asChild>
          <Button size="sm" className="gap-1">
            <Plus size={16} />
            Add Task
          </Button>
        </DialogTrigger>
      )}
      
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Task' : 'Create New Task'}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <FormItem>
            <FormLabel>Title</FormLabel>
            <FormControl>
              <Input 
                placeholder="What needs to be done?" 
                value={title}
                onChange={e => setTitle(e.target.value)}
                required
              />
            </FormControl>
          </FormItem>
          
          <FormItem>
            <FormLabel>Description (Optional)</FormLabel>
            <FormControl>
              <Textarea 
                placeholder="Add details about this task..." 
                value={description}
                onChange={e => setDescription(e.target.value)}
                className="resize-none"
                rows={3}
              />
            </FormControl>
          </FormItem>
          
          <div className="grid grid-cols-2 gap-4">
            <FormItem>
              <FormLabel>Category</FormLabel>
              <Select 
                value={category} 
                onValueChange={(value: TaskCategory) => setCategory(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="work">Work</SelectItem>
                  <SelectItem value="personal">Personal</SelectItem>
                  <SelectItem value="health">Health</SelectItem>
                  <SelectItem value="finance">Finance</SelectItem>
                  <SelectItem value="education">Education</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </FormItem>
            
            <FormItem>
              <FormLabel>Priority</FormLabel>
              <Select 
                value={priority} 
                onValueChange={(value: TaskPriority) => setPriority(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </FormItem>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <FormItem>
              <FormLabel>Frequency</FormLabel>
              <Select 
                value={frequency} 
                onValueChange={(value: TaskFrequency) => setFrequency(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select frequency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="once">Once</SelectItem>
                </SelectContent>
              </Select>
            </FormItem>
            
            <FormItem>
              <FormLabel>Due Date (Optional)</FormLabel>
              <div className="flex">
                <Input 
                  type="date"
                  value={dueDate}
                  onChange={e => setDueDate(e.target.value)}
                  className="w-full"
                />
              </div>
            </FormItem>
          </div>
          
          <div className="space-y-2">
            <FormLabel>Subtasks (Optional)</FormLabel>
            <div className="flex space-x-2">
              <Input 
                placeholder="Add a subtask" 
                value={newSubtask}
                onChange={e => setNewSubtask(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSubtask();
                  }
                }}
              />
              <Button 
                type="button" 
                variant="secondary" 
                onClick={handleAddSubtask}
              >
                Add
              </Button>
            </div>
            
            {subtasks.length > 0 && (
              <div className="mt-2 space-y-2">
                {subtasks.map(subtask => (
                  <div 
                    key={subtask.id} 
                    className="flex items-center justify-between p-2 bg-secondary rounded-md"
                  >
                    <span className="text-sm truncate">{subtask.title}</span>
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => handleRemoveSubtask(subtask.id)}
                      className="h-6 w-6"
                    >
                      <X size={14} />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <DialogFooter className="mt-6">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit">
              {isEditing ? 'Update' : 'Create'} Task
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default TaskForm;
