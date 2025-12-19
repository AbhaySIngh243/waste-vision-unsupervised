import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  subtitle?: string;
}

export const StatCard = ({ icon: Icon, label, value, subtitle }: StatCardProps) => {
  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-card hover:shadow-elevated transition-shadow">
      <div className="flex items-start justify-between">
        <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center">
          <Icon className="w-6 h-6 text-primary-foreground" />
        </div>
      </div>
      <div className="mt-4">
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="text-3xl font-bold text-foreground mt-1">{value}</p>
        {subtitle && (
          <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
        )}
      </div>
    </div>
  );
};
