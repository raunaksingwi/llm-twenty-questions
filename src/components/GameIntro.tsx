import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Play, Lightbulb, Mic, Volume2 } from "lucide-react";
import { useTextToSpeech } from "@/hooks/useTextToSpeech";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import { useEffect } from "react";

interface GameIntroProps {
  onStartGame: () => void;
  isLoading: boolean;
}

export const GameIntro = ({ onStartGame, isLoading }: GameIntroProps) => {
  const { speak, isSupported: ttsSupported } = useTextToSpeech();
  const { isSupported: speechSupported } = useSpeechRecognition();
  
  // Speak welcome message when component mounts
  useEffect(() => {
    if (ttsSupported) {
      const welcomeMessage = "Welcome to Guess in 20! I'm thinking of a common everyday item. You can ask yes or no questions to figure out what it is. You have 20 questions maximum. Ready to start?";
    }
  }, [ttsSupported, speak]);

  return (
    <Card className="p-8 text-center space-y-6 bg-gradient-game border-primary/20 shadow-game animate-slide-in">
      <div className="space-y-4">
        <div className="space-y-2">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-primary-glow to-accent-glow bg-clip-text text-transparent">
            Welcome to GuessIn20!
          </h2>
          <p className="text-lg text-muted-foreground">
            The classic 20 questions game
          </p>
        </div>
        
        <div className="grid gap-4 text-left max-w-md mx-auto">
          <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/20">
            <Lightbulb className="h-5 w-5 text-secondary mt-0.5 flex-shrink-0" />
            <div className="text-sm space-y-1">
              <p className="font-medium">How to Play:</p>
              <p className="text-muted-foreground">
                I'm thinking of a common everyday item. Ask yes/no questions to figure out what it is!
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/20">
            <div className="h-5 w-5 bg-primary rounded-full flex items-center justify-center text-xs font-bold text-primary-foreground mt-0.5 flex-shrink-0">
              20
            </div>
            <div className="text-sm space-y-1">
              <p className="font-medium">The Rules:</p>
              <p className="text-muted-foreground">
                You have 20 questions maximum. Ask wisely, or make a guess anytime!
              </p>
            </div>
          </div>

        </div>
      </div>
      
      <Button 
        onClick={onStartGame}
        disabled={isLoading}
        variant="game"
        size="lg"
        className="w-full"
      >
        <Play className="h-5 w-5 mr-2" />
        {isLoading ? "Thinking of an item..." : "Start Game"}
      </Button>
    </Card>
  );
};