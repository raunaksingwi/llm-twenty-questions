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
    <Card className="flex flex-col h-[600px] bg-gradient-to-b from-card/50 to-card">
      {/* Chat Messages */}
      <div className="flex-1 p-6 overflow-y-auto space-y-4">
        {entries.length === 0 && (
          <div className="text-center text-muted-foreground py-8">
            <p className="text-lg mb-2">🎯 Ready to play!</p>
            <p>Ask yes/no questions or make a guess to find the item.</p>
          </div>
        )}
        
        {entries.map((entry) => (
          <div key={entry.id} className="space-y-3">
            {/* User Message */}
            <div className="flex justify-end">
              <div className="max-w-[80%] bg-primary text-primary-foreground rounded-lg px-4 py-2">
                <div className="flex items-center gap-2 mb-1">
                  {entry.type === 'question' ? (
                    <span className="text-xs opacity-80">Question #{entry.questionNumber}</span>
                  ) : (
                    <span className="text-xs opacity-80">Guess</span>
                  )}
                </div>
                <p>{entry.content}</p>
              </div>
            </div>
            
            {/* AI Response */}
            <div className="flex justify-start">
              <div className="max-w-[80%] bg-muted rounded-lg px-4 py-2">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs text-muted-foreground">Game Host</span>
                  {entry.type === 'guess' && entry.isCorrect !== undefined && (
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      entry.isCorrect 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' 
                        : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                    }`}>
                      {entry.isCorrect ? '🎉 Correct!' : '❌ Incorrect'}
                    </span>
                  )}
                </div>
                <p>{entry.response}</p>
              </div>
            </div>
          </div>
        ))}
        
        {disabled && (
          <div className="flex justify-start">
            <div className="bg-muted rounded-lg px-4 py-2 flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm text-muted-foreground">Thinking...</span>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <div className="border-t p-4">
        <div className="mb-2 text-sm text-muted-foreground text-center">
          Questions used: {questionsUsed}/{maxQuestions}
        </div>
        
        {/* Voice Controls */}
        <div className="flex justify-center gap-2 mb-3">
          {speechSupported && (
            <Button
              type="button"
              variant={isListening ? "destructive" : "outline"}
              size="sm"
              onClick={handleMicClick}
              disabled={disabled}
              className="flex items-center gap-2"
            >
              {isListening ? (
                <>
                  <MicOff className="h-4 w-4" />
                  Stop Listening
                </>
              ) : (
                <>
                  <Mic className="h-4 w-4" />
                  Voice Input
                </>
              )}
            </Button>
          )}
          
          {ttsSupported && (
            <Button
              type="button"
              variant={voiceEnabled ? "outline" : "secondary"}
              size="sm"
              onClick={toggleVoice}
              className="flex items-center gap-2"
            >
              {voiceEnabled ? (
                <>
                  <Volume2 className="h-4 w-4" />
                  Voice On
                </>
              ) : (
                <>
                  <VolumeX className="h-4 w-4" />
                  Voice Off
                </>
              )}
            </Button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={isListening ? "Listening... speak now" : "Ask a yes/no question or make a guess..."}
            disabled={disabled}
            className={`flex-1 ${isListening ? 'border-red-500 bg-red-50 dark:bg-red-950/20' : ''}`}
          />
          <Button 
            type="submit" 
            disabled={disabled || !message.trim()}
            size="icon"
            className="shrink-0"
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
        
        <div className="mt-2 space-y-1">
          <p className="text-xs text-muted-foreground text-center">
            Ask questions like "Is it big?" or make a guess like "Is it a chair?" or just "chair"
          </p>
          {(speechSupported || ttsSupported) && (
            <p className="text-xs text-muted-foreground text-center">
              {speechSupported && ttsSupported && "🎤 Voice input and 🔊 audio responses available"}
              {speechSupported && !ttsSupported && "🎤 Voice input available"}
              {!speechSupported && ttsSupported && "🔊 Audio responses available"}
            </p>
          )}
          {isListening && (
            <p className="text-xs text-red-600 dark:text-red-400 text-center animate-pulse">
              🎤 Listening... speak your question or guess
            </p>
          )}
          {isSpeaking && (
            <p className="text-xs text-blue-600 dark:text-blue-400 text-center animate-pulse">
              🔊 Speaking...
            </p>
          )}
        </div>
      </div>
    </Card>
  );
};