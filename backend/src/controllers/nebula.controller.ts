import { Request, Response } from 'express';
import { NebulaService } from '../services/external/thirdweb/nebula.service';

export class NebulaController {
    async streamChat(req: Request, res: Response) {
        try {
            const message = req.body.message;
            if (!message) {
                throw new Error('Message is required');
            }
            await NebulaService.getInstance().createChatStream(req, res);
        } catch (error) {
            console.error('Chat stream error:', error);
            if (!res.headersSent) {
                res.status(500).json({ error: 'Failed to initialize chat stream' });
            }
        }
    }

    async listSessions(_req: Request, res: Response) {
        try {
            const sessions = await NebulaService.getInstance().listSessions();
            res.json(sessions);
        } catch (error) {
            console.error('List sessions error:', error);
            res.status(500).json({ error: 'Failed to list sessions' });
        }
    }

    async getSession(req: Request, res: Response) {
        try {
            const sessionId = req.params.sessionId;
            const session = await NebulaService.getInstance().getSession(sessionId);
            res.json(session);
        } catch (error) {
            console.error('Get session error:', error);
            res.status(500).json({ error: 'Failed to get session' });
        }
    }


    async executeAction(req: Request, res: Response) {
        try {
            const response = await NebulaService.getInstance().executeAction(req.body);
            res.json(response);
        } catch (error) {
            console.error('Execute action error:', error);
            res.status(500).json({ error: 'Failed to execute action' });
        }
    }

    async createSession(req: Request, res: Response) {
        try {
            const { title, execute_config, context_filter } = req.body;
            const session = await NebulaService.getInstance().createSession(
                title,
                execute_config,
                context_filter
            );
            res.json(session);
        } catch (error) {
            console.error('Create session error:', error);
            res.status(500).json({ error: 'Failed to create session' });
        }
    }

    async clearSession(req: Request, res: Response) {
        try {
            const sessionId = req.params.sessionId;
            const session = await NebulaService.getInstance().clearSession(sessionId);
            res.json(session);
        } catch (error) {
            console.error('Clear session error:', error);
            res.status(500).json({ error: 'Failed to clear session' });
        }
    }

    async updateSession(req: Request, res: Response) {
        try {
            const sessionId = req.params.sessionId;
            const session = await NebulaService.getInstance().updateSession(
                sessionId,
                req.body
            );
            res.json(session);
        } catch (error) {
            console.error('Update session error:', error);
            res.status(500).json({ error: 'Failed to update session' });
        }
    }
}

export const nebulaController = new NebulaController();