
import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { Flame, Award, Trophy } from 'lucide-react';
import { UserStats, Achievement } from '@/types';

interface AchievementPanelProps {
  userStats: UserStats;
}

const AchievementPanel: React.FC<AchievementPanelProps> = ({ userStats }) => {
  // Helper to get recently unlocked achievements (within last 24 hours)
  const getRecentAchievements = () => {
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);
    
    return userStats.achievements.filter(achievement => {
      if (!achievement.unlockedAt) return false;
      const unlockDate = new Date(achievement.unlockedAt);
      return unlockDate > oneDayAgo;
    });
  };
  
  const recentAchievements = getRecentAchievements();
  const inProgressAchievements = userStats.achievements
    .filter(a => !a.unlockedAt && a.progress > 0)
    .sort((a, b) => (b.progress / b.target) - (a.progress / a.target));
  
  const lockedAchievements = userStats.achievements
    .filter(a => !a.unlockedAt && a.progress === 0);
  
  const unlockedAchievements = userStats.achievements
    .filter(a => a.unlockedAt)
    .sort((a, b) => {
      if (!a.unlockedAt || !b.unlockedAt) return 0;
      return new Date(b.unlockedAt).getTime() - new Date(a.unlockedAt).getTime();
    });

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Stats & Achievements</h2>
        <div className="text-sm text-muted-foreground">
          Level {userStats.level}
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-card p-3 rounded-lg border">
          <div className="flex items-center mb-1">
            <Flame className="mr-2 text-primary" size={18} />
            <h3 className="text-sm font-medium">Current Streak</h3>
          </div>
          <div className="text-2xl font-bold">{userStats.streak.current} days</div>
          <div className="text-xs text-muted-foreground">
            Best: {userStats.streak.longest} days
          </div>
        </div>
        
        <div className="bg-card p-3 rounded-lg border">
          <div className="flex items-center mb-1">
            <Trophy className="mr-2 text-warning-DEFAULT" size={18} />
            <h3 className="text-sm font-medium">Tasks Completed</h3>
          </div>
          <div className="text-2xl font-bold">{userStats.tasksCompleted}</div>
          <div className="text-xs text-muted-foreground">
            {userStats.achievements.filter(a => a.unlockedAt).length} achievements
          </div>
        </div>
      </div>
      
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium">Experience Progress</h3>
          <div className="text-xs text-muted-foreground">
            {userStats.experience}/{userStats.experienceToNextLevel} XP
          </div>
        </div>
        <Progress 
          value={(userStats.experience / userStats.experienceToNextLevel) * 100} 
          className="h-2" 
        />
      </div>
      
      {recentAchievements.length > 0 && (
        <div className="mb-4">
          <h3 className="text-sm font-medium mb-2">Recently Unlocked</h3>
          <div className="grid grid-cols-2 gap-2">
            {recentAchievements.map(achievement => (
              <AchievementCard 
                key={achievement.id} 
                achievement={achievement} 
                isRecent 
              />
            ))}
          </div>
        </div>
      )}
      
      <h3 className="text-sm font-medium mb-2">In Progress</h3>
      
      <ScrollArea className="flex-1">
        <div className="space-y-2 pr-4">
          {inProgressAchievements.map(achievement => (
            <AchievementCard 
              key={achievement.id} 
              achievement={achievement} 
              showProgress 
            />
          ))}
          
          {inProgressAchievements.length === 0 && (
            <div className="text-center py-4 text-muted-foreground text-sm">
              No achievements in progress yet.
            </div>
          )}
        </div>
        
        <h3 className="text-sm font-medium mt-4 mb-2">Completed</h3>
        <div className="grid grid-cols-2 gap-2 pr-4">
          {unlockedAchievements.filter(a => !recentAchievements.includes(a))
            .map(achievement => (
              <AchievementCard 
                key={achievement.id} 
                achievement={achievement} 
                compact 
              />
            ))}
          
          {unlockedAchievements.length === 0 && (
            <div className="text-center py-4 text-muted-foreground text-sm col-span-2">
              No achievements completed yet.
            </div>
          )}
        </div>
        
        <h3 className="text-sm font-medium mt-4 mb-2">Locked</h3>
        <div className="grid grid-cols-2 gap-2 pr-4 mb-4">
          {lockedAchievements.map(achievement => (
            <AchievementCard 
              key={achievement.id} 
              achievement={achievement} 
              locked 
              compact 
            />
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};

interface AchievementCardProps {
  achievement: Achievement;
  showProgress?: boolean;
  isRecent?: boolean;
  locked?: boolean;
  compact?: boolean;
}

const AchievementCard: React.FC<AchievementCardProps> = ({ 
  achievement, 
  showProgress = false, 
  isRecent = false,
  locked = false,
  compact = false
}) => {
  const progressPercentage = achievement.progress / achievement.target * 100;
  
  if (compact) {
    return (
      <div className={`p-2 rounded-lg border ${locked ? 'bg-muted/50' : 'bg-card'} ${isRecent ? 'animate-pulse-subtle border-primary' : ''}`}>
        <div className="flex items-center">
          <div className="flex-shrink-0 mr-2 text-lg" aria-hidden="true">
            {achievement.icon}
          </div>
          <div className="min-w-0">
            <h4 className={`text-xs font-medium truncate ${locked ? 'text-muted-foreground' : ''}`}>
              {achievement.title}
            </h4>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className={`p-3 rounded-lg border ${locked ? 'bg-muted/50' : 'bg-card'} ${isRecent ? 'animate-pulse-subtle border-primary' : ''}`}>
      <div className="flex items-start">
        <div className={`flex-shrink-0 mr-3 text-xl ${isRecent ? 'animate-float' : ''}`} aria-hidden="true">
          {achievement.icon}
        </div>
        <div className="min-w-0">
          <h4 className={`text-sm font-medium ${locked ? 'text-muted-foreground' : ''}`}>
            {achievement.title}
          </h4>
          <p className="text-xs text-muted-foreground truncate">
            {achievement.description}
          </p>
          
          {showProgress && (
            <div className="mt-2">
              <div className="flex items-center justify-between text-xs">
                <span>{achievement.progress}/{achievement.target}</span>
                <span>{Math.round(progressPercentage)}%</span>
              </div>
              <div className="progress-bar mt-1">
                <div 
                  className="progress-value" 
                  style={{width: `${progressPercentage}%`}}
                />
              </div>
            </div>
          )}
          
          {isRecent && !showProgress && (
            <div className="mt-1">
              <span className="inline-block text-xs bg-primary/20 text-primary font-medium rounded-full px-2 py-0.5">
                Unlocked!
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AchievementPanel;
