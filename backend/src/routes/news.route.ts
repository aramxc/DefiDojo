import { Router } from 'express';
import { NewsController } from '../controllers/news.controller';

const router = Router();

router.get('/:symbol', async (req, res) => {
    try {
        await NewsController.getCryptoNews(req, res);
    } catch (error) {
        console.error('Error in getCryptoNews:', error);
        res.status(500).json({ error: 'Failed to fetch news for ' + req.params.symbol });
    }
});

export default router;