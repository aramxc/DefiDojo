import { useState, useCallback, useRef, useEffect } from 'react';
import { NebulaService } from '../services/web3/nebula.service';
import { Session, ContextFilter, ExecuteConfig } from '@defidojo/shared-types';

interface Message {
    role: 'user' | 'assistant';
    content: string;
    status?: 'typing' | 'complete' | 'error';
}

interface PresenceState {
    isThinking: boolean;
    currentAction: string;
}

export interface UseNebulaReturn {
    messages: Message[];
    isLoading: boolean;
    currentSession: Session | null;
    presence: PresenceState;
    sendMessage: (message: string) => Promise<void>;
    setContext: (contextFilter?: ContextFilter, executeConfig?: ExecuteConfig) => void;
    error: Error | null;
    clearMessages: () => void;
}

export const useNebula = (
    initialContext?: ContextFilter,
    initialConfig?: ExecuteConfig
): UseNebulaReturn => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [currentSession, setCurrentSession] = useState<Session | null>(null);
    const [error, setError] = useState<Error | null>(null);
    const [isInitialized, setIsInitialized] = useState(false);
    const [presence, setPresence] = useState<PresenceState>({
        isThinking: false,
        currentAction: ''
    });
    
    const serviceRef = useRef(new NebulaService(initialContext, initialConfig));

    // Initialize chat when component mounts
    useEffect(() => {
        if (!isInitialized) {
            setMessages([{
                role: 'assistant',
                content: 'Hello! How can I assist you today?',
                status: 'complete'
            }]);
            setIsInitialized(true);
        }
    }, [isInitialized]);

    const setContext = useCallback((
        contextFilter?: ContextFilter,
        executeConfig?: ExecuteConfig
    ) => {
        serviceRef.current.setContext(contextFilter, executeConfig);
    }, []);

    const sendMessage = useCallback(async (message: string) => {
        try {
            setIsLoading(true);
            let currentResponse = '';
            
            // Add user message immediately
            setMessages(prev => [...prev, {
                role: 'user',
                content: message,
                status: 'complete'
            }]);

            await serviceRef.current.streamChat(
                message,
                (deltaText) => {
                    currentResponse += deltaText;
                    
                    setMessages(messages => {
                        const hasAssistantMessage = messages.some(m => 
                            m.role === 'assistant' && m.status === 'typing'
                        );
                        
                        if (!hasAssistantMessage) {
                            // First delta - create assistant message with presence
                            setPresence({
                                isThinking: true,
                                currentAction: 'Thinking'
                            });
                            return messages;
                        } else {
                            // Update existing message with new content
                            return messages.map(msg => 
                                msg.role === 'assistant' && msg.status === 'typing'
                                    ? { ...msg, content: currentResponse }
                                    : msg
                            );
                        }
                    });
                },
                (presenceData) => {
                    if (currentResponse) {
                        // Only update presence if we haven't started receiving deltas
                        return;
                    }
                    setPresence({
                        isThinking: true,
                        currentAction: presenceData
                    });
                },
                () => {
                    // On complete - add final message
                    setMessages(prev => [...prev, {
                        role: 'assistant',
                        content: currentResponse,
                        status: 'complete'
                    }]);
                    setIsLoading(false);
                    setPresence({ isThinking: false, currentAction: '' });
                },
                (error) => {
                    console.error('Stream error:', error);
                    setIsLoading(false);
                    setPresence({ isThinking: false, currentAction: '' });
                }
            );
        } catch (error) {
            console.error('Error in sendMessage:', error);
            setIsLoading(false);
        }
    }, []);

    const clearMessages = useCallback(() => {
        setMessages([]);
        setError(null);
    }, []);

    return {
        messages,
        isLoading,
        currentSession,
        presence,
        sendMessage,
        setContext,
        error,
        clearMessages
    };
};