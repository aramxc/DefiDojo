import React, { createContext, useContext, useState, ReactNode } from 'react';
import { useNebula, UseNebulaReturn } from '../hooks/useNebula';

interface ChatContextType extends UseNebulaReturn {
  isOpen: boolean;
  toggleChat: () => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const toggleChat = () => setIsOpen(prev => !prev);
  
  // Include all Nebula functionality
  const nebulaState = useNebula();

  return (
    <ChatContext.Provider value={{ 
      isOpen, 
      toggleChat,
      ...nebulaState 
    }}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};