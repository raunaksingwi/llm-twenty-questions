import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, HelpCircle } from "lucide-react";

export interface GameEntry {
  id: string;
  type: 'question' | 'guess';
  content: string;
  response: string;
  isCorrect?: boolean;
  questionNumber?: number;
}

interface GameHistoryProps {
  entries: GameEntry[];
}

export const GameHistory = ({ entries }: GameHistoryProps) => {
  const getResponseIcon = (response: string, type: string) => {
    if (type === 'guess') {
      return response.toLowerCase().includes('correct') || response.toLowerCase().includes('yes') 
        ? <CheckCircle className="h-4 w-4 text-game-win" />
        : <XCircle className="h-4 w-4 text-destructive" />;
    }
    
    if (response.toLowerCase().includes('yes')) {
      return <CheckCircle className="h-4 w-4 text-game-win" />;
    } else if (response.toLowerCase().includes('no')) {
      return <XCircle className="h-4 w-4 text-destructive" />;
    } else {
      return <HelpCircle className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getResponseBadge = (response: string, type: string) => {
    if (type === 'guess') {
      return response.toLowerCase().includes('correct') || response.toLowerCase().includes('yes')
        ? 'win' : 'lose';
    }
    
    if (response.toLowerCase().includes('yes')) return 'win';
    if (response.toLowerCase().includes('no')) return 'lose';
    return 'neutral';
  };

  return (
    <Card className="p-6 bg-card/30 backdrop-blur-sm border-primary/20 max-h-96 overflow-y-auto">
      <h3 className="text-lg font-semibold mb-4 text-center">Game History</h3>
      
      {entries.length === 0 ? (
        <p className="text-muted-foreground text-center py-8">
          No questions asked yet. Start playing!
        </p>
      ) : (
        <div className="space-y-3">
          {entries.map((entry) => (
            <div key={entry.id} className="space-y-2 animate-slide-in">
              <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/20 border border-border/50">
                <div className="flex-shrink-0 mt-1">
                  {entry.questionNumber && (
                    <Badge variant="outline" className="text-xs">
                      Q{entry.questionNumber}
                    </Badge>
                  )}
                </div>
                
                <div className="flex-1 space-y-2">
                  <div className="font-medium text-foreground">
                    {entry.type === 'guess' ? '🎯 ' : '❓ '}
                    {entry.content}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {getResponseIcon(entry.response, entry.type)}
                    <span className="text-sm text-muted-foreground">
                      {entry.response}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};