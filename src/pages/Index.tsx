import { GameHeader } from "@/components/GameHeader";
import { GameIntro } from "@/components/GameIntro";
import { QuestionInput } from "@/components/QuestionInput";
import { GameHistory } from "@/components/GameHistory";
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
    handleQuestion,
    handleGuess,
    resetGame
  } = useGameLogic();

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {gamePhase !== 'intro' && (
          <GameHeader 
            questionsUsed={questionsUsed}
            maxQuestions={maxQuestions}
            gamePhase={gamePhase}
          />
        )}

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-6">
            {gamePhase === 'intro' && (
              <GameIntro 
                onStartGame={startNewGame}
                isLoading={isLoading}
              />
            )}

            {(gamePhase === 'playing' || gamePhase === 'waiting') && (
              <QuestionInput
                onSubmitQuestion={handleQuestion}
                onSubmitGuess={handleGuess}
                disabled={isLoading || gamePhase === 'waiting'}
                questionsUsed={questionsUsed}
                maxQuestions={maxQuestions}
              />
            )}

            {(gamePhase === 'won' || gamePhase === 'lost') && (
              <GameEndScreen
                gamePhase={gamePhase}
                secretItem={secretItem}
                questionsUsed={questionsUsed}
                maxQuestions={maxQuestions}
                onNewGame={resetGame}
              />
            )}
          </div>

          {gamePhase !== 'intro' && (
            <div>
              <GameHistory entries={gameHistory} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;
