import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Layout } from '@/components/layout/Layout';
import { UploadCard } from '@/components/UploadCard';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { ErrorMessage } from '@/components/ErrorMessage';

const API_BASE_URL = 'http://127.0.0.1:5000';

const Upload = () => {
  const navigate = useNavigate();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = useCallback((file: File) => {
    setSelectedFile(file);
    setError(null);
  }, []);

  const handleClear = useCallback(() => {
    setSelectedFile(null);
    setError(null);
  }, []);

  const handleAnalyze = async () => {
    if (!selectedFile) return;

    setIsLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      // TODO: Insert API call here
      const response = await fetch(`${API_BASE_URL}/predict`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const data = await response.json();

      // TODO: Insert API result here
      if (data.overlay_url) {
        const getUrl = (path: string) => path.startsWith('http') ? path : `${API_BASE_URL}${path}`;

        const resultState = {
          resultUrl: getUrl(data.overlay_url),
          fileName: selectedFile.name,
          analytics: {
            legendUrl: getUrl(data.legend_url),
            distributionUrl: getUrl(data.distribution_url),
            pieUrl: getUrl(data.pie_url),
            silhouetteUrl: getUrl(data.silhouette_url),
            pcaUrl: getUrl(data.pca_url),
            tsneUrl: getUrl(data.tsne_url),
            heatmapUrl: getUrl(data.heatmap_url),
            elbowUrl: getUrl(data.elbow_url),
            metricsUrl: getUrl(data.metrics_url),
            metricsText: data.metrics_text,
            clusterStats: data.cluster_stats
          }
        };
        navigate('/results', { state: resultState });
      } else {
        throw new Error('Invalid response');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent mb-4">
            Smart Waste Sorting & Recycling Network
          </h1>
          <p className="text-lg text-muted-foreground">
            Using <span className="text-foreground font-medium">Unsupervised Image Segmentation</span>
          </p>
        </div>

        <div className="space-y-6">
          <UploadCard
            onFileSelect={handleFileSelect}
            selectedFile={selectedFile}
            onClear={handleClear}
            disabled={isLoading}
          />

          {error && (
            <ErrorMessage message={error} onRetry={handleAnalyze} />
          )}

          {isLoading ? (
            <div className="rounded-2xl border border-border bg-card p-12 shadow-card">
              <LoadingSpinner />
            </div>
          ) : (
            <Button
              variant="gradient"
              size="lg"
              className="w-full gap-2"
              onClick={handleAnalyze}
              disabled={!selectedFile}
            >
              <Sparkles className="w-5 h-5" />
              Run Segmentation
            </Button>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Upload;
