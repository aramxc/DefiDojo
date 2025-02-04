import { 
    ContextFilter, 
    ExecuteConfig, 
    MessageRequest, 
    StreamEvent, 
    DeltaEvent,
    Session,
    SessionUpdateRequest,
} from '@defidojo/shared-types';

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
     * @param onComplete - Callback for stream completion
     * @param onError - Callback for error handling
     */
    public async streamChat(
        message: string,
        onDelta: (text: string) => void,
        onComplete: () => void,
        onError: (error: any) => void,
        options?: {
            contextFilter?: ContextFilter;
            executeConfig?: ExecuteConfig;
        }
    ) {
        try {
            this.closeConnection();
            this.eventSource = new EventSource(`/api/chat/stream?${new URLSearchParams({
                message,
                sessionId: this.currentSessionId || '',
            })}`);

            let messageText = '';
            this.setupEventListeners(messageText, onDelta, onComplete, onError);
        } catch (error) {
            onError(error);
            this.closeConnection();
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