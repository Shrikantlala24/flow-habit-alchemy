
import React from 'react';
import { Bell, User, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getUserStats } from '@/utils/storage';

const Navbar: React.FC = () => {
  const stats = getUserStats();
  
  return (
    <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b border-border">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="text-2xl font-bold bg-gradient-to-r from-purple-light to-primary bg-clip-text text-transparent">
            FlowHabit
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-secondary rounded-full">
            <div className="text-sm font-medium">Level {stats.level}</div>
            <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary rounded-full" 
                style={{ 
                  width: `${(stats.experience / stats.experienceToNextLevel) * 100}%` 
                }}
              />
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="relative">
              <Bell size={20} />
              <span className="absolute top-0 right-0 w-2 h-2 bg-destructive rounded-full"></span>
            </Button>
            
            <Button variant="ghost" size="icon">
              <Settings size={20} />
            </Button>
            
            <Button variant="outline" size="icon" className="rounded-full">
              <User size={20} />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
