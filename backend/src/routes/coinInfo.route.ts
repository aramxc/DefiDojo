import { Router, Request, Response } from 'express';
import { CoinInfoController } from '../controllers/coinInfo.controller';

const router = Router();
const coinInfoController = new CoinInfoController();

router.get('/:coinId', (req: Request, res: Response) => {
    try {
        coinInfoController.getCoinDetails(req, res);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch coin details' });
    }
});

export default router;