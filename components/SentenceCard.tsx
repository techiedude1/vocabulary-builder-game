
import React from 'react';
import { SentenceStatus } from '../types';

interface SentenceCardProps {
  text: string;
  onClick: () => void;
  status: SentenceStatus;
  isDisabled: boolean;
}

const SentenceCard: React.FC<SentenceCardProps> = ({ text, onClick, status, isDisabled }) => {
  // Updated baseStyle: text-sm sm:text-base -> text-base sm:text-lg font-medium
  let baseStyle = "p-4 rounded-lg shadow-md transition-all duration-200 ease-in-out text-gray-700 text-base sm:text-lg font-medium";
  let statusStyle = "";

  switch (status) {
    case 'selected':
      statusStyle = "bg-yellow-200 ring-2 ring-yellow-500 scale-105";
      break;
    case 'correct':
      statusStyle = "bg-green-200 ring-2 ring-green-600 text-green-800 font-semibold";
      break;
    case 'incorrect':
      statusStyle = "bg-red-200 ring-2 ring-red-600 text-red-800";
      break;
    case 'disabled':
      statusStyle = "bg-gray-200 opacity-70 cursor-not-allowed";
      break;
    case 'default':
    default:
      statusStyle = "bg-sky-50 hover:bg-sky-200 cursor-pointer";
      break;
  }

  if (isDisabled && status !== 'correct' && status !== 'incorrect') { // Keep correct/incorrect styles even if disabled for showing results
    statusStyle = "bg-gray-200 opacity-60 cursor-not-allowed";
  } else if (isDisabled && (status === 'correct' || status === 'incorrect')) {
    // don't override correct/incorrect, but ensure no hover effect
     baseStyle += " cursor-default";
  } else if (!isDisabled && status === 'default') {
     baseStyle += " hover:shadow-lg hover:scale-102";
  }


  return (
    <button
      onClick={onClick}
      disabled={isDisabled}
      className={`${baseStyle} ${statusStyle} w-full text-left`}
      aria-label={`Sentence option: ${text.replace("_____", "blank")}`}
    >
      {text.split("_____").map((part, index, arr) => (
        <React.Fragment key={index}>
          {part}
          {index < arr.length - 1 && <span className="font-bold text-sky-600">_____</span>}
        </React.Fragment>
      ))}
    </button>
  );
};

export default SentenceCard;
