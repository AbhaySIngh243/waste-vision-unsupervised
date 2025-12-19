import { LucideIcon } from 'lucide-react';

interface ChartCardProps {
  title: string;
  icon: LucideIcon;
  children?: React.ReactNode;
}

export const ChartCard = ({ title, icon: Icon, children }: ChartCardProps) => {
  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <Icon className="w-5 h-5 text-primary" />
        </div>
        <h3 className="font-semibold text-foreground">{title}</h3>
      </div>
      
      {children ? (
        children
      ) : (
        <div className="h-48 rounded-xl bg-secondary/50 border border-border/50 flex items-center justify-center">
          <p className="text-sm text-muted-foreground">
            {/* TODO: Insert chart data here */}
            Chart Placeholder
          </p>
        </div>
      )}
    </div>
  );
};
