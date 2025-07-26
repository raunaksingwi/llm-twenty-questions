import { GameHeader } from "@/components/GameHeader";
import { GameIntro } from "@/components/GameIntro";
import { ChatInterface } from "@/components/ChatInterface";
import { GameEndScreen } from "@/components/GameEndScreen";
import { useGameLogic } from "@/hooks/useGameLogic";

const Index = () => {
  const {
    gamePhase,
    questionsUsed,
    maxQuestions,
    gameHistory,
    secretItem,
    isLoading,
    startNewGame,
    handleMessage,
    resetGame
  } = useGameLogic();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Mobile-first container */}
      <div className="max-w-sm mx-auto min-h-screen bg-white dark:bg-slate-900 shadow-xl relative">
        {/* Header - always visible */}
        {gamePhase !== 'intro' && (
          <div className="sticky top-0 z-10 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm border-b border-slate-200 dark:border-slate-700">
            <GameHeader 
              questionsUsed={questionsUsed}
              maxQuestions={maxQuestions}
              gamePhase={gamePhase}
            />
          </div>
        )}

        {/* Main content area */}
        <div className="flex flex-col h-screen">
          {gamePhase === 'intro' ? (
            <div className="flex-1 flex items-center justify-center p-4">
              <GameIntro 
                onStartGame={startNewGame}
                isLoading={isLoading}
              />
            </div>
          ) : (gamePhase === 'won' || gamePhase === 'lost') ? (
            <div className="flex-1 flex items-center justify-center p-4">
              <GameEndScreen
                gamePhase={gamePhase}
                secretItem={secretItem}
                questionsUsed={questionsUsed}
                maxQuestions={maxQuestions}
                onNewGame={resetGame}
              />
            </div>
          ) : (
            <div className="flex-1 flex flex-col">
              <ChatInterface
                entries={gameHistory}
                onSubmitMessage={handleMessage}
                disabled={isLoading || gamePhase === 'waiting'}
                questionsUsed={questionsUsed}
                maxQuestions={maxQuestions}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;
