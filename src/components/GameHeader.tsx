import { X } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useState } from 'react';

interface GameHeaderProps {
  questionsUsed: number;
  maxQuestions: number;
  gamePhase: 'waiting' | 'playing' | 'won' | 'lost';
  onGiveUp?: () => void;
}

export const GameHeader = ({ 
  questionsUsed, 
  maxQuestions, 
  gamePhase,
  onGiveUp
}: GameHeaderProps) => {
  const [showGiveUpDialog, setShowGiveUpDialog] = useState(false);

  const handleGiveUp = () => {
    setShowGiveUpDialog(false);
    onGiveUp?.();
  };

  const getStatusEmoji = () => {
    if (gamePhase === 'won') return '🎉';
    if (gamePhase === 'lost') return '😔';
    if (gamePhase === 'waiting') return '⏳';
    return '🤔';
  };

  const getStatusText = () => {
    if (gamePhase === 'won') return 'You Won!';
    if (gamePhase === 'lost') return 'Game Over';
    if (gamePhase === 'waiting') return 'Getting Ready...';
    return 'Your Turn';
  };

  const getProgressColor = () => {
    if (questionsUsed >= 15) return 'bg-red-500';
    if (questionsUsed >= 10) return 'bg-yellow-500';
    return 'bg-blue-500';
  };

  return (
    <>
      <AlertDialog open={showGiveUpDialog} onOpenChange={setShowGiveUpDialog}>
        <AlertDialogContent className="max-w-[90%] w-[320px] rounded-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm border border-slate-200 dark:border-slate-700 p-0 gap-0">
          <AlertDialogHeader className="p-4 pb-2">
            <AlertDialogTitle className="text-xl font-bold text-center text-slate-800 dark:text-slate-100">
              Are you sure?
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-3 text-slate-600 dark:text-slate-400">
              <div className="text-center text-4xl mb-2">🤔</div>
              <p className="text-center font-medium">
                You've come so far!
                <br />The answer might be just one question away.
              </p>
              <div className="bg-slate-100 dark:bg-slate-800 rounded-xl p-3">
                <p className="text-sm font-medium mb-2">Try asking about:</p>
                <ul className="text-sm space-y-1.5">
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                    Is it edible?
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-purple-500 rounded-full"></span>
                    Is it found in the kitchen?
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                    Is it an electronic device?
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full"></span>
                    Its size or shape
                  </li>
                </ul>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="p-4 pt-2 flex-col gap-2">
            <AlertDialogAction
              onClick={handleGiveUp}
              className="w-full bg-red-500 hover:bg-red-600 text-white rounded-xl font-medium"
            >
              Give Up
            </AlertDialogAction>
            <AlertDialogCancel className="w-full bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-medium border-0">
              Keep Trying
            </AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
              <span className="text-lg">{getStatusEmoji()}</span>
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                20 Questions
              </h1>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                {getStatusText()}
              </p>
            </div>
          </div>
          
          {gamePhase === 'playing' && (
            <button
              type="button"
              onClick={() => setShowGiveUpDialog(true)}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-900/50 transition-all"
              title="Give Up"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        
        {/* Progress Bar */}
        <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
          <div 
            className={`h-full transition-all duration-500 ease-out rounded-full ${getProgressColor()}`}
            style={{ width: `${(questionsUsed / maxQuestions) * 100}%` }}
          />
        </div>
      </div>
    </>
  );
};