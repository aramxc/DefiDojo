import React, { useRef, useEffect } from 'react';
import { useChat } from '../../contexts/ChatContext';
import { useNebula } from '../../hooks/useNebula';
import ChatInput from './ChatInput';
import { X } from '@mui/icons-material';

const ChatWindow: React.FC = () => {
  const { isOpen, toggleChat } = useChat();
  const { messages, error } = useNebula();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-24 right-6 w-96 h-[600px] bg-white dark:bg-gray-800 
                    rounded-lg shadow-xl flex flex-col z-50">
      <div className="flex justify-between items-center p-4 border-b dark:border-gray-700">
        <h3 className="text-lg font-semibold">AI Assistant</h3>
        <button
          onClick={toggleChat}
          className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
        >
          <X className="h-6 w-6" />
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] p-3 rounded-lg ${
                message.role === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700'
              }`}
            >
              {message.content}
              {message.status === 'typing' && (
                <span className="ml-2 animate-pulse">...</span>
              )}
            </div>
          </div>
        ))}
        {error && (
          <div className="text-red-500 text-center p-2">
            {error.message}
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      
      <ChatInput />
    </div>
  );
};

export default ChatWindow;