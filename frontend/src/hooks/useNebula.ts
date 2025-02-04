import { useState, useCallback, useRef } from 'react';
import { NebulaService } from '../services/web3/nebula.service';
import { Session, ContextFilter, ExecuteConfig } from '@defidojo/shared-types';

interface Message {
    role: 'user' | 'assistant';
    content: string;
    status?: 'typing' | 'complete' | 'error';
}

interface UseNebulaReturn {
    messages: Message[];
    isLoading: boolean;
    currentSession: Session | null;
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
    
    // Keep service instance in a ref to maintain through rerenders
    const serviceRef = useRef(new NebulaService(initialContext, initialConfig));

    const setContext = useCallback((
        contextFilter?: ContextFilter,
        executeConfig?: ExecuteConfig
    ) => {
        serviceRef.current.setContext(contextFilter, executeConfig);
    }, []);

    const sendMessage = useCallback(async (message: string) => {
        setIsLoading(true);
        setError(null);

        // Add user message immediately
        setMessages(prev => [...prev, {
            role: 'user',
            content: message,
            status: 'complete'
        }]);

        // Add empty assistant message that will be updated
        setMessages(prev => [...prev, {
            role: 'assistant',
            content: '',
            status: 'typing'
        }]);

        try {
            await serviceRef.current.streamChat(
                message,
                // Handle streaming chunks
                (deltaText) => {
                    setMessages(prev => {
                        const updated = [...prev];
                        const lastMessage = updated[updated.length - 1];
                        if (lastMessage.role === 'assistant') {
                            lastMessage.content += deltaText;
                        }
                        return updated;
                    });
                },
                // Handle completion
                () => {
                    setMessages(prev => {
                        const updated = [...prev];
                        const lastMessage = updated[updated.length - 1];
                        if (lastMessage.role === 'assistant') {
                            lastMessage.status = 'complete';
                        }
                        return updated;
                    });
                    setIsLoading(false);
                },
                // Handle errors
                (error) => {
                    setError(error);
                    setMessages(prev => {
                        const updated = [...prev];
                        const lastMessage = updated[updated.length - 1];
                        if (lastMessage.role === 'assistant') {
                            lastMessage.status = 'error';
                            lastMessage.content = 'Sorry, an error occurred while processing your message.';
                        }
                        return updated;
                    });
                    setIsLoading(false);
                }
            );
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Unknown error occurred'));
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
        sendMessage,
        setContext,
        error,
        clearMessages
    };
};