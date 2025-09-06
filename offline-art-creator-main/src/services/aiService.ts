import { pipeline } from '@huggingface/transformers';

export interface GenerationOptions {
  prompt: string;
  numImages?: number;
  seed?: number;
}

export interface GeneratedImage {
  id: string;
  url: string;
  prompt: string;
  timestamp: number;
}

class AIService {
  private pipeline: any = null;
  private isLoading = false;
  private isInitialized = false;

  async initialize(): Promise<void> {
    if (this.isInitialized || this.isLoading) return;
    
    this.isLoading = true;
    try {
      console.log('Initializing AI model (lightweight placeholder for offline mode)...');
      // Using a lightweight model for demonstration; generation handled elsewhere if Runware is configured
      this.pipeline = await pipeline('text-classification', 'Xenova/distilbert-base-uncased-finetuned-sst-2-english');
      this.isInitialized = true;
      console.log('AI model initialized successfully');
    } catch (error) {
      console.error('Failed to initialize AI model:', error);
      throw new Error('Failed to initialize AI model. Please check your browser compatibility.');
    } finally {
      this.isLoading = false;
    }
  }

  async generateImages(options: GenerationOptions): Promise<GeneratedImage[]> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    const { prompt, numImages = 4, seed } = options;
    const images: GeneratedImage[] = [];

    try {
      // Simulate AI generation process with realistic timing
      for (let i = 0; i < numImages; i++) {
        console.log(`Generating image ${i + 1}/${numImages} for prompt: "${prompt}"`);
        
        // Simulate processing time
        await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 1000));
        
        // Generate a unique image using a placeholder service that creates AI-style images
        const currentSeed = seed ? seed + i : Math.floor(Math.random() * 1000000);
        const imageUrl = this.generatePlaceholderImage(prompt, currentSeed, i);
        
        images.push({
          id: `${Date.now()}-${i}`,
          url: imageUrl,
          prompt,
          timestamp: Date.now()
        });
      }
    } catch (error) {
      console.error('Error generating images:', error);
      throw new Error('Failed to generate images. Please try again.');
    }

    return images;
  }

  private generatePlaceholderImage(prompt: string, seed: number, index: number): string {
    const width = 512;
    const height = 512;
    
    // Generate a unique image based on prompt characteristics
    const promptHash = this.hashString(prompt + seed + index);
    const variation = (promptHash + index) % 4; // Create 4 different variations
    
    // Use AI-style image generation service that responds to prompts
    // This service creates images that actually match the text prompts
    const encodedPrompt = encodeURIComponent(prompt);
    
    // Use ThisPersonDoesNotExist style service for AI-generated images
    return `https://image.pollinations.ai/prompt/${encodedPrompt}?width=${width}&height=${height}&seed=${promptHash + variation}&model=flux&nologo=true`;
  }

  private extractImageCategory(prompt: string): string {
    const categories = ['nature', 'abstract', 'animals', 'technology', 'art', 'architecture'];
    const lowerPrompt = prompt.toLowerCase();
    
    if (lowerPrompt.includes('landscape') || lowerPrompt.includes('mountain') || lowerPrompt.includes('forest')) return 'nature';
    if (lowerPrompt.includes('animal') || lowerPrompt.includes('cat') || lowerPrompt.includes('dog')) return 'animals';
    if (lowerPrompt.includes('building') || lowerPrompt.includes('house') || lowerPrompt.includes('city')) return 'architecture';
    if (lowerPrompt.includes('tech') || lowerPrompt.includes('robot') || lowerPrompt.includes('computer')) return 'technology';
    if (lowerPrompt.includes('abstract') || lowerPrompt.includes('geometric')) return 'abstract';
    
    return 'art';
  }

  private hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash;
  }

  isModelReady(): boolean {
    return this.isInitialized && !this.isLoading;
  }

  isModelLoading(): boolean {
    return this.isLoading;
  }
}

export const aiService = new AIService();