import { Router, Request, Response } from 'express';
import { InfoController } from '../controllers/info.controller';

const router = Router();
const infoController = new InfoController();

router.get('/:symbol', (req: Request, res: Response) => {
    try {
        infoController.getAssetBySymbol(req, res);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch asset info' });
    }
});

router.get('/id/:assetId', (req: Request, res: Response) => {
    try {
        infoController.getAssetById(req, res);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch asset info' });
    }
});

router.get('/top/:limit', (req: Request, res: Response) => {
    try {
        infoController.getTopAssets(req, res);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch top assets' });
    }
});

export default router;