import { Router, Request, Response } from 'express';
import { HistoricalPriceController } from '../controllers/historicalPrice.controller';

const router = Router();
const historicalPriceController = new HistoricalPriceController();


router.get('/historical/:coinId/:timeframe', (req: Request, res: Response) => {
    try {
        historicalPriceController.getHistoricalPrices(req, res);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch historical prices' });
    }
});

export default router;