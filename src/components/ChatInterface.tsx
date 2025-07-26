import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Send, Loader2, Mic, MicOff, Volume2, VolumeX } from 'lucide-react';
import { GameEntry } from '@/types/game';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import { useTextToSpeech } from '@/hooks/useTextToSpeech';

interface ChatInterfaceProps {
  entries: GameEntry[];
  onSubmitMessage: (message: string) => void;
  disabled: boolean;
  questionsUsed: number;
  maxQuestions: number;
}

export const ChatInterface = ({ entries, onSubmitMessage, disabled, questionsUsed, maxQuestions }: ChatInterfaceProps) => {
  const [message, setMessage] = useState('');
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Voice hooks
  const { 
    isListening, 
    transcript, 
    isSupported: speechSupported, 
    startListening, 
    stopListening, 
    resetTranscript 
  } = useSpeechRecognition();
  
  const { 
    isSpeaking, 
    isSupported: ttsSupported, 
    speak, 
    stop: stopSpeaking 
  } = useTextToSpeech();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [entries]);

  // Handle speech recognition results
  useEffect(() => {
    if (transcript) {
      setMessage(transcript);
    }
  }, [transcript]);

  // Auto-speak new AI responses
  useEffect(() => {
    if (voiceEnabled && ttsSupported && entries.length > 0) {
      const lastEntry = entries[entries.length - 1];
      if (lastEntry.response) {
        speak(lastEntry.response);
      }
    }
  }, [entries, voiceEnabled, ttsSupported, speak]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      stopSpeaking(); // Stop any current speech
      onSubmitMessage(message.trim());
      setMessage('');
      resetTranscript();
    }
  };

  const handleMicClick = () => {
    if (isListening) {
      stopListening();
    } else {
      stopSpeaking(); // Stop any current speech before listening
      resetTranscript();
      setMessage('');
      startListening();
    }
  };

  const toggleVoice = () => {
    if (voiceEnabled) {
      stopSpeaking();
    }
    setVoiceEnabled(!voiceEnabled);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {entries.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
              <span className="text-2xl">🤔</span>
            </div>
            <p className="text-slate-600 dark:text-slate-400 text-sm mb-2">I'm ready!</p>
            <p className="text-slate-500 dark:text-slate-500 text-xs">Ask me yes/no questions or make a guess</p>
          </div>
        )}
        
        {entries.map((entry) => (
          <div key={entry.id} className="space-y-3">
            {/* User Message */}
            <div className="flex justify-end">
              <div className="max-w-[85%] bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-2xl rounded-tr-md px-4 py-3 shadow-sm">
                {entry.questionNumber && (
                  <div className="text-xs opacity-90 mb-1">
                    Question #{entry.questionNumber}
                  </div>
                )}
                <p className="text-sm">{entry.content}</p>
              </div>
            </div>
            
            {/* AI Response */}
            <div className="flex justify-start">
              <div className="max-w-[85%] bg-slate-100 dark:bg-slate-800 rounded-2xl rounded-tl-md px-4 py-3 shadow-sm">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs text-slate-500 dark:text-slate-400">🤖</span>
                  {entry.type === 'guess' && entry.isCorrect !== undefined && (
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                      entry.isCorrect 
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                        : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                    }`}>
                      {entry.isCorrect ? '🎉 Correct!' : '❌ Wrong'}
                    </span>
                  )}
                </div>
                <p className="text-sm text-slate-700 dark:text-slate-300">{entry.response}</p>
              </div>
            </div>
          </div>
        ))}
        
        {disabled && (
          <div className="flex justify-start">
            <div className="bg-slate-100 dark:bg-slate-800 rounded-2xl rounded-tl-md px-4 py-3 flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-sm text-slate-600 dark:text-slate-400">Thinking...</span>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm p-4">
        {/* Question Counter */}
        <div className="text-center mb-4">
          <div className="inline-flex items-center gap-2 bg-slate-100 dark:bg-slate-800 rounded-full px-4 py-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
              {questionsUsed} of {maxQuestions} questions
            </span>
          </div>
        </div>
        
        {/* Voice Controls */}
        {(speechSupported || ttsSupported) && (
          <div className="flex justify-center gap-2 mb-4">
            {speechSupported && (
              <button
                type="button"
                onClick={handleMicClick}
                disabled={disabled}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  isListening 
                    ? 'bg-red-500 text-white shadow-lg' 
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {isListening ? (
                  <>
                    <MicOff className="h-4 w-4" />
                    Stop
                  </>
                ) : (
                  <>
                    <Mic className="h-4 w-4" />
                    Voice
                  </>
                )}
              </button>
            )}
            
            {ttsSupported && (
              <button
                type="button"
                onClick={toggleVoice}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  voiceEnabled 
                    ? 'bg-green-500 text-white shadow-lg' 
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {voiceEnabled ? (
                  <>
                    <Volume2 className="h-4 w-4" />
                    Sound On
                  </>
                ) : (
                  <>
                    <VolumeX className="h-4 w-4" />
                    Sound Off
                  </>
                )}
              </button>
            )}
          </div>
        )}

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="flex gap-3">
          <div className="flex-1 relative">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={isListening ? "🎤 Listening..." : "Ask a question or make a guess..."}
              disabled={disabled}
              className={`w-full px-4 py-3 rounded-2xl border-2 transition-all text-sm ${
                isListening 
                  ? 'border-red-300 bg-red-50 dark:bg-red-950/20 dark:border-red-800' 
                  : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:border-blue-400 focus:outline-none'
              } ${disabled ? 'opacity-50' : ''}`}
            />
          </div>
          <button
            type="submit"
            disabled={disabled || !message.trim()}
            className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:transform-none flex items-center justify-center"
          >
            <Send className="h-5 w-5" />
          </button>
        </form>
        
        {/* Status Messages */}
        <div className="mt-3 text-center space-y-1">
          {isListening && (
            <p className="text-xs text-red-600 dark:text-red-400 animate-pulse">
              🎤 Listening... speak now
            </p>
          )}
          {isSpeaking && (
            <p className="text-xs text-blue-600 dark:text-blue-400 animate-pulse">
              🔊 Speaking...
            </p>
          )}
          {!isListening && !isSpeaking && (
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Try: "Is it bigger than a book?" or "Is it an apple?"
            </p>
          )}
        </div>
      </div>
    </div>
  );
};