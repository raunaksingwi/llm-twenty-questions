import { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Mic, MicOff, Send, Volume2, VolumeX } from 'lucide-react';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import { useTextToSpeech } from '@/hooks/useTextToSpeech';
import { GameEntry } from '@/types/game';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface ChatInterfaceProps {
  entries: GameEntry[];
  onSubmitMessage: (message: string) => void;
  disabled: boolean;
  questionsUsed: number;
  maxQuestions: number;
  voiceEnabled?: boolean;
  onVoiceToggle?: () => void;
  onGiveUp?: () => void;
}

export const ChatInterface = ({ 
  entries, 
  onSubmitMessage, 
  disabled, 
  questionsUsed, 
  maxQuestions,
  voiceEnabled = true,
  onVoiceToggle,
  onGiveUp
}: ChatInterfaceProps) => {
  const [message, setMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [showGiveUpDialog, setShowGiveUpDialog] = useState(false);
  
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

  // Only update input field with transcript when not using hold-to-talk
  const [isHoldToTalk, setIsHoldToTalk] = useState(false);

  // Clear message field whenever we're in hold-to-talk mode
  useEffect(() => {
    if (isHoldToTalk || isListening) {
      setMessage('');
    }
  }, [isHoldToTalk, isListening]);

  // Auto-speak new AI responses
  useEffect(() => {
    if (voiceEnabled && ttsSupported && entries.length > 0) {
      const lastEntry = entries[entries.length - 1];
      if (lastEntry.response) {
        speak(lastEntry.response);
      }
    }
  }, [entries, voiceEnabled, ttsSupported, speak]);

  // Auto-focus input on mount and after message submission
  useEffect(() => {
    if (!disabled && !isListening) {
      inputRef.current?.focus();
    }
  }, [disabled, isListening, message]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      stopSpeaking(); // Stop any current speech
      onSubmitMessage(message.trim());
      setMessage('');
      setShowSendButton(false); // Reset button to mic icon
      resetTranscript();
      // Input will auto-focus due to the useEffect above
    }
  };

  const handleMicStart = (e: React.MouseEvent | React.TouchEvent) => {
    // Prevent any default behavior (like focusing nearby elements)
    e.preventDefault();
    e.stopPropagation();
    
    if (!disabled && !isListening && !isHoldToTalk) {
      stopSpeaking(); // Stop any current speech before listening
      resetTranscript();
      setMessage(''); // Clear the input field
      setIsHoldToTalk(true);
      
      // Blur any focused input to hide mobile keyboard and prevent interference
      if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
      }
      
      // Force focus away from button to prevent OS interference
      (e.target as HTMLElement).blur();
      
      startListening();
    }
  };

  const handleMicEnd = (e: React.MouseEvent | React.TouchEvent) => {
    // Prevent any default behavior
    e.preventDefault();
    e.stopPropagation();

    if (isListening || isHoldToTalk) {
      // Capture the current transcript before stopping
      const currentTranscript = transcript.trim();
      
      stopListening();
      
      // Small delay to capture any final speech recognition results
      setTimeout(() => {
        // Use the latest transcript or the one we captured
        const finalTranscript = transcript.trim() || currentTranscript;
        
        setIsHoldToTalk(false);
        setMessage(''); // Keep input field clear
        
        if (finalTranscript && !disabled) {
          stopSpeaking();
          onSubmitMessage(finalTranscript);
        }
        resetTranscript();
      }, 500);
    } else {
      // Ensure state is clean even if we somehow get here without listening
      setIsHoldToTalk(false);
      setMessage('');
    }
  };

  // Add transition state for button
  const [showSendButton, setShowSendButton] = useState(false);

  // Update message state handler to control button transition
  const handleMessageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newMessage = e.target.value;
    setMessage(newMessage);
    setShowSendButton(newMessage.trim().length > 0);
  };

  const handleGiveUp = () => {
    setShowGiveUpDialog(false);
    onGiveUp?.();
  };

  return (
    <>
      <AlertDialog open={showGiveUpDialog} onOpenChange={setShowGiveUpDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to give up?</AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>You've come so far! The answer might be just one question away.</p>
              <p>Remember, you can ask about:</p>
              <ul className="list-disc pl-4 space-y-1">
                <li>What it's made of</li>
                <li>Where you might find it</li>
                <li>What it's used for</li>
                <li>Its size or shape</li>
              </ul>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep Trying</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleGiveUp}
              className="bg-red-500 hover:bg-red-600"
            >
              Give Up
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="flex flex-col h-full">
        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto min-h-0">
          <div className="px-4 py-4 space-y-4">
            {entries.map((entry, index) => (
              <div
                key={entry.id}
                className={`flex flex-col gap-1.5 ${
                  entry.questionNumber === questionsUsed ? 'animate-fade-in' : ''
                }`}
              >
                {/* User's message - right side */}
                <div className="flex items-end gap-2 justify-end">
                  <div className="flex-1 max-w-[85%] flex flex-row-reverse">
                    <div className="bg-gradient-to-r from-blue-500 to-purple-600 px-4 py-2.5 rounded-2xl rounded-tr-md shadow-lg">
                      <p className="text-white text-[15px] leading-[20px] font-medium">{entry.content}</p>
                    </div>
                  </div>
                </div>
                
                {/* AI's response - left side */}
                {entry.response && (
                  <div className="flex items-end gap-2 group">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center flex-shrink-0 mb-1 shadow-md">
                      <span className="text-sm">🤖</span>
                    </div>
                    <div className="flex-1 max-w-[85%] flex flex-row gap-1">
                      <div className={`bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700 px-4 py-2.5 rounded-2xl rounded-tl-md shadow-lg border border-slate-200 dark:border-slate-600 break-words ${
                        entry.type === 'guess' ? '' : 'max-w-fit'
                      }`}>
                        <p className={`text-[15px] leading-[20px] text-slate-800 dark:text-slate-100 ${
                          entry.type === 'guess' && entry.isCorrect ? 'font-semibold text-green-700 dark:text-green-400' : ''
                        }`}>
                          {entry.response}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
            
            {entries.length === 0 && (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center shadow-lg">
                  <span className="text-2xl">🤖</span>
                </div>
                <p className="text-slate-700 dark:text-slate-300 text-[15px] mb-2 font-medium">I'm ready!</p>
                <p className="text-slate-500 dark:text-slate-500 text-xs">Ask me yes/no questions or make a guess</p>
              </div>
            )}
            
            {disabled && (
              <div className="flex justify-start px-4">
                <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Area */}
        <div className="flex-none border-t border-slate-200 dark:border-slate-700 bg-gradient-to-r from-slate-50/80 to-blue-50/80 dark:from-slate-900/80 dark:to-slate-800/80 backdrop-blur-sm p-4">
          {/* Question Counter */}
          <div className="text-center mb-4">
            <div className="inline-flex items-center gap-4">
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-slate-800 dark:to-slate-700 rounded-full px-4 py-2 shadow-md border border-blue-200 dark:border-slate-600">
                <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full"></div>
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  {questionsUsed} of {maxQuestions} questions
                </span>
              </div>
              
              {ttsSupported && (
                <button
                  type="button"
                  onClick={onVoiceToggle}
                  className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-blue-100 to-purple-100 dark:from-slate-800 dark:to-slate-700 text-slate-700 dark:text-slate-300 hover:from-blue-200 hover:to-purple-200 dark:hover:from-slate-700 dark:hover:to-slate-600 transition-all shadow-md border border-blue-200 dark:border-slate-600"
                  title={voiceEnabled ? "Voice On" : "Voice Off"}
                >
                  {voiceEnabled ? (
                    <Volume2 className="h-4 w-4" />
                  ) : (
                    <VolumeX className="h-4 w-4" />
                  )}
                </button>
              )}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="flex gap-3">
            <div className="flex-1 relative">
              <Input
                ref={inputRef}
                type="text"
                value={message}
                onChange={handleMessageChange}
                placeholder={isListening ? "🎤 Listening..." : "Ask a question or make a guess..."}
                disabled={disabled}
                className={`${
                  isListening 
                    ? 'border-red-300 bg-red-50 dark:bg-red-950/20 dark:border-red-800' 
                    : 'border-blue-200 dark:border-slate-600 bg-white dark:bg-slate-800'
                } ${disabled ? 'opacity-50' : ''} rounded-xl shadow-md focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500`}
              />
            </div>
            <button
              type={showSendButton ? "submit" : "button"}
              disabled={disabled || (showSendButton && !message.trim())}
              onMouseDown={!showSendButton ? handleMicStart : undefined}
              onMouseUp={!showSendButton ? handleMicEnd : undefined}
              onMouseLeave={!showSendButton ? handleMicEnd : undefined}
              onTouchStart={!showSendButton ? handleMicStart : undefined}
              onTouchEnd={!showSendButton ? handleMicEnd : undefined}
              onTouchCancel={!showSendButton ? handleMicEnd : undefined}
              onContextMenu={(e) => !showSendButton && e.preventDefault()} // Prevent long-press menu on mobile
              className={`w-12 h-12 rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:transform-none flex items-center justify-center ${
                isListening 
                  ? 'bg-gradient-to-r from-red-500 to-red-600'
                  : showSendButton
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600'
                    : 'bg-gradient-to-r from-green-500 to-teal-600'
              } text-white`}
            >
              {isListening ? (
                <MicOff className="h-5 w-5" />
              ) : showSendButton ? (
                <Send className="h-5 w-5" />
              ) : (
                <Mic className="h-5 w-5" />
              )}
            </button>
          </form>

          {/* Status Messages */}
          <div className="mt-3 text-center space-y-1">
            {isListening && (
              <p className="text-xs text-red-600 dark:text-red-400 animate-pulse font-medium">
                🎤 Keep holding to talk...
              </p>
            )}
            {isSpeaking && (
              <p className="text-xs text-blue-600 dark:text-blue-400 animate-pulse font-medium">
                🔊 Speaking...
              </p>
            )}
            {!isListening && !isSpeaking && (
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Try: "Is it a household item?" or "Is it an apple?"
              </p>
            )}
          </div>
        </div>
      </div>
    </>
  );
};