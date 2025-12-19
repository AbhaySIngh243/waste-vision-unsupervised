import React from 'react';
import { BarChart3, TrendingUp, PieChart, Activity } from 'lucide-react';

export const AnalyticsPlaceholder: React.FC = () => {
  const placeholderCards = [
    { icon: BarChart3, label: 'Waste Categories', value: '--' },
    { icon: TrendingUp, label: 'Detection Rate', value: '--' },
    { icon: PieChart, label: 'Composition', value: '--' },
    { icon: Activity, label: 'Processing Time', value: '--' },
  ];

  return (
    <div className="rounded-xl border border-border bg-card p-6 shadow-card">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-semibold text-foreground">Analytics</h3>
        <span className="text-xs font-medium text-muted-foreground bg-secondary px-2 py-1 rounded-md">
          Coming Soon
        </span>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        {placeholderCards.map(({ icon: Icon, label, value }) => (
          <div
            key={label}
            className="p-4 rounded-lg bg-secondary/50 border border-border/50"
          >
            <Icon className="w-5 h-5 text-muted-foreground mb-2" />
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="text-lg font-semibold text-muted-foreground/50">{value}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
