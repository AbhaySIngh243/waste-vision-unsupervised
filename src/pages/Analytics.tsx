import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, PieChart, BarChart3, Activity, ScatterChart, Grid } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Layout } from '@/components/layout/Layout';
import { ChartCard } from '@/components/ChartCard';

const Analytics = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const analytics = location.state || {};

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="mb-2">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <h1 className="text-3xl font-bold text-foreground">Analytics</h1>
          <p className="text-muted-foreground mt-1">Performance metrics and Visualizations</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Pie Chart */}
          <ChartCard title="Cluster Distribution (%)" icon={PieChart}>
            {analytics.pieUrl ? (
                <img src={analytics.pieUrl} alt="Cluster Distribution Pie Chart" className="w-full h-auto rounded-xl shadow-sm" />
            ) : (
                <div className="h-64 rounded-xl bg-secondary/50 border border-border/50 flex items-center justify-center">
                  <div className="text-center">
                    <PieChart className="w-12 h-12 text-muted-foreground/50 mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">No Pie Chart Available</p>
                  </div>
                </div>
            )}
          </ChartCard>

          {/* Bar Chart */}
          <ChartCard title="Cluster Counts" icon={BarChart3}>
             {analytics.distributionUrl ? (
                <img src={analytics.distributionUrl} alt="Cluster Counts Bar Chart" className="w-full h-auto rounded-xl shadow-sm" />
            ) : (
                <div className="h-64 rounded-xl bg-secondary/50 border border-border/50 flex items-center justify-center">
                  <div className="text-center">
                    <BarChart3 className="w-12 h-12 text-muted-foreground/50 mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">No Distribution Chart Available</p>
                  </div>
                </div>
            )}
          </ChartCard>

          {/* Silhouette Analysis */}
          <ChartCard title="Silhouette Analysis" icon={Activity}>
             {analytics.silhouetteUrl ? (
                <img src={analytics.silhouetteUrl} alt="Silhouette Analysis" className="w-full h-auto rounded-xl shadow-sm" />
            ) : (
                <div className="h-64 rounded-xl bg-secondary/50 border border-border/50 flex items-center justify-center">
                  <div className="text-center">
                    <Activity className="w-12 h-12 text-muted-foreground/50 mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">No Silhouette Analysis Available</p>
                  </div>
                </div>
            )}
          </ChartCard>

          {/* Heatmap */}
           <ChartCard title="Cluster Heatmap" icon={Grid}>
             {analytics.heatmapUrl ? (
                <img src={analytics.heatmapUrl} alt="Cluster Heatmap" className="w-full h-auto rounded-xl shadow-sm" />
            ) : (
                <div className="h-64 rounded-xl bg-secondary/50 border border-border/50 flex items-center justify-center">
                  <div className="text-center">
                    <Grid className="w-12 h-12 text-muted-foreground/50 mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">No Heatmap Available</p>
                  </div>
                </div>
            )}
          </ChartCard>
          
           {/* PCA */}
           <ChartCard title="PCA Visualization" icon={ScatterChart}>
             {analytics.pcaUrl ? (
                <img src={analytics.pcaUrl} alt="PCA Visualization" className="w-full h-auto rounded-xl shadow-sm" />
            ) : (
                <div className="h-64 rounded-xl bg-secondary/50 border border-border/50 flex items-center justify-center">
                  <div className="text-center">
                    <ScatterChart className="w-12 h-12 text-muted-foreground/50 mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">No PCA Available</p>
                  </div>
                </div>
            )}
          </ChartCard>

           {/* t-SNE */}
           <ChartCard title="t-SNE Visualization" icon={ScatterChart}>
             {analytics.tsneUrl ? (
                <img src={analytics.tsneUrl} alt="t-SNE Visualization" className="w-full h-auto rounded-xl shadow-sm" />
            ) : (
                <div className="h-64 rounded-xl bg-secondary/50 border border-border/50 flex items-center justify-center">
                  <div className="text-center">
                    <ScatterChart className="w-12 h-12 text-muted-foreground/50 mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">No t-SNE Available</p>
                  </div>
                </div>
            )}
          </ChartCard>

        </div>
      </div>
    </Layout>
  );
};

export default Analytics;
