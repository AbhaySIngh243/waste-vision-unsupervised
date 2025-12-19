import { ImageIcon, ZoomIn, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ResultImageContainerProps {
  imageUrl?: string | null;
  onDownload?: () => void;
}

export const ResultImageContainer = ({ imageUrl, onDownload }: ResultImageContainerProps) => {
  const handleDownload = () => {
    if (imageUrl && onDownload) {
      onDownload();
    } else if (imageUrl) {
      const link = document.createElement('a');
      link.href = imageUrl;
      link.download = 'segmentation-result.png';
      link.click();
    }
  };

  if (!imageUrl) {
    return (
      <div className="rounded-2xl border-2 border-dashed border-border bg-secondary/30 p-12 flex flex-col items-center justify-center min-h-[400px]">
        <div className="w-20 h-20 rounded-2xl bg-secondary flex items-center justify-center mb-4">
          <ImageIcon className="w-10 h-10 text-muted-foreground" />
        </div>
        <p className="text-muted-foreground text-center">
          {/* TODO: Insert segmented image here */}
          Segmented Image
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-card">
      <div className="relative group">
        <img
          src={imageUrl}
          alt="Segmentation result"
          className="w-full h-auto"
        />
        <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
          <div className="flex gap-2">
            <Button variant="secondary" size="icon" className="rounded-full">
              <ZoomIn className="w-4 h-4" />
            </Button>
            <Button variant="secondary" size="icon" className="rounded-full" onClick={handleDownload}>
              <Download className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
