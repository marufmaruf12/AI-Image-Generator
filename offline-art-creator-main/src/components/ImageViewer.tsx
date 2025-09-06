import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, X } from "lucide-react";
import { GeneratedImage } from "@/services/aiService";
import { toast } from "sonner";

interface ImageViewerProps {
  image: GeneratedImage | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ImageViewer = ({ image, isOpen, onClose }: ImageViewerProps) => {
  if (!image) return null;

  const handleDownload = async () => {
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
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-full p-0 bg-card border-border">
        <DialogHeader className="p-6 pb-0">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-lg font-semibold">Generated Image</DialogTitle>
            <div className="flex items-center space-x-2">
              <Button
                size="sm"
                variant="default"
                onClick={handleDownload}
                className="bg-primary hover:bg-primary/90"
              >
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={onClose}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>
        
        <div className="p-6 pt-4">
          <div className="relative">
            <img 
              src={image.url} 
              alt={image.prompt}
              loading="lazy"
              referrerPolicy="no-referrer"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = `https://picsum.photos/seed/${encodeURIComponent(image.id)}/1024/1024`;
              }}
              className="w-full h-auto rounded-lg shadow-soft"
            />
          </div>
          
          <div className="mt-4 space-y-2">
            <h3 className="font-medium">Prompt:</h3>
            <p className="text-muted-foreground bg-secondary p-3 rounded-lg">
              {image.prompt}
            </p>
            <p className="text-xs text-muted-foreground">
              Generated on {new Date(image.timestamp).toLocaleString()}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};