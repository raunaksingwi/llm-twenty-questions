import { useState, useCallback } from 'react';
import { toast } from '@/hooks/use-toast';
import { GameEntry } from '@/types/game';
import { useAudioManager } from '@/components/AudioManager';
import { LLMGameService } from '@/services/llmService';

type GamePhase = 'intro' | 'waiting' | 'playing' | 'won' | 'lost';

export const useGameLogic = () => {
  const [gamePhase, setGamePhase] = useState<GamePhase>('intro');
  const [questionsUsed, setQuestionsUsed] = useState(0);
  const [gameHistory, setGameHistory] = useState<GameEntry[]>([]);
  const [secretItem, setSecretItem] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [llmService] = useState(() => new LLMGameService());
  const { playSound } = useAudioManager();
  
  const maxQuestions = 20;

  const startNewGame = useCallback(async () => {
    setIsLoading(true);
    setGamePhase('waiting');
    
    try {
      // Let Claude select the secret item
      const newItem = await llmService.selectSecretItem();
      setSecretItem(newItem);
      setQuestionsUsed(0);
      setGameHistory([]);
      setGamePhase('playing');
      
      toast({
        title: "Game Started!",
        description: "I've thought of an item. Start asking yes/no questions!",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to start game. Please try again.",
        variant: "destructive"
      });
      setGamePhase('intro');
    } finally {
      setIsLoading(false);
    }
  }, [llmService]);


  const handleMessage = useCallback(async (message: string) => {
    if (gamePhase !== 'playing' || questionsUsed >= maxQuestions) return;

    setIsLoading(true);
    
    try {
      const llmResponse = await llmService.evaluateInput(message, questionsUsed);
      
      if (llmResponse.type === 'clarification') {
        // Handle clarification - does NOT count as a question
        const newEntry: GameEntry = {
          id: Date.now().toString(),
          type: 'question',
          content: message,
          response: llmResponse.content,
          questionNumber: undefined // No question number for clarifications
        };

        setGameHistory(prev => [...prev, newEntry]);
        // Don't increment questionsUsed for clarifications
        
        toast({
          title: "Need clarification",
          description: llmResponse.content,
          variant: "default"
        });
      } else {
        // All other inputs count as questions
        const newQuestionCount = questionsUsed + 1;
        
        if (llmResponse.type === 'guess_evaluation') {
          // Handle as guess - but still counts as a question
          const newEntry: GameEntry = {
            id: Date.now().toString(),
            type: 'guess',
            content: message,
            response: llmResponse.content,
            isCorrect: llmResponse.isCorrect,
            questionNumber: newQuestionCount
          };

          setGameHistory(prev => [...prev, newEntry]);
          setQuestionsUsed(newQuestionCount);
          
          if (llmResponse.isCorrect) {
            // Player won with correct guess
            setGamePhase('won');
            playSound('win');
            toast({
              title: "Congratulations!",
              description: llmResponse.content,
            });
          } else {
            // Incorrect guess, but game continues if questions remain
            if (newQuestionCount >= maxQuestions) {
              setGamePhase('lost');
              playSound('lose');
              toast({
                title: "Game Over!",
                description: `You used all ${maxQuestions} questions. The item was: ${llmService.getSecretItem()}`,
                variant: "destructive"
              });
            } else {
              // Game continues
              toast({
                title: "Keep trying!",
                description: `${llmResponse.content} You have ${maxQuestions - newQuestionCount} questions left.`,
              });
            }
          }
        } else {
          // Handle as regular question
          const newEntry: GameEntry = {
            id: Date.now().toString(),
            type: 'question',
            content: message,
            response: llmResponse.content,
            questionNumber: newQuestionCount
          };

          setGameHistory(prev => [...prev, newEntry]);
          setQuestionsUsed(newQuestionCount);
          
          // Play sound effect for yes/no answers
          if (llmResponse.content.toLowerCase().includes('yes')) {
            playSound('yes');
          } else if (llmResponse.content.toLowerCase().includes('no')) {
            playSound('no');
          }
          
          // Check if game should end due to question limit
          if (newQuestionCount >= maxQuestions) {
            setGamePhase('lost');
            playSound('lose');
            toast({
              title: "Game Over!",
              description: `You used all ${maxQuestions} questions. The item was: ${llmService.getSecretItem()}`,
              variant: "destructive"
            });
          }
        }
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to get response. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [gamePhase, questionsUsed, maxQuestions, llmService, playSound]);


  const resetGame = useCallback(() => {
    setGamePhase('intro');
    setQuestionsUsed(0);
    setGameHistory([]);
    setSecretItem('');
    setIsLoading(false);
  }, []);

  return {
    gamePhase,
    questionsUsed,
    maxQuestions,
    gameHistory,
    secretItem,
    isLoading,
    startNewGame,
    handleMessage,
    resetGame
  };
};