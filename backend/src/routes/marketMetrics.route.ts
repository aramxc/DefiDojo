import { Router } from 'express';
import { MarketMetricsController } from '../controllers/marketMetrics.controller';

const router = Router();
const marketMetricsController = new MarketMetricsController();

router.get('/fear-greed/current', async (req, res, next) => {
    try {
        await marketMetricsController.getCurrentFearGreed(req, res);
    } catch (error) {
        console.error('Route error:', error);
        next(error);
    }
});

router.get('/fear-greed/historical', async (req, res, next) => {
    try {
        await marketMetricsController.getHistoricalFearGreed(req, res);
    } catch (error) {
        console.error('Route error:', error);
        next(error);
    }
});

router.get('/:symbol', async (req, res, next) => {
    try {
        await marketMetricsController.getMarketMetrics(req, res);
    } catch (error) {
        console.error('Route error:', error);
        next(error);
    }
});

export default router;