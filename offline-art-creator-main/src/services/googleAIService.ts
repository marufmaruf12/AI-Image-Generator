interface GoogleAIResponse {
  candidates: Array<{
    content: {
      parts: Array<{
        text: string;
      }>;
    };
  }>;
}

export class GoogleAIService {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async analyzeAndEnhancePrompt(prompt: string): Promise<string> {
    if (!this.apiKey) {
      throw new Error('Google AI Studio API key is required');
    }

    try {
      const enhanceSystemPrompt = `You are an expert at creating detailed, vivid image generation prompts. 

User will give you a basic prompt idea. Your job is to:
1. Analyze the prompt for clarity and completeness
2. Enhance it with specific visual details, lighting, composition, and style
3. Make it more descriptive while keeping the original intent
4. Add artistic elements that will create stunning, high-quality images

Keep the enhanced prompt under 200 words and make it extremely detailed and visually descriptive.

Original prompt: "${prompt}"

Enhanced prompt:`;

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: enhanceSystemPrompt
            }]
          }]
        })
      });

      if (!response.ok) {
        console.warn('Google AI API not available, continuing without enhancement:', response.status);
        return prompt.trim();
      }

      const data: GoogleAIResponse = await response.json();
      const enhancedPrompt = data.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!enhancedPrompt) {
        return prompt.trim();
      }

      return enhancedPrompt.trim();
    } catch (error) {
      console.warn('Google AI Service error (continuing without enhancement):', error);
      return prompt.trim();
    }
  }

  async analyzePrompt(prompt: string): Promise<{
    isAppropriate: boolean;
    suggestions?: string;
    category: string;
  }> {
    if (!this.apiKey) {
      return {
        isAppropriate: true,
        category: 'general'
      };
    }

    try {
      const analysisPrompt = `Analyze this image generation prompt for appropriateness and categorize it:

Prompt: "${prompt}"

Respond in this exact JSON format:
{
  "isAppropriate": true/false,
  "suggestions": "optional suggestions if inappropriate or could be improved",
  "category": "nature|portrait|abstract|architecture|fantasy|animals|technology|art"
}`;

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: analysisPrompt
            }]
          }]
        })
      });

      if (!response.ok) {
        return {
          isAppropriate: true,
          category: 'general'
        };
      }

      const data: GoogleAIResponse = await response.json();
      const analysisText = data.candidates?.[0]?.content?.parts?.[0]?.text;

      if (analysisText) {
        try {
          const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
          }
        } catch (parseError) {
          console.error('Failed to parse analysis response:', parseError);
        }
      }

      return {
        isAppropriate: true,
        category: 'general'
      };
    } catch (error) {
      console.error('Analysis error:', error);
      return {
        isAppropriate: true,
        category: 'general'
      };
    }
  }
}