import { Router } from 'express';
import { nebulaController } from '../controllers/nebula.controller';

const router = Router();

// Chat stream endpoint
router.post('/stream', async (req, res) => {
    try {
        await nebulaController.streamChat(req, res);
    } catch (error) {
        console.error('Error in streamChat:', error);
        res.status(500).json({ error: 'Failed to initialize chat stream' });
    }
});

// Session management endpoints
router.get('/sessions', async (req, res) => {
    try {
        const sessions = await nebulaController.listSessions(req, res);
        res.json(sessions);
    } catch (error) {
        console.error('Error listing sessions:', error);
        res.status(500).json({ error: 'Failed to list sessions' });
    }
});

router.get('/sessions/:sessionId', async (req, res) => {
    try {
        const session = await nebulaController.getSession(req, res);
        res.json(session);
    } catch (error) {
        console.error('Error getting session:', error);
        res.status(500).json({ error: 'Failed to get session' });
    }
});

router.post('/sessions', async (req, res) => {
    try {
        const session = await nebulaController.createSession(req, res);
        res.json(session);
    } catch (error) {
        console.error('Error creating session:', error);
        res.status(500).json({ error: 'Failed to create session' });
    }
});

router.post('/sessions/:sessionId/clear', async (req, res) => {
    try {
        const session = await nebulaController.clearSession(req, res);
        res.json(session);
    } catch (error) {
        console.error('Error clearing session:', error);
        res.status(500).json({ error: 'Failed to clear session' });
    }
});

export default router;