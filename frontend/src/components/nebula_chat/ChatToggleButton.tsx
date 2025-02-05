import React from 'react';
import { useChat } from '../../contexts/ChatContext';
import { Chat } from '@mui/icons-material';

const ChatButton: React.FC = () => {
  const { toggleChat, isOpen } = useChat();

  return (
    <button
      onClick={toggleChat}
      className="fixed bottom-6 right-6 p-4 
                 bg-gradient-to-r from-blue-400 via-cyan-300 to-teal-400
                 hover:opacity-90
                 rounded-full shadow-lg 
                 shadow-[0_0_12px_rgba(34,211,238,0.25)]
                 hover:shadow-[0_0_20px_rgba(34,211,238,0.35)]
                 transition-all duration-200 z-50"
    >
      <Chat className="h-6 w-6 text-white" />
    </button>
  );
};

export default ChatButton;