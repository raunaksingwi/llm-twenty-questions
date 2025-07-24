import { useState, useCallback } from 'react';
import { toast } from '@/hooks/use-toast';
import { GameEntry } from '@/components/GameHistory';

type GamePhase = 'intro' | 'waiting' | 'playing' | 'won' | 'lost';

const COMMON_ITEMS = [
  'apple', 'chair', 'book', 'pencil', 'cup', 'shoe', 'ball', 'clock', 'door', 'window',
  'spoon', 'phone', 'car', 'tree', 'flower', 'bread', 'water', 'paper', 'table', 'lamp',
  'bed', 'pillow', 'blanket', 'mirror', 'brush', 'towel', 'soap', 'key', 'coin', 'hat',
  'backpack', 'bicycle', 'scissors', 'fork', 'plate', 'bowl', 'bottle', 'box', 'bag', 'umbrella'
];

export const useGameLogic = () => {
  const [gamePhase, setGamePhase] = useState<GamePhase>('intro');
  const [questionsUsed, setQuestionsUsed] = useState(0);
  const [gameHistory, setGameHistory] = useState<GameEntry[]>([]);
  const [secretItem, setSecretItem] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  
  const maxQuestions = 20;

  const generateSecretItem = useCallback(() => {
    const randomIndex = Math.floor(Math.random() * COMMON_ITEMS.length);
    return COMMON_ITEMS[randomIndex];
  }, []);

  const startNewGame = useCallback(async () => {
    setIsLoading(true);
    setGamePhase('waiting');
    
    // Simulate thinking time for dramatic effect
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const newItem = generateSecretItem();
    setSecretItem(newItem);
    setQuestionsUsed(0);
    setGameHistory([]);
    setGamePhase('playing');
    setIsLoading(false);
    
    toast({
      title: "Game Started!",
      description: "I've thought of an item. Start asking yes/no questions!",
    });
  }, [generateSecretItem]);

  const simulateLLMResponse = useCallback((question: string, item: string): string => {
    const lowerQuestion = question.toLowerCase();
    const lowerItem = item.toLowerCase();

    // Handle invalid questions
    if (!lowerQuestion.includes('?') && !lowerQuestion.includes('is') && !lowerQuestion.includes('does') && !lowerQuestion.includes('can') && !lowerQuestion.includes('would')) {
      return "Could you rephrase that as a yes/no question?";
    }

    // Simple keyword-based logic for demonstration
    // In a real implementation, this would be an actual LLM call
    
    // Size questions
    if (lowerQuestion.includes('big') || lowerQuestion.includes('large')) {
      const bigItems = ['car', 'table', 'bed', 'door', 'window', 'chair', 'bicycle'];
      return bigItems.includes(lowerItem) ? 'Yes' : 'No';
    }
    
    if (lowerQuestion.includes('small') || lowerQuestion.includes('tiny')) {
      const smallItems = ['coin', 'key', 'pencil', 'spoon', 'fork', 'scissors'];
      return smallItems.includes(lowerItem) ? 'Yes' : 'No';
    }

    // Material questions
    if (lowerQuestion.includes('metal')) {
      const metalItems = ['coin', 'key', 'scissors', 'spoon', 'fork', 'car'];
      return metalItems.includes(lowerItem) ? 'Yes' : 'No';
    }
    
    if (lowerQuestion.includes('wood') || lowerQuestion.includes('wooden')) {
      const woodItems = ['chair', 'table', 'door', 'pencil'];
      return woodItems.includes(lowerItem) ? 'Yes' : 'No';
    }

    // Location questions
    if (lowerQuestion.includes('kitchen')) {
      const kitchenItems = ['spoon', 'fork', 'plate', 'bowl', 'cup', 'bottle'];
      return kitchenItems.includes(lowerItem) ? 'Yes' : 'No';
    }
    
    if (lowerQuestion.includes('outside') || lowerQuestion.includes('outdoor')) {
      const outdoorItems = ['car', 'tree', 'flower', 'bicycle'];
      return outdoorItems.includes(lowerItem) ? 'Yes' : 'No';
    }

    // Function questions
    if (lowerQuestion.includes('eat') || lowerQuestion.includes('food')) {
      const edibleItems = ['apple', 'bread'];
      return edibleItems.includes(lowerItem) ? 'Yes' : 'No';
    }
    
    if (lowerQuestion.includes('sit') || lowerQuestion.includes('sitting')) {
      const sittableItems = ['chair', 'bed'];
      return sittableItems.includes(lowerItem) ? 'Yes' : 'No';
    }

    // Default responses for demonstration
    const randomResponses = ['Yes', 'No', 'I\'m not sure'];
    return randomResponses[Math.floor(Math.random() * randomResponses.length)];
  }, []);

  const handleQuestion = useCallback(async (question: string) => {
    if (gamePhase !== 'playing' || questionsUsed >= maxQuestions) return;

    setIsLoading(true);
    
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const response = simulateLLMResponse(question, secretItem);
    const newQuestionCount = questionsUsed + 1;
    
    const newEntry: GameEntry = {
      id: Date.now().toString(),
      type: 'question',
      content: question,
      response: response,
      questionNumber: newQuestionCount
    };

    setGameHistory(prev => [...prev, newEntry]);
    setQuestionsUsed(newQuestionCount);
    
    // Check if game should end
    if (newQuestionCount >= maxQuestions) {
      setGamePhase('lost');
      toast({
        title: "Game Over!",
        description: `You used all ${maxQuestions} questions. The item was: ${secretItem}`,
        variant: "destructive"
      });
    }
    
    setIsLoading(false);
  }, [gamePhase, questionsUsed, maxQuestions, simulateLLMResponse, secretItem]);

  const handleGuess = useCallback(async (guess: string) => {
    if (gamePhase !== 'playing') return;

    setIsLoading(true);
    
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const isCorrect = guess.toLowerCase().trim() === secretItem.toLowerCase();
    const response = isCorrect 
      ? `Correct! The item was indeed "${secretItem}". Well done!`
      : `No, that's not correct. The item was "${secretItem}".`;

    const newEntry: GameEntry = {
      id: Date.now().toString(),
      type: 'guess',
      content: guess,
      response: response,
      isCorrect
    };

    setGameHistory(prev => [...prev, newEntry]);
    setGamePhase(isCorrect ? 'won' : 'lost');
    
    toast({
      title: isCorrect ? "Congratulations!" : "Game Over!",
      description: response,
      variant: isCorrect ? "default" : "destructive"
    });
    
    setIsLoading(false);
  }, [gamePhase, secretItem]);

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
    handleQuestion,
    handleGuess,
    resetGame
  };
};