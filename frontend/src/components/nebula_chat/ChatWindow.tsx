import React, { useRef, useEffect } from 'react';
import { useChat } from '../../contexts/ChatContext';
import { useNebula } from '../../hooks/useNebula';
import ChatInput from './ChatInput';
import { Close } from '@mui/icons-material';

const ChatWindow: React.FC = () => {
  const { isOpen, toggleChat, messages, error, isLoading, presence } = useChat();
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
    <div className="fixed bottom-24 right-6 w-[30%] h-[75%] bg-slate-900 
                    rounded-lg shadow-xl flex flex-col z-50
                    border border-white/[0.05]">
      <div className="flex justify-between items-center p-4 border-b border-white/[0.05]">
        <h3 className="text-lg font-bold bg-gradient-to-r from-blue-400 via-cyan-300 to-teal-400 
                    bg-clip-text text-transparent">
          AI Assistant
        </h3>
        <button
          onClick={toggleChat}
          className="p-2 rounded-lg text-gray-400 hover:text-white 
                     hover:bg-slate-700/50 transition-all duration-200"
        >
          <Close className="h-5 w-5" />
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] p-3 rounded-lg ${
                message.role === 'user'
                  ? 'bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-white'
                  : 'bg-slate-800/50 text-gray-100'
              }`}
            >
              {message.content}
            </div>
          </div>
        ))}
        {presence.isThinking && (
          <div className="flex justify-start">
            <div className="max-w-[80%] p-3 rounded-lg bg-slate-800/50 text-gray-100">
              <span className="inline-flex items-center">
                <span className="mr-2">{presence.currentAction}</span>
                <span className="typing-dots">
                  
                </span>
              </span>
            </div>
          </div>
        )}
        {error && (
          <div className="text-red-400 text-center p-2">
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