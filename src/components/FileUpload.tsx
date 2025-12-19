import React, { useCallback, useState } from 'react';
import { Upload, Image as ImageIcon, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  selectedFile: File | null;
  onClear: () => void;
  disabled?: boolean;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  onFileSelect,
  selectedFile,
  onClear,
  disabled = false,
}) => {
  const [isDragActive, setIsDragActive] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  const handleFile = useCallback((file: File) => {
    if (file && file.type.startsWith('image/')) {
      onFileSelect(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  }, [onFileSelect]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);
    if (disabled) return;
    
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile, disabled]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) setIsDragActive(true);
  }, [disabled]);

  const handleDragLeave = useCallback(() => {
    setIsDragActive(false);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPreview(null);
    onClear();
  };

  return (
    <div
      className={cn(
        "relative rounded-xl border-2 border-dashed transition-all duration-300",
        isDragActive 
          ? "border-primary bg-primary/5 scale-[1.02]" 
          : "border-border hover:border-primary/50 hover:bg-secondary/50",
        disabled && "opacity-60 cursor-not-allowed",
        selectedFile ? "p-4" : "p-8"
      )}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
    >
      <input
        type="file"
        accept="image/*"
        onChange={handleInputChange}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
        disabled={disabled}
      />
      
      {selectedFile && preview ? (
        <div className="relative animate-fade-in">
          <button
            onClick={handleClear}
            className="absolute -top-2 -right-2 z-10 p-1.5 rounded-full bg-destructive text-destructive-foreground shadow-elevated hover:scale-110 transition-transform"
            disabled={disabled}
          >
            <X className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-4">
            <div className="relative w-24 h-24 rounded-lg overflow-hidden shadow-card flex-shrink-0">
              <img
                src={preview}
                alt="Preview"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-foreground truncate">
                {selectedFile.name}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
              </p>
              <div className="flex items-center gap-1.5 mt-2 text-sm text-primary">
                <ImageIcon className="w-4 h-4" />
                <span>Ready to analyze</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center text-center">
          <div className={cn(
            "w-16 h-16 rounded-2xl flex items-center justify-center mb-4 transition-all duration-300",
            isDragActive 
              ? "bg-primary text-primary-foreground scale-110" 
              : "bg-secondary text-muted-foreground"
          )}>
            <Upload className="w-8 h-8" />
          </div>
          <p className="font-semibold text-foreground mb-1">
            {isDragActive ? "Drop your image here" : "Upload an image"}
          </p>
          <p className="text-sm text-muted-foreground">
            Drag and drop or click to browse
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            Supports JPG, PNG, WebP
          </p>
        </div>
      )}
    </div>
  );
};
