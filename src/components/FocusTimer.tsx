
import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useToast } from '@/components/ui/use-toast';
import { Play, Pause, SkipForward, Clock, Check } from 'lucide-react';
import { Task } from '@/types';
import { addFocusTime, getUserPreferences } from '@/utils/storage';

interface FocusTimerProps {
  task?: Task;
  onClose: () => void;
  onComplete?: (taskId: string) => void;
}

enum TimerState {
  Ready,
  Running,
  Paused,
  Break,
  Completed,
}

const FocusTimer: React.FC<FocusTimerProps> = ({ task, onClose, onComplete }) => {
  const { toast } = useToast();
  const preferences = getUserPreferences();
  
  const [timerState, setTimerState] = useState<TimerState>(TimerState.Ready);
  const [timeRemaining, setTimeRemaining] = useState(preferences.focusDuration * 60);
  const [breakTimeRemaining, setBreakTimeRemaining] = useState(preferences.breakDuration * 60);
  const [totalTimeElapsed, setTotalTimeElapsed] = useState(0);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [timerCompleted, setTimerCompleted] = useState(false);
  
  // Handle timer logic
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    
    if (timerState === TimerState.Running) {
      interval = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            clearInterval(interval);
            setTimerState(TimerState.Break);
            return 0;
          }
          return prev - 1;
        });
        setTotalTimeElapsed(prev => prev + 1);
      }, 1000);
    } else if (timerState === TimerState.Break) {
      interval = setInterval(() => {
        setBreakTimeRemaining(prev => {
          if (prev <= 1) {
            clearInterval(interval);
            setTimerState(TimerState.Completed);
            setTimerCompleted(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    
    return () => clearInterval(interval);
  }, [timerState]);

  // Format time as MM:SS
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Get progress percentage
  const getProgress = (): number => {
    if (timerState === TimerState.Break) {
      return ((preferences.breakDuration * 60 - breakTimeRemaining) / (preferences.breakDuration * 60)) * 100;
    }
    return ((preferences.focusDuration * 60 - timeRemaining) / (preferences.focusDuration * 60)) * 100;
  };
  
  // Handle starting the timer
  const handleStart = () => {
    setTimerState(TimerState.Running);
    toast({
      title: "Focus session started",
      description: task ? `Focusing on: ${task.title}` : "Stay focused!",
    });
  };
  
  // Handle pausing the timer
  const handlePause = () => {
    setTimerState(TimerState.Paused);
  };
  
  // Handle resuming the timer
  const handleResume = () => {
    setTimerState(TimerState.Running);
  };
  
  // Handle skipping to break
  const handleSkipToBreak = () => {
    setTimeRemaining(0);
    setTimerState(TimerState.Break);
  };
  
  // Handle skipping break
  const handleSkipBreak = () => {
    setBreakTimeRemaining(0);
    setTimerState(TimerState.Completed);
    setTimerCompleted(true);
  };
  
  // Handle starting a new focus session
  const handleNewSession = () => {
    setTimeRemaining(preferences.focusDuration * 60);
    setBreakTimeRemaining(preferences.breakDuration * 60);
    setTimerState(TimerState.Ready);
    setTimerCompleted(false);
  };
  
  // Handle completing the session
  const handleComplete = useCallback(() => {
    if (timerCompleted) {
      const focusMinutes = Math.floor(totalTimeElapsed / 60);
      if (focusMinutes > 0) {
        addFocusTime(focusMinutes);
      }
      
      // If there's a task, mark it as complete if requested
      if (task && onComplete) {
        onComplete(task.id);
      }
      
      toast({
        title: "Focus session completed",
        description: `Great job! You stayed focused for ${focusMinutes} minutes.`,
      });
      
      onClose();
    } else {
      setShowExitConfirm(true);
    }
  }, [timerCompleted, totalTimeElapsed, task, onComplete, toast, onClose]);
  
  // Get appropriate UI based on timer state
  const renderTimerControls = () => {
    switch (timerState) {
      case TimerState.Ready:
        return (
          <Button 
            onClick={handleStart}
            className="w-full py-6 text-lg mt-4 focus-timer-button"
          >
            <Play className="mr-2" size={24} /> Start Focusing
          </Button>
        );
        
      case TimerState.Running:
        return (
          <div className="flex flex-col gap-3 mt-4">
            <Button 
              onClick={handlePause}
              variant="outline"
              className="py-6 text-lg"
            >
              <Pause className="mr-2" size={20} /> Pause
            </Button>
            <Button 
              onClick={handleSkipToBreak}
              variant="ghost"
              className="text-sm"
            >
              <SkipForward className="mr-1" size={16} /> Skip to Break
            </Button>
          </div>
        );
        
      case TimerState.Paused:
        return (
          <div className="flex flex-col gap-3 mt-4">
            <Button 
              onClick={handleResume}
              className="py-6 text-lg focus-timer-button"
            >
              <Play className="mr-2" size={20} /> Resume
            </Button>
            <Button 
              onClick={handleSkipToBreak}
              variant="ghost"
              className="text-sm"
            >
              <SkipForward className="mr-1" size={16} /> Skip to Break
            </Button>
          </div>
        );
        
      case TimerState.Break:
        return (
          <div className="flex flex-col gap-3 mt-4">
            <Button 
              onClick={handleSkipBreak}
              variant="outline"
              className="py-6 text-lg"
            >
              <SkipForward className="mr-2" size={16} /> Skip Break
            </Button>
          </div>
        );
        
      case TimerState.Completed:
        return (
          <div className="flex flex-col gap-3 mt-4">
            <Button 
              onClick={handleNewSession}
              className="py-6 text-lg focus-timer-button"
            >
              <Clock className="mr-2" size={20} /> New Focus Session
            </Button>
            <Button 
              onClick={handleComplete}
              variant="outline"
              className="py-3"
            >
              <Check className="mr-2" size={16} /> Complete & Exit
            </Button>
          </div>
        );
    }
  };
  
  // Get title based on timer state
  const getTimerTitle = () => {
    switch (timerState) {
      case TimerState.Ready:
        return "Ready to Focus";
      case TimerState.Running:
        return "Stay Focused";
      case TimerState.Paused:
        return "Focus Paused";
      case TimerState.Break:
        return "Take a Break";
      case TimerState.Completed:
        return "Focus Complete!";
    }
  };
  
  return (
    <>
      <Card className="shadow-lg animate-scale-in">
        <CardContent className="pt-6 px-6 pb-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">{getTimerTitle()}</h2>
            
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => {
                if (timerState === TimerState.Running || timerState === TimerState.Paused) {
                  setShowExitConfirm(true);
                } else {
                  handleComplete();
                }
              }}
            >
              {timerState === TimerState.Completed ? "Exit" : "Cancel"}
            </Button>
          </div>
          
          {task && (
            <div className="bg-muted p-3 rounded-md mb-4">
              <h3 className="font-medium">Current Task:</h3>
              <p className="mt-1 text-sm">{task.title}</p>
              {task.description && (
                <p className="mt-1 text-xs text-muted-foreground">{task.description}</p>
              )}
            </div>
          )}
          
          <div className="flex flex-col items-center">
            <div className="w-full mb-4">
              <Progress value={getProgress()} className="h-3" />
            </div>
            
            <div className="text-4xl font-mono font-bold mb-2">
              {timerState === TimerState.Break 
                ? formatTime(breakTimeRemaining) 
                : formatTime(timeRemaining)}
            </div>
            
            <div className="text-sm text-muted-foreground mb-4">
              {timerState === TimerState.Break 
                ? "Break time remaining" 
                : timerState === TimerState.Completed 
                  ? `You focused for ${Math.floor(totalTimeElapsed / 60)} min ${totalTimeElapsed % 60} sec`
                  : "Focus time remaining"}
            </div>
            
            {renderTimerControls()}
          </div>
        </CardContent>
      </Card>
      
      <AlertDialog open={showExitConfirm} onOpenChange={setShowExitConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Exit focus session?</AlertDialogTitle>
            <AlertDialogDescription>
              Your current focus session progress will be lost. Do you want to continue?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Continue focusing</AlertDialogCancel>
            <AlertDialogAction onClick={() => {
              setShowExitConfirm(false);
              onClose();
            }}>
              Exit Session
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default FocusTimer;
