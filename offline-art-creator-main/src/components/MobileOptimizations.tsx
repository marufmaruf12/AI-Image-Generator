import { useEffect } from 'react';
import { toast } from 'sonner';

export const MobileOptimizations = () => {
  useEffect(() => {
    // Detect if running in Capacitor (mobile app)
    const isCapacitor = window.location.protocol === 'capacitor:';
    
    if (isCapacitor) {
      // Mobile-specific optimizations
      (document.body.style as any).webkitUserSelect = 'none';
      (document.body.style as any).webkitTouchCallout = 'none';
      
      // Prevent zoom on iOS
      const viewport = document.querySelector('meta[name="viewport"]');
      if (viewport) {
        viewport.setAttribute('content', 
          'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no'
        );
      }
      
      // Show welcome message for mobile app
      setTimeout(() => {
        toast.success('AI Image Generator loaded successfully!', {
          description: 'Generate stunning images completely offline'
        });
      }, 1000);
    }
  }, []);

  return null;
};