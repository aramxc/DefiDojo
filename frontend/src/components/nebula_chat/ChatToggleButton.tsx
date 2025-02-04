import React from 'react';
import { useChat } from '../../contexts/ChatContext';
import { Chat } from '@mui/icons-material';

const ChatButton: React.FC = () => {
  const { toggleChat, isOpen } = useChat();

  return (
    <button
      onClick={toggleChat}
      className="fixed bottom-6 right-6 p-4 bg-blue-600 hover:bg-blue-700 
                 rounded-full shadow-lg transition-all duration-200 z-50"
    >
      <Chat className="h-6 w-6 text-white" />
    </button>
  );
};

export default ChatButton;