import { Router } from 'express';
import { HistoricalPriceController } from '../controllers/historicalPrice.controller';

// Create a single instance of the controller
const historicalPriceController = new HistoricalPriceController();
const router = Router();

router.get('/historical/:coinId/:timeframe', (req, res) => {
    try {
        historicalPriceController.getHistoricalPrices(req, res);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch historical prices' });
    }
});

export default router;