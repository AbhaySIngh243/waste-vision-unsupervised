import React from 'react';
import { Loader2 } from 'lucide-react';

export const LoadingSpinner: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center py-16 animate-fade-in">
      <div className="relative">
        <div className="w-20 h-20 rounded-full border-4 border-secondary" />
        <div className="absolute inset-0 w-20 h-20 rounded-full border-4 border-primary border-t-transparent animate-spin" />
        <div className="absolute inset-2 w-16 h-16 rounded-full border-4 border-primary/30 border-b-transparent animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
      </div>
      <p className="mt-6 font-semibold text-foreground">Analyzing waste...</p>
      <p className="text-sm text-muted-foreground mt-1 animate-pulse-soft">
        Processing with ML segmentation
      </p>
    </div>
  );
};
