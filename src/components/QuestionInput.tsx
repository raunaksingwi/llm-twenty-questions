import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Send, HelpCircle } from "lucide-react";

interface QuestionInputProps {
  onSubmitQuestion: (question: string) => void;
  onSubmitGuess: (guess: string) => void;
  disabled: boolean;
  questionsUsed: number;
  maxQuestions: number;
}

export const QuestionInput = ({ 
  onSubmitQuestion, 
  onSubmitGuess, 
  disabled, 
  questionsUsed, 
  maxQuestions 
}: QuestionInputProps) => {
  const [input, setInput] = useState("");
  const [isGuess, setIsGuess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    if (isGuess) {
      onSubmitGuess(input.trim());
    } else {
      onSubmitQuestion(input.trim());
    }
    
    setInput("");
    setIsGuess(false);
  };

  const canAskQuestions = questionsUsed < maxQuestions;

  return (
    <Card className="p-6 bg-card/50 backdrop-blur-sm border-primary/20 animate-slide-in">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={isGuess ? "Enter your guess..." : "Ask a yes/no question..."}
            disabled={disabled}
            className="flex-1 bg-input/80 border-primary/30 focus:border-primary transition-colors"
          />
          <Button 
            type="submit" 
            disabled={disabled || !input.trim()}
            variant={isGuess ? "game-secondary" : "game"}
            size="icon"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="flex gap-2">
          <Button
            type="button"
            variant={!isGuess ? "game" : "outline"}
            disabled={disabled || !canAskQuestions}
            onClick={() => setIsGuess(false)}
            className="flex-1"
          >
            <HelpCircle className="h-4 w-4 mr-2" />
            Ask Question
          </Button>
          <Button
            type="button"
            variant={isGuess ? "game-secondary" : "outline"}
            disabled={disabled}
            onClick={() => setIsGuess(true)}
            className="flex-1"
          >
            Make Guess
          </Button>
        </div>
        
        {!canAskQuestions && !isGuess && (
          <p className="text-sm text-destructive text-center">
            No questions left! You can only make a guess now.
          </p>
        )}
      </form>
    </Card>
  );
};