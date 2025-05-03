import React, { useState, useEffect } from 'react';

interface SpeakButtonProps {
  text: string;
}

const SpeakButton: React.FC<SpeakButtonProps> = ({ text }) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    // Cleanup function to stop speech when component unmounts
    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  const speak = () => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    
    utterance.onend = () => {
      setIsSpeaking(false);
      setIsPaused(false);
    };

    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
    setIsPaused(false);
  };

  const pause = () => {
    if (isSpeaking) {
      if (isPaused) {
        window.speechSynthesis.resume();
        setIsPaused(false);
      } else {
        window.speechSynthesis.pause();
        setIsPaused(true);
      }
    }
  };

  const stop = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    setIsPaused(false);
  };

  return (
    <div className="flex items-center space-x-2">
      <button
        onClick={speak}
        disabled={isSpeaking && !isPaused}
        className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
      >
        <span className="mr-2">🔊</span>
        Speak
      </button>
      {isSpeaking && (
        <>
          <button
            onClick={pause}
            className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <span className="mr-2">{isPaused ? '▶️' : '⏸️'}</span>
            {isPaused ? 'Resume' : 'Pause'}
          </button>
          <button
            onClick={stop}
            className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <span className="mr-2">⏹️</span>
            Stop
          </button>
        </>
      )}
    </div>
  );
};

export default SpeakButton; 