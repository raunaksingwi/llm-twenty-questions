interface GameHeaderProps {
  questionsUsed: number;
  maxQuestions: number;
  gamePhase: 'waiting' | 'playing' | 'won' | 'lost';
}

export const GameHeader = ({ questionsUsed, maxQuestions, gamePhase }: GameHeaderProps) => {
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
        
        <div className="text-right">
          <div className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            {questionsUsed}/{maxQuestions}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400">
            questions
          </div>
        </div>
      </div>
      
      {/* Progress Bar */}
      <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
        <div 
          className={`h-full transition-all duration-500 ease-out rounded-full ${getProgressColor()}`}
          style={{ width: `${(questionsUsed / maxQuestions) * 100}%` }}
        />
      </div>
    </div>
  );
};