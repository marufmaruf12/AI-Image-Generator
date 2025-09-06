import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Wand2, Sparkles, Settings, Brain, Image as ImageIcon, Youtube, RectangleHorizontal, RectangleVertical, Square } from "lucide-react";
import { aiService, GeneratedImage } from "@/services/aiService";
import { RunwareService } from "@/services/runwareService";
import { GoogleAIService } from "@/services/googleAIService";
import { ProgressIndicator } from "./ProgressIndicator";
import { ImageCard } from "./ImageCard";
import { ImageViewer } from "./ImageViewer";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ImageSize {
  name: string;
  width: number;
  height: number;
  description: string;
}

const imageSizes: ImageSize[] = [
  { name: "Square", width: 1024, height: 1024, description: "Perfect for social media posts" },
  { name: "YouTube Thumbnail", width: 1280, height: 720, description: "16:9 aspect ratio" },
  { name: "TikTok Video", width: 1080, height: 1920, description: "9:16 vertical format" },
  { name: "Instagram Story", width: 1080, height: 1920, description: "9:16 vertical format" },
  { name: "Facebook Post", width: 1200, height: 630, description: "Recommended social media size" },
  { name: "Twitter Header", width: 1500, height: 500, description: "3:1 aspect ratio" },
];
export const TextToImageGenerator = () => {
  const [prompt, setPrompt] = useState("");
  const [selectedSize, setSelectedSize] = useState<ImageSize>(imageSizes[0]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState("");
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [selectedImage, setSelectedImage] = useState<GeneratedImage | null>(null);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const { user, profile, refreshProfile } = useAuth();
  // Google AI API key is built-in - no external APIs needed for users
  const googleAIKey = "AIzaSyBipgS1CMGSJ5RMtDg8EC2PijfS6sHCDO0";
  const handleGenerate = useCallback(async () => {
    if (!prompt.trim()) {
      toast.error("Please enter a prompt to generate images");
      return;
    }

    // Check credits
    if (!profile || profile.daily_credits <= 0) {
      toast.error("You don't have enough credits. Please purchase more credits to continue.");
      return;
    }

    if (profile.is_blocked) {
      toast.error("Your account is blocked. Please contact support.");
      return;
    }

    setIsGenerating(true);
    setProgress(0);
    setCurrentStepIndex(0);

    try {
      let finalPrompt = prompt.trim();
      
      // Google AI analysis and enhancement - built-in, no API key needed from user
      if (googleAIKey.trim()) {
        setCurrentStep("Analyzing prompt with AI...");
        setProgress(5);
        
        const googleAI = new GoogleAIService(googleAIKey.trim());
        
        // First analyze the prompt
        const analysis = await googleAI.analyzePrompt(finalPrompt);
        if (!analysis.isAppropriate) {
          toast.error(`Prompt needs improvement: ${analysis.suggestions}`);
          return;
        }
        
        setCurrentStep("Enhancing prompt with AI...");
        setProgress(15);
        
        // Then enhance the prompt
        finalPrompt = await googleAI.analyzeAndEnhancePrompt(finalPrompt);
        toast.success("Prompt enhanced with AI analysis!");
      }

      // Initialize model if needed
      if (!aiService.isModelReady()) {
        setCurrentStep("Loading AI model...");
        setProgress(25);
        await aiService.initialize();
        setProgress(40);
      }

      setCurrentStep("Generating images...");
      setProgress(60);

      const images = await aiService.generateImages({
        prompt: finalPrompt,
        numImages: 4
      });

      // Save to public gallery and consume credit
      if (user && images.length > 0) {
        setCurrentStep("Saving to gallery...");
        setProgress(80);
        
        try {
          // Save each image to the gallery
          for (const image of images) {
            await supabase
              .from('generated_images')
              .insert({
                user_id: user.id,
                prompt: finalPrompt,
                image_url: image.url,
                image_size: `${selectedSize.width}x${selectedSize.height}`,
                is_public: true
              });
          }
          
          // Consume one credit
          const { error: creditError } = await supabase
            .from('profiles')
            .update({ 
              daily_credits: profile.daily_credits - 1,
              credits_used_today: profile.credits_used_today + 1
            })
            .eq('user_id', user.id);
            
          if (creditError) {
            console.error('Credit update error:', creditError);
          } else {
            // Refresh profile to update credits in UI
            await refreshProfile();
          }
        } catch (error) {
          console.error('Gallery save error:', error);
          // Don't fail the whole process if gallery save fails
        }
      }

      setGeneratedImages(prev => [...images, ...prev]);
      setProgress(100);
      setCurrentStep("Complete!");
      
      toast.success(`Generated ${images.length} images successfully!`);
    } catch (error) {
      console.error('Generation failed:', error);
      toast.error(error instanceof Error ? error.message : "Failed to generate images");
    } finally {
      setIsGenerating(false);
      setProgress(0);
      setCurrentStep("");
      setCurrentStepIndex(0);
    }
  }, [prompt, selectedSize, user, profile, refreshProfile]);

  const handleViewImage = (image: GeneratedImage) => {
    setSelectedImage(image);
    setIsViewerOpen(true);
  };

  const handleCloseViewer = () => {
    setIsViewerOpen(false);
    setSelectedImage(null);
  };

  const isModelLoading = aiService.isModelLoading();

  return (
    <div className="min-h-screen bg-gradient-secondary">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="p-3 rounded-full bg-gradient-primary shadow-glow">
              <Sparkles className="w-8 h-8 text-primary-foreground" />
            </div>
          </div>
          <h1 className="text-4xl font-bold mb-2 bg-gradient-primary bg-clip-text text-transparent">
            AI Image Generator
          </h1>
          <p className="text-muted-foreground text-lg">
            Create stunning images from text prompts using on-device AI
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            Created by Mohammad Ibrahim Sikder Maruf — YouTube: Maruf diamond top up
          </p>
        </div>

        {/* Generation Interface */}
        <Card className="mb-8 p-6 bg-card border-border shadow-soft">
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="prompt" className="block text-sm font-medium mb-2">
                  Describe what you want to create
                </Label>
                <Textarea
                  id="prompt"
                  placeholder="A majestic mountain landscape at sunset with a lake reflecting the orange sky..."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="min-h-[120px] bg-input border-border focus:border-primary resize-none"
                  disabled={isGenerating}
                />
              </div>
              
              <div>
                <Label htmlFor="size" className="block text-sm font-medium mb-2 flex items-center">
                  <ImageIcon className="w-4 h-4 mr-2" />
                  Image Size
                </Label>
                <Select 
                  value={selectedSize.name} 
                  onValueChange={(value) => {
                    const size = imageSizes.find(s => s.name === value);
                    if (size) setSelectedSize(size);
                  }}
                  disabled={isGenerating}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select image size" />
                  </SelectTrigger>
                  <SelectContent>
                    {imageSizes.map((size) => (
                      <SelectItem key={size.name} value={size.name}>
                        <div className="flex items-center gap-3">
                          {(() => {
                            const Icon = size.name.includes('YouTube')
                              ? Youtube
                              : size.width === size.height
                              ? Square
                              : size.height > size.width
                              ? RectangleVertical
                              : RectangleHorizontal;
                            return <Icon className="w-4 h-4 text-muted-foreground" />;
                          })()}
                          <div className="flex flex-col">
                            <span className="font-medium">{size.name}</span>
                            <span className="text-xs text-muted-foreground">
                              {size.width} × {size.height} - {size.description}
                            </span>
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Settings className="w-4 h-4" />
                <span>Will generate 4 unique variations with AI-enhanced prompts</span>
                <Brain className="w-4 h-4 text-primary" />
              </div>
              
              <Button
                onClick={handleGenerate}
                disabled={isGenerating || isModelLoading || !prompt.trim() || !profile || profile.daily_credits <= 0}
                className="bg-gradient-primary hover:opacity-90 transition-smooth shadow-glow px-8"
              >
                <Wand2 className="w-4 h-4 mr-2" />
                {isGenerating ? "Generating..." : `Generate Images (1 credit)`}
              </Button>
            </div>
          </div>
        </Card>

        {/* Progress Indicator */}
        <div className="mb-8">
          <ProgressIndicator
            isLoading={isGenerating || isModelLoading}
            progress={progress}
            currentStep={currentStep || (isModelLoading ? "Loading AI model..." : "")}
            totalSteps={4}
            currentStepIndex={currentStepIndex}
          />
        </div>

        {/* Generated Images */}
        {generatedImages.length > 0 && (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-semibold mb-2">Generated Images</h2>
              <p className="text-muted-foreground">
                Click on any image to view full size or download
              </p>
            </div>
            
            <div className="image-grid">
              {generatedImages.map((image) => (
                <ImageCard
                  key={image.id}
                  image={image}
                  onView={handleViewImage}
                />
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {generatedImages.length === 0 && !isGenerating && !isModelLoading && (
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-full bg-gradient-accent mx-auto mb-4 flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-accent-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Ready to Create</h3>
            <p className="text-muted-foreground">
              Enter a prompt above and click "Generate Images" to get started
            </p>
          </div>
        )}
      </div>

      {/* Image Viewer Modal */}
      <ImageViewer
        image={selectedImage}
        isOpen={isViewerOpen}
        onClose={handleCloseViewer}
      />
    </div>
  );
};