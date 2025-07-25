import { GameHeader } from "@/components/GameHeader";
import { GameIntro } from "@/components/GameIntro";
import { ChatInterface } from "@/components/ChatInterface";
import { GameEndScreen } from "@/components/GameEndScreen";
import { ApiKeyInput } from "@/components/ApiKeyInput";
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
    resetGame,
    handleApiKey
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

        {gamePhase === 'api-key' ? (
          <div className="max-w-2xl mx-auto">
            <ApiKeyInput onApiKeySubmit={handleApiKey} />
          </div>
        ) : gamePhase === 'intro' ? (
          <div className="max-w-2xl mx-auto">
            <GameIntro 
              onStartGame={startNewGame}
              isLoading={isLoading}
            />
          </div>
        ) : (gamePhase === 'won' || gamePhase === 'lost') ? (
          <div className="max-w-2xl mx-auto">
            <GameEndScreen
              gamePhase={gamePhase}
              secretItem={secretItem}
              questionsUsed={questionsUsed}
              maxQuestions={maxQuestions}
              onNewGame={resetGame}
            />
          </div>
        ) : (
          <div className="max-w-4xl mx-auto">
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
  );
};

export default Index;
