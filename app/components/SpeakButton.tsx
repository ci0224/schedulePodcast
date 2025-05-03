import React from 'react';

interface SpeakButtonProps {
  text: string;
}

const SpeakButton: React.FC<SpeakButtonProps> = ({ text }) => {
  const speak = () => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    speechSynthesis.speak(utterance);
  };

  return (
    <button
      onClick={speak}
      className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
    >
      <span className="mr-2">🔊</span>
      Speak
    </button>
  );
};

export default SpeakButton; 