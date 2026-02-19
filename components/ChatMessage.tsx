
import React from 'react';

interface ChatBubbleProps {
  sender: string;
  text: string;
  isPlayer?: boolean;
  highlight?: boolean;
  fallacyType?: string;
  showReactions?: boolean;
  onReact?: (type: 'neutral' | 'fallacy') => void;
}

export const ChatBubble: React.FC<ChatBubbleProps> = ({ 
  sender, text, isPlayer, highlight, fallacyType, showReactions, onReact 
}) => {
  const isTarget = highlight;
  
  const bubbleClass = isPlayer 
    ? "bg-indigo-600 text-white rounded-br-none ml-auto" 
    : isTarget 
      ? "bg-amber-50 text-gray-900 border-2 border-amber-400 rounded-bl-none ring-4 ring-amber-100"
      : "bg-white text-gray-800 rounded-bl-none border border-gray-100";
  
  const containerClass = isPlayer ? "flex flex-col items-end" : "flex flex-col items-start";
  const nameClass = isPlayer ? "hidden" : `text-[10px] font-bold mb-1 ml-1 uppercase tracking-wider ${isTarget ? 'text-amber-700' : 'text-gray-500'}`;

  return (
    <div className={`mb-4 max-w-[85%] ${containerClass} animate-fade-in-up transition-all duration-500 relative group`}>
      {!isPlayer && (
        <div className="flex items-center gap-1.5">
          <span className={nameClass}>{sender}</span>
          {isTarget && (
            <span className="text-[9px] bg-amber-400 text-amber-900 px-1.5 py-0.5 rounded-full font-bold animate-pulse">
              FALLACY DETECTED
            </span>
          )}
        </div>
      )}
      
      <div className={`px-4 py-2.5 rounded-2xl shadow-sm text-sm leading-relaxed relative ${bubbleClass}`}>
        {text}
        
        {isTarget && fallacyType && (
          <div className="mt-2 pt-2 border-t border-amber-200 text-[11px] font-medium text-amber-800 italic">
            <i className="fas fa-exclamation-triangle mr-1"></i>
            This is a {fallacyType} fallacy.
          </div>
        )}
      </div>

      {showReactions && !isPlayer && (
        <div className="flex gap-2 mt-2 ml-1 animate-bounce-short">
          <button 
            onClick={() => onReact?.('neutral')}
            className="w-10 h-10 bg-white border border-gray-200 rounded-full flex items-center justify-center shadow-md hover:bg-emerald-50 hover:border-emerald-300 transition-all active:scale-90"
            title="Neutral / No Fallacy"
          >
            👍
          </button>
          <button 
            onClick={() => onReact?.('fallacy')}
            className="w-10 h-10 bg-white border border-gray-200 rounded-full flex items-center justify-center shadow-md hover:bg-rose-50 hover:border-rose-300 transition-all active:scale-90"
            title="Logical Fallacy!"
          >
            ❗
          </button>
        </div>
      )}
    </div>
  );
};

const style = document.createElement('style');
style.innerHTML = `
  @keyframes fadeInUp {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes bounceShort {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-3px); }
  }
  .animate-fade-in-up { animation: fadeInUp 0.4s ease-out forwards; }
  .animate-bounce-short { animation: bounceShort 1.5s ease-in-out infinite; }
`;
document.head.appendChild(style);
