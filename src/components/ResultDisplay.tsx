import React from 'react';
import { CheckCircle2, Download, ZoomIn } from 'lucide-react';
import { Button } from './ui/button';

interface ResultDisplayProps {
  imageUrl: string;
}

export const ResultDisplay: React.FC<ResultDisplayProps> = ({ imageUrl }) => {
  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = 'segmentation-result.png';
    link.click();
  };

  return (
    <div className="animate-slide-up">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center">
          <CheckCircle2 className="w-4 h-4 text-primary-foreground" />
        </div>
        <h3 className="font-semibold text-foreground">Segmentation Complete</h3>
      </div>
      
      <div className="relative group rounded-xl overflow-hidden shadow-elevated bg-card">
        <img
          src={imageUrl}
          alt="Segmentation Result"
          className="w-full h-auto"
        />
        <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/5 transition-colors duration-300 flex items-center justify-center">
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex gap-2">
            <Button
              size="sm"
              variant="secondary"
              className="shadow-elevated"
              onClick={() => window.open(imageUrl, '_blank')}
            >
              <ZoomIn className="w-4 h-4 mr-1" />
              View Full
            </Button>
            <Button
              size="sm"
              variant="secondary"
              className="shadow-elevated"
              onClick={handleDownload}
            >
              <Download className="w-4 h-4 mr-1" />
              Download
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
