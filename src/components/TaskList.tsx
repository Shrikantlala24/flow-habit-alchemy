
import React, { useState } from 'react';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { 
  Card, 
  CardContent 
} from '@/components/ui/card';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  MoreHorizontal, 
  Calendar, 
  Clock, 
  Edit, 
  Trash, 
  CheckCircle2, 
  ChevronDown, 
  ChevronUp, 
  Play,
  AlertTriangle
} from 'lucide-react';
import { Task, SubTask } from '@/types';
import { getTasks, saveTask, deleteTask, completeTask } from '@/utils/storage';
import TaskForm from './TaskForm';

interface TaskListProps {
  onStartFocus: (task: Task) => void;
  onRefreshStats: () => void;
}

const TaskList: React.FC<TaskListProps> = ({ onStartFocus, onRefreshStats }) => {
  const [tasks, setTasks] = useState<Task[]>(getTasks());
  const [expandedTask, setExpandedTask] = useState<string | null>(null);
  
  const refreshTasks = () => {
    setTasks(getTasks());
    onRefreshStats();
  };

  const handleComplete = (taskId: string, completed: boolean) => {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      const updatedTask = { ...task, completed };
      if (completed) {
        updatedTask.completedAt = new Date().toISOString();
        completeTask(taskId);
      } else {
        delete updatedTask.completedAt;
        saveTask(updatedTask);
      }
      refreshTasks();
    }
  };

  const handleToggleSubtask = (taskId: string, subtaskId: string, completed: boolean) => {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      const updatedSubtasks = task.subtasks.map(s => 
        s.id === subtaskId ? { ...s, completed } : s
      );
      const updatedTask = { ...task, subtasks: updatedSubtasks };
      saveTask(updatedTask);
      refreshTasks();
    }
  };

  const handleDelete = (taskId: string) => {
    deleteTask(taskId);
    refreshTasks();
  };

  const handleStartFocus = (task: Task) => {
    onStartFocus(task);
  };

  const activeTasks = tasks.filter(t => !t.completed);
  const completedTasks = tasks.filter(t => t.completed);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-destructive';
      case 'medium': return 'text-warning-DEFAULT';
      case 'low': return 'text-success-DEFAULT';
      default: return '';
    }
  };

  const getCategoryBadge = (category: string) => {
    switch (category) {
      case 'work': return 'bg-blue-100 text-blue-800';
      case 'personal': return 'bg-purple-100 text-purple-800';
      case 'health': return 'bg-green-100 text-green-800';
      case 'finance': return 'bg-amber-100 text-amber-800';
      case 'education': return 'bg-indigo-100 text-indigo-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const TaskItem = ({ task }: { task: Task }) => {
    const isExpanded = expandedTask === task.id;
    const hasSubtasks = task.subtasks && task.subtasks.length > 0;
    
    const completedSubtasks = task.subtasks.filter(s => s.completed).length;
    const subtaskProgress = task.subtasks.length > 0 
      ? (completedSubtasks / task.subtasks.length) * 100 
      : 0;
    
    const isDueSoon = () => {
      if (!task.dueDate) return false;
      const dueDate = new Date(task.dueDate);
      const today = new Date();
      const diffTime = dueDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays <= 2 && diffDays >= 0 && !task.completed;
    };

    return (
      <Card className="mb-3 overflow-hidden" key={task.id}>
        <div className="flex items-center p-4">
          <Checkbox 
            checked={task.completed} 
            onCheckedChange={(checked) => handleComplete(task.id, checked as boolean)}
            className="mr-3"
          />
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <h3 className={`font-medium truncate ${task.completed ? 'line-through text-muted-foreground' : ''}`}>
                {task.title}
              </h3>
              
              <div className="flex items-center ml-2">
                {isDueSoon() && (
                  <AlertTriangle size={16} className="text-warning-DEFAULT mr-2" />
                )}
                
                <Badge className={`${getCategoryBadge(task.category)} mr-2`}>
                  {task.category}
                </Badge>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal size={16} />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleStartFocus(task)}>
                      <Play size={14} className="mr-2" />
                      Focus on this
                    </DropdownMenuItem>
                    <TaskForm 
                      task={task} 
                      onSave={refreshTasks} 
                      trigger={
                        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                          <Edit size={14} className="mr-2" />
                          Edit
                        </DropdownMenuItem>
                      }
                    />
                    <DropdownMenuItem onClick={() => handleDelete(task.id)}>
                      <Trash size={14} className="mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
            
            {task.description && (
              <p className="text-sm text-muted-foreground mt-1 truncate">
                {task.description}
              </p>
            )}
            
            <div className="flex items-center mt-2 text-xs text-muted-foreground">
              <div className={`mr-3 font-medium ${getPriorityColor(task.priority)}`}>
                {task.priority} priority
              </div>
              
              {task.dueDate && (
                <div className="flex items-center mr-3">
                  <Calendar size={12} className="mr-1" />
                  {formatDate(task.dueDate)}
                </div>
              )}
              
              <div className="flex items-center">
                <Clock size={12} className="mr-1" />
                {task.frequency}
              </div>
            </div>
            
            {hasSubtasks && (
              <div className="mt-2">
                <div className="flex items-center justify-between text-xs">
                  <span>Subtasks: {completedSubtasks}/{task.subtasks.length}</span>
                  <span>{Math.round(subtaskProgress)}%</span>
                </div>
                <div className="progress-bar mt-1">
                  <div 
                    className="progress-value" 
                    style={{width: `${subtaskProgress}%`}}
                  ></div>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {hasSubtasks && (
          <Collapsible open={isExpanded} onOpenChange={() => setExpandedTask(isExpanded ? null : task.id)}>
            <CollapsibleTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                className="w-full flex justify-center py-1 rounded-none border-t"
              >
                {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="pt-0">
                <div className="space-y-2">
                  {task.subtasks.map((subtask: SubTask) => (
                    <div key={subtask.id} className="flex items-center">
                      <Checkbox 
                        checked={subtask.completed} 
                        onCheckedChange={(checked) => handleToggleSubtask(task.id, subtask.id, checked as boolean)}
                        className="mr-2"
                      />
                      <span className={subtask.completed ? 'line-through text-muted-foreground' : ''}>
                        {subtask.title}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </CollapsibleContent>
          </Collapsible>
        )}
      </Card>
    );
  };

  return (
    <div className="mt-4">
      <Tabs defaultValue="active">
        <TabsList className="mb-4 w-full">
          <TabsTrigger value="active" className="flex-1">
            Active Tasks ({activeTasks.length})
          </TabsTrigger>
          <TabsTrigger value="completed" className="flex-1">
            Completed Tasks ({completedTasks.length})
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="active" className="mt-0">
          <div className="space-y-2">
            {activeTasks.length > 0 ? (
              activeTasks.map(task => <TaskItem key={task.id} task={task} />)
            ) : (
              <div className="text-center py-8">
                <CheckCircle2 size={48} className="mx-auto text-muted-foreground mb-2" />
                <h3 className="text-lg font-medium">All caught up!</h3>
                <p className="text-muted-foreground">You don't have any active tasks. Create a new one to get started.</p>
              </div>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="completed" className="mt-0">
          {completedTasks.length > 0 ? (
            completedTasks.map(task => <TaskItem key={task.id} task={task} />)
          ) : (
            <div className="text-center py-8">
              <CheckCircle2 size={48} className="mx-auto text-muted-foreground mb-2" />
              <h3 className="text-lg font-medium">No completed tasks yet</h3>
              <p className="text-muted-foreground">Complete some tasks to see them listed here.</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TaskList;
