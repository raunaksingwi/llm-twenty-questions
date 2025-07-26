import { RotateCcw } from "lucide-react";

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
    <div className="w-full max-w-sm mx-auto text-center space-y-6">
      {/* Result Icon & Message */}
      <div className="space-y-4">
        <div className={`w-24 h-24 mx-auto rounded-full flex items-center justify-center ${
          isWin 
            ? 'bg-gradient-to-br from-green-400 to-emerald-500' 
            : 'bg-gradient-to-br from-orange-400 to-red-500'
        } shadow-lg`}>
          <span className="text-4xl">
            {isWin ? '🎉' : '🤔'}
          </span>
        </div>
        
        <div>
          <h2 className={`text-2xl font-bold mb-2 ${
            isWin 
              ? 'text-green-700 dark:text-green-400' 
              : 'text-orange-700 dark:text-orange-400'
          }`}>
            {isWin ? 'Awesome!' : 'Good Try!'}
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-sm">
            {isWin 
              ? `You got it in ${questionsUsed} question${questionsUsed !== 1 ? 's' : ''}!` 
              : `You used all ${maxQuestions} questions.`
            }
          </p>
        </div>
      </div>
      
      {/* Secret Item Reveal */}
      {secretItem && (
        <div className={`rounded-2xl p-6 border-2 ${
          isWin 
            ? 'bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800' 
            : 'bg-orange-50 dark:bg-orange-950/30 border-orange-200 dark:border-orange-800'
        }`}>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wide">
            The answer was
          </p>
          <div className="text-3xl mb-2">
            {getItemEmoji(secretItem)}
          </div>
          <p className="text-xl font-bold text-slate-800 dark:text-slate-100 capitalize">
            {secretItem}
          </p>
        </div>
      )}
      
      {/* Play Again Button */}
      <button
        onClick={onNewGame}
        className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold py-4 px-6 rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 flex items-center justify-center gap-2"
      >
        <RotateCcw className="h-5 w-5" />
        Play Again
      </button>
    </div>
  );
};

// Helper function to get emoji for common items
function getItemEmoji(item: string): string {
  const itemLower = item.toLowerCase();
  const emojiMap: Record<string, string> = {
    'apple': '🍎',
    'car': '🚗',
    'book': '📚',
    'chair': '🪑',
    'dog': '🐕',
    'cat': '🐱',
    'tree': '🌳',
    'house': '🏠',
    'phone': '📱',
    'computer': '💻',
    'ball': '⚽',
    'flower': '🌸',
    'sun': '☀️',
    'moon': '🌙',
    'star': '⭐',
    'water': '💧',
    'fire': '🔥',
    'pizza': '🍕',
    'banana': '🍌',
    'bird': '🐦',
  };
  
  return emojiMap[itemLower] || '🤔';
}