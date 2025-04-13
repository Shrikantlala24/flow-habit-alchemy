
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Plus, Brain, X, Trophy } from 'lucide-react';
import Navbar from '@/components/Navbar';
import TaskForm from '@/components/TaskForm';
import TaskList from '@/components/TaskList';
import AchievementPanel from '@/components/AchievementPanel';
import FocusTimer from '@/components/FocusTimer';
import { Task, UserStats } from '@/types';
import { getUserStats, getTasks, completeTask } from '@/utils/storage';

const Index = () => {
  const { toast } = useToast();
  const [userStats, setUserStats] = useState<UserStats>(getUserStats());
  const [showFocusTimer, setShowFocusTimer] = useState(false);
  const [focusTask, setFocusTask] = useState<Task | undefined>(undefined);
  const [showAchievements, setShowAchievements] = useState(false);
  
  // Update user stats
  const refreshStats = () => {
    setUserStats(getUserStats());
  };
  
  // Check for new achievements
  useEffect(() => {
    const checkNewAchievements = () => {
      const currentStats = getUserStats();
      
      // Look for newly unlocked achievements (within last 10 seconds)
      const tenSecondsAgo = new Date();
      tenSecondsAgo.setSeconds(tenSecondsAgo.getSeconds() - 10);
      
      const newAchievements = currentStats.achievements.filter(achievement => {
        if (!achievement.unlockedAt) return false;
        const unlockDate = new Date(achievement.unlockedAt);
        return unlockDate > tenSecondsAgo;
      });
      
      // Show toast for new achievements
      newAchievements.forEach(achievement => {
        toast({
          title: "Achievement Unlocked!",
          description: `${achievement.icon} ${achievement.title}: ${achievement.description}`,
        });
      });
    };
    
    // Check on initial load
    checkNewAchievements();
    
    // Set up interval to check for new achievements
    const interval = setInterval(checkNewAchievements, 5000);
    
    return () => clearInterval(interval);
  }, [toast]);
  
  // Handle starting focus mode
  const handleStartFocus = (task: Task) => {
    setFocusTask(task);
    setShowFocusTimer(true);
  };
  
  // Handle completing a task
  const handleCompleteTask = (taskId: string) => {
    completeTask(taskId);
    refreshStats();
    
    toast({
      title: "Task completed!",
      description: "Great job on completing your task!",
    });
  };
  
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Main Content */}
          <div className="w-full md:w-2/3">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold">Task Manager</h1>
              
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm" 
                  onClick={() => setShowFocusTimer(true)}
                  className="gap-1"
                >
                  <Brain size={16} />
                  Focus Mode
                </Button>
                <TaskForm onSave={refreshStats} />
              </div>
            </div>
            
            <TaskList 
              onStartFocus={handleStartFocus}
              onRefreshStats={refreshStats}
            />
          </div>
          
          {/* Sidebar - Achievement Panel (desktop) */}
          <div className="hidden md:block w-1/3 bg-card rounded-lg border p-4">
            <AchievementPanel userStats={userStats} />
          </div>
          
          {/* Mobile Achievement Panel Toggle */}
          <div className="md:hidden fixed bottom-4 right-4 z-10">
            <Button 
              onClick={() => setShowAchievements(!showAchievements)}
              className="rounded-full h-14 w-14 shadow-lg"
            >
              {showAchievements ? <X size={24} /> : <Trophy size={24} />}
            </Button>
          </div>
          
          {/* Mobile Achievement Panel */}
          {showAchievements && (
            <div className="md:hidden fixed inset-0 z-50 bg-background/95 p-4 overflow-auto animate-scale-in">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Achievements</h2>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => setShowAchievements(false)}
                >
                  <X size={20} />
                </Button>
              </div>
              <AchievementPanel userStats={userStats} />
            </div>
          )}
        </div>
        
        {/* Focus Timer Modal */}
        {showFocusTimer && (
          <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="max-w-md w-full">
              <FocusTimer 
                task={focusTask} 
                onClose={() => {
                  setShowFocusTimer(false);
                  setFocusTask(undefined);
                  refreshStats();
                }}
                onComplete={handleCompleteTask}
              />
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;
