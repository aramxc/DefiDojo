import { 
    ContextFilter, 
    ExecuteConfig, 
    MessageRequest, 
    StreamEvent, 
    DeltaEvent,
    Session,
    SessionUpdateRequest,
} from '@defidojo/shared-types';
import { API_BASE_URL } from '../../config/constants';

/**
 * Service for handling Nebula AI chat interactions
 * Manages streaming chat, message sending, and session management
 */
export class NebulaService {
    private eventSource: EventSource | null = null;
    private contextFilter?: ContextFilter = {};
    private executeConfig?: ExecuteConfig;
    private currentSessionId: string | null = null;

    /**
     * Initialize service with optional context and execution configuration
     */
    constructor(contextFilter?: ContextFilter, executeConfig?: ExecuteConfig) {
        if (contextFilter) this.contextFilter = contextFilter;
        if (executeConfig) this.executeConfig = executeConfig;
    }

    /**
     * Updates the service context and execution configuration
     */
    public setContext(contextFilter?: ContextFilter, executeConfig?: ExecuteConfig) {
        if (contextFilter) this.contextFilter = contextFilter;
        if (executeConfig) this.executeConfig = executeConfig;
    }

    /**
     * Message Handling Methods
     */

    /**
     * Sends a message with streaming response
     * @param message - User's input message
     * @param onDelta - Callback for receiving message chunks
     * @param onPresence - Callback for receiving presence updates
     * @param onComplete - Callback for stream completion
     * @param onError - Callback for error handling
     */
    public async streamChat(
        message: string,
        onDelta: (text: string) => void,
        onPresence: (data: any) => void,
        onComplete: () => void,
        onError: (error: any) => void,
    ) {
        try {
            this.closeConnection();

            const url = new URL(`${API_BASE_URL}/chat/stream`);
            if (this.currentSessionId) {
                url.searchParams.append('sessionId', this.currentSessionId);
            }
            
            const body: MessageRequest = {
                message,
                stream: true,
                user_id: 'default-user',
                context_filter: this.contextFilter || {},
                execute_config: this.executeConfig || {
                    mode: 'client'
                }
            };

            const response = await fetch(url.toString(), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(body)
            });

            if (!response.body) {
                throw new Error('No response body received');
            }

            // Create reader for streaming response
            const reader = response.body.getReader();
            const decoder = new TextDecoder();

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value);
                const lines = chunk.split('\n');
                
                for (const line of lines) {
                    if (!line.trim() || !line.startsWith('data: ')) continue;
                    
                    try {
                        const data = JSON.parse(line.slice(6));
                        
                        if ('v' in data) {
                            onDelta(data.v);
                        } else if (data.type === 'presence' && data.data) {
                            onPresence(data.data);
                        }
                    } catch (e) {
                        console.error('Failed to parse stream data:', e);
                    }
                }
            }

            onComplete();
        } catch (error) {
            console.error('Stream error:', error);
            onError(error);
        }
    }

    /**
     * Session Management Methods
     */

    /**
     * Creates a new chat session
     * @param title - Optional session title
     * @param options - Optional configuration overrides
     */
    public async createSession(title?: string, options?: {
        contextFilter?: ContextFilter;
        executeConfig?: ExecuteConfig;
    }): Promise<Session> {
        try {
            const response = await fetch('/api/nebula/sessions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title,
                    context_filter: options?.contextFilter || this.contextFilter,
                    execute_config: options?.executeConfig || this.executeConfig,
                }),
            });
            const session = await response.json();
            this.currentSessionId = session.id;
            return session;
        } catch (error) {
            console.error('Failed to create session:', error);
            throw error;
        }
    }

    public async listSessions(): Promise<Session[]> {
        try {
            const response = await fetch('/api/nebula/sessions');
            return response.json();
        } catch (error) {
            console.error('Failed to list sessions:', error);
            throw error;
        }
    }

    public async getSession(sessionId: string): Promise<Session> {
        try {
            const response = await fetch(`/api/nebula/sessions/${sessionId}`);
            return response.json();
        } catch (error) {
            console.error('Failed to get session:', error);
            throw error;
        }
    }

    public async updateSession(
        sessionId: string, 
        updateRequest: SessionUpdateRequest
    ): Promise<Session> {
        try {
            const response = await fetch(`/api/nebula/sessions/${sessionId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updateRequest),
            });
            return response.json();
        } catch (error) {
            console.error('Failed to update session:', error);
            throw error;
        }
    }

    public async deleteSession(sessionId: string): Promise<void> {
        try {
            await fetch(`/api/nebula/sessions/${sessionId}`, {
                method: 'DELETE',
            });
        } catch (error) {
            console.error('Failed to delete session:', error);
            throw error;
        }
    }

    public async clearSession(sessionId: string): Promise<Session> {
        try {
            const response = await fetch(`/api/nebula/sessions/${sessionId}/clear`, {
                method: 'POST',
            });
            return response.json();
        } catch (error) {
            console.error('Failed to clear session:', error);
            throw error;
        }
    }

    /**
     * Private Helper Methods
     */
    private setupEventListeners(
        messageText: string,
        onDelta: (text: string) => void,
        onComplete: () => void,
        onError: (error: any) => void
    ) {
        if (!this.eventSource) return;

        this.eventSource.onopen = () => {
            console.log('Stream connection opened');
        };

        this.eventSource.onerror = (event) => {
            console.error('Stream error:', event);
            this.closeConnection();
            onError(event);
        };

        this.eventSource.addEventListener('init', (event: MessageEvent) => {
            try {
                const data: StreamEvent = JSON.parse(event.data);
                this.currentSessionId = data.session_id;
                console.log('Stream initialized:', data);
            } catch (e) {
                onError(new Error('Failed to parse init event'));
            }
        });

        this.eventSource.addEventListener('presence', (event: MessageEvent) => {
            try {
                const data: StreamEvent = JSON.parse(event.data);
                console.log('Backend status:', data.data);
            } catch (e) {
                onError(new Error('Failed to parse presence event'));
            }
        });

        this.eventSource.addEventListener('action', (event: MessageEvent) => {
            try {
                const data: StreamEvent = JSON.parse(event.data);
                if (data.type === 'sign_transaction') {
                    this.handleTransaction(data.data);
                }
                console.log('Received action:', data);
            } catch (e) {
                onError(new Error('Failed to parse action event'));
            }
        });

        this.eventSource.addEventListener('delta', (event: MessageEvent) => {
            try {
                const data: DeltaEvent = JSON.parse(event.data);
                messageText += data.v;
                onDelta(data.v);
                console.log('Current message:', messageText);
            } catch (e) {
                onError(new Error('Failed to parse delta event'));
            }
        });

        this.eventSource.addEventListener('error', (event: Event) => {
            try {
                if (event instanceof MessageEvent && event.data) {
                    const error = JSON.parse(event.data);
                    onError(error);
                } else {
                    onError(new Error('Stream connection error'));
                }
            } catch (e) {
                onError(new Error('Stream connection error'));
            } finally {
                this.closeConnection();
                onComplete();
            }
        });
    }

    /**
     * Handles blockchain transaction signing requests
     */
    private handleTransaction(data: any) {
        // Implement transaction handling
        console.log('Transaction data received:', data);
    }

    /**
     * Closes and cleans up SSE connection
     */
    private closeConnection() {
        if (this.eventSource) {
            this.eventSource.close();
            this.eventSource = null;
        }
    }
}