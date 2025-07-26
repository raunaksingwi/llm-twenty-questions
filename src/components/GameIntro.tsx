import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Play, Lightbulb, Mic, Volume2 } from "lucide-react";
import { useTextToSpeech } from "@/hooks/useTextToSpeech";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import { useEffect } from "react";

interface GameIntroProps {
  onStartGame: () => void;
  isLoading: boolean;
}

export const GameIntro = ({ onStartGame, isLoading }: GameIntroProps) => {
  const { speak, isSupported: ttsSupported } = useTextToSpeech();
  const { isSupported: speechSupported } = useSpeechRecognition();
  
  // Speak welcome message when component mounts
  useEffect(() => {
    if (ttsSupported) {
      const welcomeMessage = "Welcome to Guess in 20! I'm thinking of a common everyday item. You can ask yes or no questions to figure out what it is. You have 20 questions maximum. Ready to start?";
    }
  }, [ttsSupported, speak]);

  return (
    <div className="w-full max-w-sm mx-auto">
      {/* Hero Section */}
      <div className="text-center mb-8">
        <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center shadow-lg">
          <span className="text-2xl">🤔</span>
        </div>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2">
          20 Questions
        </h1>
        <p className="text-slate-600 dark:text-slate-400 text-sm">
          Can you guess what I'm thinking of?
        </p>
      </div>

      {/* Game Rules */}
      <div className="space-y-4 mb-8">
        <div className="bg-blue-50 dark:bg-blue-950/30 rounded-2xl p-4 border border-blue-100 dark:border-blue-800">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
              <Lightbulb className="h-4 w-4 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-blue-900 dark:text-blue-100 text-sm mb-1">
                How to Play
              </h3>
              <p className="text-blue-700 dark:text-blue-300 text-xs leading-relaxed">
                I'm thinking of something you might find around you. Ask yes or no questions to figure out what it is!
              </p>
            </div>
          </div>
        </div>

        <div className="bg-purple-50 dark:bg-purple-950/30 rounded-2xl p-4 border border-purple-100 dark:border-purple-800">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold text-xs">
              20
            </div>
            <div>
              <h3 className="font-semibold text-purple-900 dark:text-purple-100 text-sm mb-1">
                You Have 20 Questions
              </h3>
              <p className="text-purple-700 dark:text-purple-300 text-xs leading-relaxed">
                Use them wisely! You can also make a guess at any time.
              </p>
            </div>
          </div>
        </div>

      </div>
      
      {/* Start Button */}
      <button
        onClick={onStartGame}
        disabled={isLoading}
        className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold py-4 px-6 rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:transform-none flex items-center justify-center gap-2"
      >
        {isLoading ? (
          <>
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            Thinking of something...
          </>
        ) : (
          <>
            <Play className="h-5 w-5" />
            Let's Play!
          </>
        )}
      </button>
    </div>
  );
};