import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, Eye, ImageIcon, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Layout } from '@/components/layout/Layout';
import { LoadingSpinner } from '@/components/LoadingSpinner';

const API_BASE_URL = 'http://127.0.0.1:5000';

interface HistoryItem {
  id: string;
  thumbnail_url: string;
  created_at: string;
  file_name: string;
  overlay_url: string;
  analytics?: {
    legend_url: string;
    distribution_url: string;
    pie_url: string;
    silhouette_url: string;
    pca_url: string;
    tsne_url: string;
    heatmap_url: string;
    elbow_url: string;
    metrics_url: string;
    metrics_text?: string;
    cluster_stats?: any[];
  };
}

const History = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        // TODO: Insert API call here
        const response = await fetch(`${API_BASE_URL}/history`);

        if (!response.ok) {
          throw new Error('Failed to fetch history');
        }

        const data = await response.json();
        // TODO: Insert API result here
        setItems(data.items || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error loading history');
      } finally {
        setIsLoading(false);
      }
    };

    fetchHistory();
  }, []);

  const handleViewResult = (item: HistoryItem) => {
    const getUrl = (path: string) => path.startsWith('http') ? path : `${API_BASE_URL}${path}`;

    navigate('/results', {
      state: {
        resultUrl: getUrl(item.overlay_url),
        fileName: item.file_name,
        analytics: item.analytics ? {
          legendUrl: getUrl(item.analytics.legend_url),
          distributionUrl: getUrl(item.analytics.distribution_url),
          pieUrl: getUrl(item.analytics.pie_url),
          silhouetteUrl: getUrl(item.analytics.silhouette_url),
          pcaUrl: getUrl(item.analytics.pca_url),
          tsneUrl: getUrl(item.analytics.tsne_url),
          heatmapUrl: getUrl(item.analytics.heatmap_url),
          elbowUrl: getUrl(item.analytics.elbow_url),
          metricsUrl: getUrl(item.analytics.metrics_url),
          metricsText: item.analytics.metrics_text,
          clusterStats: item.analytics.cluster_stats
        } : undefined
      }
    });
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this result?')) return;

    try {
      const response = await fetch(`${API_BASE_URL}/delete_history/${id}`, { method: 'DELETE' });
      if (response.ok) {
        setItems(items.filter(item => item.id !== id));
      } else {
        alert('Failed to delete');
      }
    } catch {
      alert('Error deleting item');
    }
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">History</h1>
          <p className="text-muted-foreground mt-1">Previous analyses</p>
        </div>

        {isLoading ? (
          <div className="py-16">
            <LoadingSpinner />
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-border bg-card p-12 text-center">
            <p className="text-muted-foreground">{error}</p>
          </div>
        ) : items.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-border p-16 text-center">
            <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center mx-auto mb-4">
              <ImageIcon className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground">No history yet</p>
            <Button
              variant="gradient"
              className="mt-4"
              onClick={() => navigate('/upload')}
            >
              Start Analysis
            </Button>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {items.map((item) => (
              <div
                key={item.id}
                className="rounded-2xl border border-border bg-card overflow-hidden shadow-card hover:shadow-elevated transition-shadow group"
              >
                <div className="aspect-square bg-secondary/50 relative overflow-hidden">
                  <img
                    src={`${API_BASE_URL}${item.thumbnail_url}`}
                    alt={item.file_name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                </div>
                <div className="p-4">
                  <p className="text-sm font-medium text-foreground truncate">
                    {item.file_name}
                  </p>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                    <Clock className="w-3 h-3" />
                    <span>{new Date(item.created_at).toLocaleDateString()}</span>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 gap-2"
                      onClick={() => handleViewResult(item)}
                    >
                      <Eye className="w-3 h-3" />
                      View
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-10 px-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={(e) => handleDelete(e, item.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default History;
