import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Trophy, RotateCcw, Target } from "lucide-react";

interface GameEndScreenProps {
  gamePhase: 'won' | 'lost';
  secretItem?: string;
  questionsUsed: number;
  maxQuestions: number;
  onNewGame: () => void;
}

export const GameEndScreen = ({ 
  gamePhase, 
  secretItem, 
  questionsUsed, 
  maxQuestions, 
  onNewGame 
}: GameEndScreenProps) => {
  const isWin = gamePhase === 'won';

  return (
    <Card className={`p-8 text-center space-y-6 animate-bounce-in ${
      isWin 
        ? 'bg-gradient-to-br from-game-win/20 to-primary/20 border-game-win/30 shadow-win' 
        : 'bg-gradient-to-br from-destructive/20 to-primary/20 border-destructive/30 shadow-lose'
    }`}>
      <div className="space-y-4">
        {isWin ? (
          <>
            <Trophy className="h-16 w-16 mx-auto text-game-win animate-bounce" />
            <h2 className="text-3xl font-bold text-game-win">
              Congratulations! 🎉
            </h2>
            <p className="text-lg text-foreground">
              You guessed it in {questionsUsed} question{questionsUsed !== 1 ? 's' : ''}!
            </p>
          </>
        ) : (
          <>
            <Target className="h-16 w-16 mx-auto text-destructive" />
            <h2 className="text-3xl font-bold text-destructive">
              Game Over! 
            </h2>
            <p className="text-lg text-foreground">
              You used all {maxQuestions} questions.
            </p>
          </>
        )}
        
        {secretItem && (
          <div className="p-4 bg-muted/30 rounded-lg border border-border/50">
            <p className="text-sm text-muted-foreground mb-2">
              The item was:
            </p>
            <p className="text-2xl font-bold text-primary">
              {secretItem}
            </p>
          </div>
        )}
      </div>
      
      <Button 
        onClick={onNewGame}
        variant={isWin ? "win" : "game"}
        size="lg"
        className="w-full"
      >
        <RotateCcw className="h-5 w-5 mr-2" />
        Play Again
      </Button>
    </Card>
  );
};