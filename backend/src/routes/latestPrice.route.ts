import { Router, Request, Response } from 'express';
import { PriceController } from '../controllers/latestPrice.controller';

const router = Router();
const priceController = new PriceController();

router.get('/latest', (req: Request, res: Response) => {
    try {
        priceController.getLatestPrices(req, res);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch latest prices' });
    }
});

export default router;