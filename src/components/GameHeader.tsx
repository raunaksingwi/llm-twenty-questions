import { Card } from "@/components/ui/card";

interface GameHeaderProps {
  questionsUsed: number;
  maxQuestions: number;
  gamePhase: 'waiting' | 'playing' | 'won' | 'lost';
}

export const GameHeader = ({ questionsUsed, maxQuestions, gamePhase }: GameHeaderProps) => {
  const getStatusColor = () => {
    if (gamePhase === 'won') return 'text-game-win';
    if (gamePhase === 'lost') return 'text-game-lose';
    if (questionsUsed >= 15) return 'text-destructive';
    if (questionsUsed >= 10) return 'text-secondary';
    return 'text-primary';
  };

  const getStatusText = () => {
    if (gamePhase === 'won') return 'You Won!';
    if (gamePhase === 'lost') return 'Game Over';
    if (gamePhase === 'waiting') return 'Ready to Play';
    return 'Playing...';
  };

  return (
    <Card className="p-6 bg-gradient-game border-primary/20 shadow-game animate-slide-in">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-primary-glow to-accent-glow bg-clip-text text-transparent animate-game-glow">
          GuessIn20
        </h1>
        
        <div className="flex items-center justify-between">
          <div className="text-lg font-semibold text-muted-foreground">
            {getStatusText()}
          </div>
          
          <div className={`text-2xl font-bold ${getStatusColor()} transition-colors duration-300`}>
            {questionsUsed}/{maxQuestions}
          </div>
        </div>
        
        <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
          <div 
            className={`h-full transition-all duration-500 ease-out ${
              questionsUsed >= 15 ? 'bg-destructive' : 
              questionsUsed >= 10 ? 'bg-secondary' : 
              'bg-primary'
            }`}
            style={{ width: `${(questionsUsed / maxQuestions) * 100}%` }}
          />
        </div>
      </div>
    </Card>
  );
};