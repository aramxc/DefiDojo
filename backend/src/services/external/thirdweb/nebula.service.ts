import { 
    ContextFilter, 
    ExecuteConfig, 
    MessageRequest, 
    Session,
    SessionUpdateRequest,
    StreamEvent,
   
} from '@defidojo/shared-types';
import { config, validateNebulaKey } from '../../../config/constants';
import axios from 'axios';
import { Request, Response } from 'express';

/**
 * NebulaService - Thirdweb Nebula API Integration
 * 
 * Provides functionality for:
 * - Session management (create, update, delete, list)
 * - Chat interactions (streaming)
 * - Smart contract action execution
 * 
 * Uses singleton pattern to ensure single instance across application
 */
export class NebulaService {
    private static instance: NebulaService;
    private readonly apiKey: string;
    private readonly baseUrl: string;

    private constructor() {
        validateNebulaKey();
        this.baseUrl = config.nebula.baseUrl;
        this.apiKey = config.nebula.secretKey!;
    }

    public static getInstance(): NebulaService {
        if (!NebulaService.instance) {
            NebulaService.instance = new NebulaService();
        }
        return NebulaService.instance;
    }

    private get headers() {
        return {
            'x-secret-key': this.apiKey,
            'Content-Type': 'application/json',
        };
    }

    // SESSION MANAGEMENT METHODS

    /**
     * Retrieves a list of all available sessions
     * @returns Promise<Session[]> Array of all sessions
     */
    public async listSessions(): Promise<Session[]> {
        try {
            const response = await axios.get(`${this.baseUrl}/session/list`, {
                headers: this.headers,
            });
            return response.data.result;
        } catch (error) {
            console.error('Failed to list sessions:', error);
            throw error;
        }
    }

    /**
     * Retrieves a specific session by ID
     * @param sessionId - Unique identifier for the session
     */
    public async getSession(sessionId: string): Promise<Session> {
        try {
            const response = await axios.get(`${this.baseUrl}/session/${sessionId}`, {
                headers: this.headers,
            });
            return response.data.result;
        } catch (error) {
            console.error(`Failed to get session ${sessionId}:`, error);
            throw error;
        }
    }

    /**
     * Creates a new session with optional configuration
     * @param title - Optional session title
     * @param executeConfig - Optional execution configuration
     * @param contextFilter - Optional context filtering
     */
    public async createSession(
        title?: string,
        executeConfig?: ExecuteConfig,
        contextFilter?: ContextFilter
    ): Promise<Session> {
        try {
            const response = await axios.post(
                `${this.baseUrl}/session`,
                { title, execute_config: executeConfig, context_filter: contextFilter },
                {
                    headers: this.headers,
                }
            );
            return response.data.result;
        } catch (error) {
            console.error('Failed to create session:', error);
            throw error;
        }
    }

    /**
     * Clears the message history of a specific session
     * @param sessionId - ID of the session to clear
     */
    public async clearSession(sessionId: string): Promise<Session> {
        try {
            const response = await axios.post(
                `${this.baseUrl}/session/${sessionId}/clear`,
                {},
                {
                    headers: this.headers,
                }
            );
            return response.data.result;
        } catch (error) {
            console.error(`Failed to clear session ${sessionId}:`, error);
            throw error;
        }
    }

    /**
     * Updates an existing session with new configuration
     * @param sessionId - ID of the session to update
     * @param request - Update configuration
     */
    public async updateSession(
        sessionId: string,
        request: SessionUpdateRequest
    ): Promise<Session> {
        try {
            const response = await axios.put(
                `${this.baseUrl}/session/${sessionId}`,
                request,
                {
                    headers: this.headers,
                }
            );
            return response.data.result;
        } catch (error) {
            console.error('Failed to update session:', error);
            throw error;
        }
    }

    /**
     * Deletes a specific session
     * @param sessionId - ID of the session to delete
     */
    public async deleteSession(sessionId: string): Promise<void> {
        try {
            await axios.delete(`${this.baseUrl}/session/${sessionId}`, {
                headers: this.headers,
            });
        } catch (error) {
            console.error('Failed to delete session:', error);
            throw error;
        }
    }

    // CHAT AND EXECUTION METHODS

    /**
     * Creates a streaming chat connection
     * @param req Express Request object containing:
     *   - chainId: Chain identifier
     *   - walletAddress: User's wallet address
     *   - contractAddresses: Array of contract addresses
     *   - message: Chat message
     *   - sessionId: Optional session identifier
     * @param res Express Response object for streaming
     */
    public async createChatStream(req: Request, res: Response): Promise<void> {
        try {
            // Log the incoming request body for debugging
            console.log('Incoming request body:', req.body);
            
            const requestBody = {
                message: req.body.message,
                user_id: req.body.user_id,
                stream: true,
                session_id: req.query.sessionId || undefined,
                context_filter: req.body.context_filter || {},
                execute_config: req.body.execute_config || { mode: 'client' }
            };

            console.log('Outgoing request body:', requestBody);

            const response = await axios({
                method: 'POST',
                url: `${this.baseUrl}/chat`,
                headers: this.headers,
                data: requestBody,
                responseType: 'stream'
            });

            res.setHeader('Content-Type', 'text/event-stream');
            res.setHeader('Cache-Control', 'no-cache');
            res.setHeader('Connection', 'keep-alive');

            response.data.pipe(res);

            req.on('close', () => {
                response.data.destroy();
            });

        } catch (error) {
            console.error('Nebula service error:', error);
            if (!res.headersSent) {
                res.status(500).json({ error: 'Failed to process chat request' });
            }
        }
    }

    /**
     * Executes a smart contract action through the Nebula API
     * @param body - Message request containing action parameters
     * @returns Promise containing execution results
     */
    public async executeAction(body: MessageRequest): Promise<{
        message: string;
        actions: StreamEvent[];
        session_id: string;
        request_id: string;
    }> {
        try {
            const response = await axios.post(
                `${this.baseUrl}/execute`,
                body,
                {
                    headers: this.headers,
                }
            );
            return response.data;
        } catch (error) {
            console.error('Failed to execute action:', error);
            throw error;
        }
    }
}

export const nebulaService = NebulaService.getInstance();