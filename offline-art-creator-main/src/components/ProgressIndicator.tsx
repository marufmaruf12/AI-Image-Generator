import { Progress } from "@/components/ui/progress";
import { LoadingSpinner } from "./LoadingSpinner";

interface ProgressIndicatorProps {
  isLoading: boolean;
  progress: number;
  currentStep: string;
  totalSteps: number;
  currentStepIndex: number;
}

export const ProgressIndicator = ({ 
  isLoading, 
  progress, 
  currentStep, 
  totalSteps, 
  currentStepIndex 
}: ProgressIndicatorProps) => {
  if (!isLoading) return null;

  return (
    <div className="w-full max-w-md mx-auto space-y-4 p-6 rounded-xl border bg-card shadow-soft">
      <div className="flex items-center justify-center space-x-3">
        <LoadingSpinner size="md" />
        <h3 className="text-lg font-semibold">Generating Images</h3>
      </div>
      
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>{currentStep}</span>
          <span>{currentStepIndex}/{totalSteps}</span>
        </div>
        <Progress 
          value={progress} 
          className="h-2 bg-secondary"
        />
      </div>
      
      <p className="text-sm text-center text-muted-foreground">
        This may take a few moments on first use while the AI model loads...
      </p>
    </div>
  );
};