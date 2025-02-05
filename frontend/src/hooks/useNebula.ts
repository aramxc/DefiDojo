import { useState, useCallback, useRef, useEffect } from 'react';
import { NebulaService } from '../services/web3/nebula.service';
import { ContextFilter, ExecuteConfig } from '@defidojo/shared-types';

/**
 * Interface representing a chat message
 */
export interface Message {
    role: 'user' | 'assistant';
    content: string;
    /** 
     * thinking - Initial state when processing
     * typing - Actively receiving delta updates
     * complete - Message fully received
     */
    status: 'thinking' | 'typing' | 'complete';
}

/**
 * Return type for the useNebula hook
 */
export interface UseNebulaReturn {
    messages: Message[];
    sendMessage: (message: string) => Promise<void>;
    setContext: (contextFilter?: ContextFilter, executeConfig?: ExecuteConfig) => void;
    clearMessages: () => void;
    isInitialized: boolean;
}

/**
 * Hook for managing chat interactions with the Nebula AI service
 * 
 * @param initialContext - Initial context filter for the chat
 * @param initialConfig - Initial configuration for the chat service
 * @returns UseNebulaReturn object containing messages and chat control functions
 */
export const useNebula = (
    initialContext?: ContextFilter,
    initialConfig?: ExecuteConfig
): UseNebulaReturn => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [isInitialized, setIsInitialized] = useState(false);
    const serviceRef = useRef(new NebulaService(initialContext, initialConfig));

    // Initialize chat with welcome message
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

    /**
     * Updates the context and configuration for the chat service
     */
    const setContext = useCallback((
        contextFilter?: ContextFilter,
        executeConfig?: ExecuteConfig
    ) => {
        serviceRef.current.setContext(contextFilter, executeConfig);
    }, []);

    /**
     * Sends a message to the AI and handles the streaming response
     */
    const sendMessage = useCallback(async (message: string) => {
        // Add user message to chat
        setMessages(prev => [...prev, {
            role: 'user',
            content: message,
            status: 'complete'
        }]);

        // Initialize assistant message in thinking state
        setMessages(prev => [...prev, {
            role: 'assistant',
            content: '',
            status: 'thinking'
        }]);

        try {
            await serviceRef.current.streamChat(
                message,
                // Handle incoming delta updates
                (deltaText) => {
                    setMessages(prev => {
                        const newMessages = [...prev];
                        const lastMessage = newMessages[newMessages.length - 1];
                        
                        if (lastMessage?.role === 'assistant') {
                            lastMessage.status = 'typing';
                            lastMessage.content = lastMessage.content + deltaText;
                        }
                        return newMessages;
                    });
                },
                // Handle presence updates (if needed for future features)
                (presenceData) => {},
                // Handle stream completion
                () => {
                    setMessages(prev => prev.map(msg => 
                        msg.status === 'typing' 
                            ? { ...msg, status: 'complete' }
                            : msg
                    ));
                },
                // Handle stream errors
                (error) => {
                    console.error('Stream error:', error);
                    // Could add error handling UI here
                }
            );
        } catch (error) {
            console.error('Error in sendMessage:', error);
            // Could add error handling UI here
        }
    }, []);

    /**
     * Clears the chat history and resets initialization
     */
    const clearMessages = useCallback(() => {
        setMessages([]);
        setIsInitialized(false);
    }, []);

    return {
        messages,
        sendMessage,
        setContext,
        clearMessages,
        isInitialized
    };
};