import { useCallback } from 'react';

export const useAudioManager = () => {
  const playSound = useCallback((type: 'yes' | 'no' | 'win' | 'lose') => {
    // Create simple audio tones using Web Audio API
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    // Set frequency and duration based on sound type
    switch (type) {
      case 'yes':
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime); // Higher pitch for positive
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
        break;
      case 'no':
        oscillator.frequency.setValueAtTime(400, audioContext.currentTime); // Lower pitch for negative
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
        break;
      case 'win':
        // Happy ascending tones
        oscillator.frequency.setValueAtTime(523, audioContext.currentTime); // C5
        oscillator.frequency.setValueAtTime(659, audioContext.currentTime + 0.2); // E5
        oscillator.frequency.setValueAtTime(784, audioContext.currentTime + 0.4); // G5
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.6);
        break;
      case 'lose':
        // Sad descending tone
        oscillator.frequency.setValueAtTime(400, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(200, audioContext.currentTime + 0.5);
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
        break;
    }
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + (type === 'win' ? 0.6 : 0.5));
  }, []);

  return { playSound };
};