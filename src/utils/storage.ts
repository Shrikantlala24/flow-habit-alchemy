import { Task, UserStats, UserPreferences, AchievementType, Achievement } from '@/types';

// Initial achievements
const defaultAchievements: Achievement[] = [
  {
    id: 'streak_3',
    title: '3 Day Streak',
    description: 'Complete tasks for 3 days in a row',
    icon: '🔥',
    progress: 0,
    target: 3,
  },
  {
    id: 'streak_7',
    title: 'Weekly Warrior',
    description: 'Complete tasks for 7 days in a row',
    icon: '🏆',
    progress: 0,
    target: 7,
  },
  {
    id: 'streak_30',
    title: 'Monthly Master',
    description: 'Complete tasks for 30 days in a row',
    icon: '👑',
    progress: 0,
    target: 30,
  },
  {
    id: 'tasks_10',
    title: 'Getting Started',
    description: 'Complete 10 tasks',
    icon: '🚀',
    progress: 0,
    target: 10,
  },
  {
    id: 'tasks_50',
    title: 'Half Century',
    description: 'Complete 50 tasks',
    icon: '💯',
    progress: 0,
    target: 50,
  },
  {
    id: 'tasks_100',
    title: 'Century Club',
    description: 'Complete 100 tasks',
    icon: '🎯',
    progress: 0,
    target: 100,
  },
  {
    id: 'all_category',
    title: 'Well Rounded',
    description: 'Complete tasks in all categories',
    icon: '🌈',
    progress: 0,
    target: 6, // Number of categories
  },
  {
    id: 'focus_master',
    title: 'Focus Master',
    description: 'Use the focus timer for 5 hours total',
    icon: '⏱️',
    progress: 0,
    target: 300, // 300 minutes = 5 hours
  },
  {
    id: 'subtask_king',
    title: 'Subtask King',
    description: 'Complete 20 subtasks',
    icon: '📋',
    progress: 0,
    target: 20,
  },
];

// Default user stats
const defaultStats: UserStats = {
  level: 1,
  experience: 0,
  experienceToNextLevel: 100,
  tasksCompleted: 0,
  streak: {
    current: 0,
    longest: 0,
  },
  achievements: defaultAchievements,
  focusTime: 0,
};

// Default user preferences
const defaultPreferences: UserPreferences = {
  theme: 'system',
  notifications: true,
  soundEffects: true,
  focusDuration: 25,
  breakDuration: 5,
};

// Helper functions to interact with localStorage
const TASKS_KEY = 'flowHabit_tasks';
const USER_STATS_KEY = 'flowHabit_userStats';
const USER_PREFS_KEY = 'flowHabit_userPreferences';

// Task functions
export const getTasks = (): Task[] => {
  const tasks = localStorage.getItem(TASKS_KEY);
  return tasks ? JSON.parse(tasks) : [];
};

export const saveTask = (task: Task): void => {
  const tasks = getTasks();
  const existingTaskIndex = tasks.findIndex(t => t.id === task.id);
  
  if (existingTaskIndex >= 0) {
    tasks[existingTaskIndex] = task;
  } else {
    tasks.push(task);
  }
  
  localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
};

export const deleteTask = (taskId: string): void => {
  const tasks = getTasks().filter(t => t.id !== taskId);
  localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
};

export const completeTask = (taskId: string): void => {
  const tasks = getTasks();
  const taskIndex = tasks.findIndex(t => t.id === taskId);
  
  if (taskIndex >= 0) {
    tasks[taskIndex].completed = true;
    tasks[taskIndex].completedAt = new Date().toISOString();
    localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
    
    // Update user stats
    const stats = getUserStats();
    stats.tasksCompleted += 1;
    stats.experience += 10; // Add XP for completing a task
    
    // Check and update streak
    updateStreak(stats);
    
    // Check level up
    if (stats.experience >= stats.experienceToNextLevel) {
      stats.level += 1;
      stats.experience -= stats.experienceToNextLevel;
      stats.experienceToNextLevel = Math.floor(stats.experienceToNextLevel * 1.5);
    }
    
    // Update achievements
    updateAchievements(stats, tasks);
    
    saveUserStats(stats);
  }
};

// User stats functions
export const getUserStats = (): UserStats => {
  const stats = localStorage.getItem(USER_STATS_KEY);
  return stats ? JSON.parse(stats) : defaultStats;
};

export const saveUserStats = (stats: UserStats): void => {
  localStorage.setItem(USER_STATS_KEY, JSON.stringify(stats));
};

// User preferences functions
export const getUserPreferences = (): UserPreferences => {
  const prefs = localStorage.getItem(USER_PREFS_KEY);
  return prefs ? JSON.parse(prefs) : defaultPreferences;
};

export const saveUserPreferences = (prefs: UserPreferences): void => {
  localStorage.setItem(USER_PREFS_KEY, JSON.stringify(prefs));
};

// Helper to update streak
const updateStreak = (stats: UserStats): void => {
  const today = new Date().toDateString();
  const lastCompleted = stats.streak.lastCompleted ? new Date(stats.streak.lastCompleted).toDateString() : null;
  
  if (!lastCompleted) {
    // First completed task ever
    stats.streak.current = 1;
    stats.streak.longest = 1;
    stats.streak.lastCompleted = new Date().toISOString();
  } else if (lastCompleted === today) {
    // Already completed a task today, streak doesn't change
  } else {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayString = yesterday.toDateString();
    
    if (lastCompleted === yesterdayString) {
      // Completed a task yesterday, streak continues
      stats.streak.current += 1;
      if (stats.streak.current > stats.streak.longest) {
        stats.streak.longest = stats.streak.current;
      }
    } else {
      // Streak broken
      stats.streak.current = 1;
    }
    
    stats.streak.lastCompleted = new Date().toISOString();
  }
};

// Helper to update achievements
const updateAchievements = (stats: UserStats, tasks: Task[]): void => {
  // Update streak achievements
  updateAchievementProgress(stats, 'streak_3', stats.streak.current);
  updateAchievementProgress(stats, 'streak_7', stats.streak.current);
  updateAchievementProgress(stats, 'streak_30', stats.streak.current);
  
  // Update task count achievements
  updateAchievementProgress(stats, 'tasks_10', stats.tasksCompleted);
  updateAchievementProgress(stats, 'tasks_50', stats.tasksCompleted);
  updateAchievementProgress(stats, 'tasks_100', stats.tasksCompleted);
  
  // Update all categories achievement
  const uniqueCategories = new Set(tasks.filter(t => t.completed).map(t => t.category));
  updateAchievementProgress(stats, 'all_category', uniqueCategories.size);
  
  // Subtask achievement is updated when subtasks are completed
};

// Helper to update a single achievement's progress
const updateAchievementProgress = (stats: UserStats, achievementId: AchievementType, progress: number): void => {
  const achievement = stats.achievements.find(a => a.id === achievementId);
  
  if (achievement) {
    // Only update if not already unlocked
    if (!achievement.unlockedAt) {
      achievement.progress = progress;
      
      // Check if achievement completed
      if (achievement.progress >= achievement.target) {
        achievement.progress = achievement.target; // Cap at target
        achievement.unlockedAt = new Date().toISOString();
        
        // Add experience for unlocking an achievement
        stats.experience += 25;
      }
    }
  }
};

// Focus time tracking
export const addFocusTime = (minutes: number): void => {
  const stats = getUserStats();
  stats.focusTime += minutes;
  
  // Update focus master achievement
  updateAchievementProgress(stats, 'focus_master', stats.focusTime);
  
  saveUserStats(stats);
};

// Helper to generate a unique ID
export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
};
