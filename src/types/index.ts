
export type TaskPriority = 'low' | 'medium' | 'high';
export type TaskCategory = 'work' | 'personal' | 'health' | 'finance' | 'education' | 'other';
export type TaskFrequency = 'daily' | 'weekly' | 'monthly' | 'once';

export interface SubTask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  category: TaskCategory;
  priority: TaskPriority;
  frequency: TaskFrequency;
  dueDate?: string;
  reminderTime?: string;
  completed: boolean;
  completedAt?: string;
  createdAt: string;
  subtasks: SubTask[];
  isInFocus?: boolean;
}

export interface Streak {
  current: number;
  longest: number;
  lastCompleted?: string;
}

export type AchievementType = 
  | 'streak_3' 
  | 'streak_7' 
  | 'streak_30' 
  | 'tasks_10'
  | 'tasks_50'
  | 'tasks_100'
  | 'all_category'
  | 'focus_master'
  | 'subtask_king';

export interface Achievement {
  id: AchievementType;
  title: string;
  description: string;
  icon: string;
  unlockedAt?: string;
  progress: number;
  target: number;
}

export interface UserStats {
  level: number;
  experience: number;
  experienceToNextLevel: number;
  tasksCompleted: number;
  streak: Streak;
  achievements: Achievement[];
  focusTime: number; // in minutes
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  notifications: boolean;
  soundEffects: boolean;
  focusDuration: number; // in minutes
  breakDuration: number; // in minutes
}
