import React, { useState, KeyboardEvent } from 'react';
import { Send } from '@mui/icons-material';
import { useChat } from '../../contexts/ChatContext';


const ChatInput: React.FC = () => {
  const [input, setInput] = useState('');
  const { sendMessage, messages } = useChat();
  
  // Check if the last message is from assistant and still processing
  const isDisabled = messages.length > 0 && 
    messages[messages.length - 1].role === 'assistant' && 
    (messages[messages.length - 1].status === 'thinking' || 
     messages[messages.length - 1].status === 'typing');

  const handleSubmit = async () => {
    if (input.trim() && !isDisabled) {
      const userMessage = input.trim();
      setInput('');
      await sendMessage(userMessage);
    }
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="p-4 border-t border-white/[0.05]">
      <div className="flex items-center space-x-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={isDisabled ? "AI is responding..." : "Type a message..."}
          disabled={isDisabled}
          className="flex-1 p-2.5 rounded-lg text-white placeholder-gray-400
                     bg-slate-800/50 border border-white/[0.05]
                     focus:outline-none focus:ring-2 focus:ring-blue-500/20
                     disabled:opacity-50 disabled:cursor-not-allowed
                     transition-all duration-200"
        />
        <button
          onClick={handleSubmit}
          disabled={isDisabled || !input.trim()}
          className="p-2.5 rounded-lg text-gray-400 hover:text-white
                     bg-slate-800/50 hover:bg-slate-700/50
                     disabled:opacity-50 disabled:cursor-not-allowed
                     border border-white/[0.05]
                     transition-all duration-200
                     focus:outline-none focus:ring-2 focus:ring-blue-500/20"
        >
          <Send className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
};

export default ChatInput;