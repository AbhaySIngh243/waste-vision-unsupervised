import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Target, Images, Layers, Leaf } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { StatCard } from '@/components/StatCard';
import { Layout } from '@/components/layout/Layout';

const Home = () => {
  const [stats, setStats] = useState({ accuracy: '--', images_processed: '--', materials_detected: '--' });

  useEffect(() => {
    fetch('http://127.0.0.1:5000/stats')
      .then(res => res.json())
      .then(data => setStats(data))
      .catch(err => console.error(err));
  }, []);

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 gradient-hero" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl lg:text-6xl font-bold text-foreground mb-4">
              Smart Waste
              <span className="gradient-text block">Segmentation</span>
            </h1>
            <p className="text-lg text-muted-foreground mb-8">
              ML-Powered Analysis
            </p>
            <Link to="/upload">
              <Button variant="gradient" size="lg" className="gap-2 text-base">
                Start Analysis
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <StatCard
            icon={Leaf}
            label="Carbon Reduced"
            value={stats.accuracy}
            subtitle="Total impact"
          />
          <StatCard
            icon={Images}
            label="Images Processed"
            value={stats.images_processed.toString()}
            subtitle="Total analyses"
          />
          <StatCard
            icon={Layers}
            label="Materials Detected"
            value={stats.materials_detected.toString()}
            subtitle="Unique categories"
          />
        </div>
      </section>
    </Layout>
  );
};

export default Home;
