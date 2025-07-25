import { useState, useCallback } from 'react';
import { toast } from '@/hooks/use-toast';
import { GameEntry } from '@/types/game';
import { useAudioManager } from '@/components/AudioManager';
import { LLMGameService } from '@/services/llmService';

type GamePhase = 'intro' | 'api-key' | 'waiting' | 'playing' | 'won' | 'lost';

export const useGameLogic = () => {
  const [gamePhase, setGamePhase] = useState<GamePhase>('intro');
  const [questionsUsed, setQuestionsUsed] = useState(0);
  const [gameHistory, setGameHistory] = useState<GameEntry[]>([]);
  const [secretItem, setSecretItem] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [llmService, setLlmService] = useState<LLMGameService | null>(null);
  const { playSound } = useAudioManager();
  
  const maxQuestions = 20;

  const handleApiKey = useCallback((apiKey: string) => {
    const service = new LLMGameService(apiKey);
    setLlmService(service);
    setGamePhase('intro');
    localStorage.setItem('claude-api-key', apiKey);
  }, []);

  const startNewGame = useCallback(async () => {
    if (!llmService) {
      setGamePhase('api-key');
      return;
    }

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
        description: "Failed to start game. Please check your API key.",
        variant: "destructive"
      });
      setGamePhase('api-key');
    } finally {
      setIsLoading(false);
    }
  }, [llmService]);

  // Initialize API key from localStorage on mount
  useState(() => {
    const savedApiKey = localStorage.getItem('claude-api-key');
    if (savedApiKey) {
      const service = new LLMGameService(savedApiKey);
      setLlmService(service);
    }
  });

  const handleMessage = useCallback(async (message: string) => {
    if (gamePhase !== 'playing' || questionsUsed >= maxQuestions || !llmService) return;

    setIsLoading(true);
    
    try {
      const llmResponse = await llmService.evaluateInput(message, questionsUsed);
      
      if (llmResponse.type === 'guess_evaluation') {
        // Handle as guess
        const newEntry: GameEntry = {
          id: Date.now().toString(),
          type: 'guess',
          content: message,
          response: llmResponse.content,
          isCorrect: llmResponse.isCorrect
        };

        setGameHistory(prev => [...prev, newEntry]);
        setGamePhase(llmResponse.isCorrect ? 'won' : 'lost');
        
        // Play sound effect
        playSound(llmResponse.isCorrect ? 'win' : 'lose');
        
        toast({
          title: llmResponse.isCorrect ? "Congratulations!" : "Game Over!",
          description: llmResponse.content,
          variant: llmResponse.isCorrect ? "default" : "destructive"
        });
      } else {
        // Handle as question or clarification
        const newQuestionCount = llmResponse.type === 'clarification' ? questionsUsed : questionsUsed + 1;
        
        const newEntry: GameEntry = {
          id: Date.now().toString(),
          type: 'question',
          content: message,
          response: llmResponse.content,
          questionNumber: llmResponse.type === 'clarification' ? undefined : newQuestionCount
        };

        setGameHistory(prev => [...prev, newEntry]);
        
        if (llmResponse.type !== 'clarification') {
          setQuestionsUsed(newQuestionCount);
          
          // Play sound effect for yes/no answers
          if (llmResponse.content.toLowerCase().includes('yes')) {
            playSound('yes');
          } else if (llmResponse.content.toLowerCase().includes('no')) {
            playSound('no');
          }
          
          // Check if game should end
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
    resetGame,
    handleApiKey
  };
};