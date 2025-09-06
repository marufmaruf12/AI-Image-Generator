import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Download, Eye, Maximize2 } from "lucide-react";
import { GeneratedImage } from "@/services/aiService";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface ImageCardProps {
  image: GeneratedImage;
  onView: (image: GeneratedImage) => void;
}

export const ImageCard = ({ image, onView }: ImageCardProps) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleDownload = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(image.url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `ai-generated-${image.id}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success("Image downloaded successfully!");
    } catch (error) {
      console.error('Download failed:', error);
      toast.error("Failed to download image");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="group overflow-hidden bg-card border-border hover:border-primary/50 transition-smooth">
      <div className="relative aspect-square overflow-hidden">
        <img 
          src={image.url} 
          alt={image.prompt}
          loading="lazy"
          referrerPolicy="no-referrer"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).src = `https://picsum.photos/seed/${encodeURIComponent(image.id)}/512/512`;
          }}
          className="w-full h-full object-cover transition-smooth group-hover:scale-105"
        />
        
        {/* Overlay with actions */}
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-smooth flex items-center justify-center space-x-2">
          <Button
            size="sm"
            variant="secondary"
            onClick={() => onView(image)}
            className="shadow-soft"
          >
            <Eye className="w-4 h-4 mr-2" />
            View
          </Button>
          <Button
            size="sm"
            variant="default"
            onClick={handleDownload}
            disabled={isLoading}
            className="shadow-soft bg-primary hover:bg-primary/90"
          >
            <Download className="w-4 h-4 mr-2" />
            {isLoading ? "..." : "Save"}
          </Button>
        </div>
      </div>
      
      <div className="p-4">
        <p className="text-sm text-muted-foreground line-clamp-2">
          {image.prompt}
        </p>
        <p className="text-xs text-muted-foreground mt-2">
          {new Date(image.timestamp).toLocaleTimeString()}
        </p>
      </div>
    </Card>
  );
};