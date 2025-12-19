import { useLocation, useNavigate, Link } from 'react-router-dom';
import { BarChart3, Save, ArrowLeft, Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Layout } from '@/components/layout/Layout';
import { ResultImageContainer } from '@/components/ResultImageContainer';
import { ClusterSummary } from '@/components/ClusterSummary';
import { SmartInsights } from '@/components/SmartInsights';
import { useToast } from '@/hooks/use-toast';

const API_BASE_URL = 'http://127.0.0.1:5000';

const Results = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();

  const resultUrl = location.state?.resultUrl || null;
  const fileName = location.state?.fileName || 'result';
  const analytics = location.state?.analytics || {};

  const handleSaveResult = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/save_result`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          overlay_url: resultUrl,
          file_name: fileName
        }),
      });

      if (!response.ok) throw new Error('Failed to save');

      toast({
        title: "Saved",
        description: "Result saved successfully",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Could not save result",
        variant: "destructive",
      });
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-8 no-print">
          <div>
            <Button variant="ghost" size="sm" onClick={() => navigate('/upload')} className="mb-2">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <h1 className="text-3xl font-bold text-foreground">Results</h1>
          </div>
          <Button variant="outline" onClick={handlePrint} className="gap-2">
            <Printer className="w-4 h-4" />
            Export Report
          </Button>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Result */}
          <div className="lg:col-span-2">
            <ResultImageContainer imageUrl={resultUrl} />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <ClusterSummary clusters={analytics.clusterStats} />
            <SmartInsights stats={analytics.clusterStats} />

            <div className="space-y-3 no-print">
              <Link to="/analytics" state={analytics} className="block">
                <Button variant="gradient" className="w-full gap-2">
                  <BarChart3 className="w-4 h-4" />
                  View Analytics
                </Button>
              </Link>

              <Button
                variant="outline"
                className="w-full gap-2"
                onClick={handleSaveResult}
                disabled={!resultUrl}
              >
                <Save className="w-4 h-4" />
                Save Result
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Results;
