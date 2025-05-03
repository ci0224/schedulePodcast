import React from 'react';

interface StyledSpeechTextProps {
  text: string;
  visitReasons: string[];
}

const StyledSpeechText: React.FC<StyledSpeechTextProps> = ({ text, visitReasons }) => {
  // Regular expressions to match different parts of the text
  const timeRegex = /\b(?:[0-1]?[0-9]|2[0-3]):[0-5][0-9](?:\s?[AP]M)?\b/g;  // Matches times like "1:00 PM", "8:30", "13:00"
  const nameRegex = /([A-Z][a-z]+ [A-Z][a-z]+)/g;  // Matches names like "John Smith"

  // Function to split text and wrap matches in styled spans
  const formatText = (text: string) => {
    let formattedText = text;

    // Replace times with green pills
    formattedText = formattedText.replace(timeRegex, (match) => 
      `<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">${match}</span>`
    );

    // Replace names with yellow pills
    formattedText = formattedText.replace(nameRegex, (match) => 
      `<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">${match}</span>`
    );

    // Replace visit purposes with blue pills using the actual reasons
    visitReasons.forEach(reason => {
      const escapedReason = reason.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // Escape special regex characters
      const regex = new RegExp(`for ${escapedReason}`, 'gi');
      formattedText = formattedText.replace(regex, (match) => 
        `<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">${match}</span>`
      );
    });

    return formattedText;
  };

  return (
    <div 
      className="prose max-w-none"
      dangerouslySetInnerHTML={{ __html: formatText(text) }}
    />
  );
};

export default StyledSpeechText; 