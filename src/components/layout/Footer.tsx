import { Recycle } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="border-t border-border bg-card/50 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Recycle className="w-4 h-4 text-primary" />
            <span>WasteVision Dashboard</span>
          </div>
          <p className="text-xs text-muted-foreground">
            ML-Powered Analysis
          </p>
        </div>
      </div>
    </footer>
  );
};
