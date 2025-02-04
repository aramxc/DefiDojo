import React, { useState, KeyboardEvent } from 'react';
import { Send } from '@mui/icons-material';
import { useNebula } from '../../hooks/useNebula';

const ChatInput: React.FC = () => {
  const [input, setInput] = useState('');
  const { sendMessage, isLoading } = useNebula();

  const handleSubmit = async () => {
    if (input.trim() && !isLoading) {
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
    <div className="p-4 border-t dark:border-gray-700">
      <div className="flex items-center space-x-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type a message..."
          disabled={isLoading}
          className="flex-1 p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 
                     disabled:opacity-50 disabled:cursor-not-allowed"
        />
        <button
          onClick={handleSubmit}
          disabled={isLoading}
          className="p-2 bg-blue-600 hover:bg-blue-700 rounded-lg 
                     disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Send className="h-5 w-5 text-white" />
        </button>
      </div>
    </div>
  );
};

export default ChatInput;