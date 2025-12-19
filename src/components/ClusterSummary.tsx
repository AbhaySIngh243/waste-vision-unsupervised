import { Layers, Circle } from 'lucide-react';

interface ClusterItem {
  label: string;
  color: string;
  percentage: number;
}

interface ClusterSummaryProps {
  clusters?: ClusterItem[];
}

// Placeholder clusters for demo
const placeholderClusters: ClusterItem[] = [
  { label: 'Plastic', color: 'hsl(175 70% 45%)', percentage: 0 },
  { label: 'Metal', color: 'hsl(200 80% 50%)', percentage: 0 },
  { label: 'Organic', color: 'hsl(140 60% 45%)', percentage: 0 },
  { label: 'Paper', color: 'hsl(45 80% 55%)', percentage: 0 },
  { label: 'Glass', color: 'hsl(220 70% 55%)', percentage: 0 },
];

export const ClusterSummary = ({ clusters = placeholderClusters }: ClusterSummaryProps) => {
  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <Layers className="w-5 h-5 text-primary" />
        </div>
        <h3 className="font-semibold text-foreground">Cluster Summary</h3>
      </div>

      <div className="space-y-4">
        {clusters.map((cluster) => (
          <div key={cluster.label} className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Circle 
                className="w-4 h-4" 
                style={{ color: cluster.color, fill: cluster.color }} 
              />
              <span className="text-sm text-foreground">{cluster.label}</span>
            </div>
            <span className="text-sm font-medium text-muted-foreground">
              {/* TODO: Insert API result here */}
              {cluster.percentage > 0 ? `${cluster.percentage}%` : '--'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
