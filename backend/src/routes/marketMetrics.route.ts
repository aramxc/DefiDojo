import { Router } from 'express';
import { MarketMetricsController } from '../controllers/marketMetrics.controller';

const router = Router();
const marketMetricsController = new MarketMetricsController();

// Add error handling middleware
router.get('/:symbol', async (req, res, next) => {
    try {
        await marketMetricsController.getMarketMetrics(req, res);
    } catch (error) {
        console.error('Route error:', error);
        next(error);
    }
});

export default router;