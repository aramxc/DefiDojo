import { Router, Request, Response } from 'express';
import { InfoController } from '../controllers/info.controller';

const router = Router();
const infoController = new InfoController();

// Endpoint to get just the coingeckoId mapping for a symbol
// Used for quick symbol -> coingeckoId lookups
// Example: /info/symbol/BTC -> returns { symbol: "BTC", coingeckoId: "bitcoin" }
router.get('/symbol/:symbol', (req: Request, res: Response) => {
    try {
        console.log('Symbol lookup route hit:', req.params, req.query);
        infoController.getAssetIdBySymbol(req, res);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch asset info' });
    }
});

// Endpoint to get full asset info by coingeckoId
// Example: /info/id/bitcoin -> returns complete asset details
router.get('/id/:coingeckoId', (req: Request, res: Response) => {
    try {
        infoController.getAssetInfoById(req, res);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch asset info' });
    }
});

// Endpoint to get top N assets by market cap
// Example: /info/top/100 -> returns top 100 assets
router.get('/top/:limit', (req: Request, res: Response) => {
    try {
        infoController.getTopAssets(req, res);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch top assets' });
    }
});

// Endpoint to get market data for a specific asset
// Example: /info/market/bitcoin -> returns market data
router.get('/market/:coingeckoId', (req: Request, res: Response) => {
    try {
        infoController.getMarketData(req, res);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch market data' });
    }
});

// Legacy endpoint to get full asset details by symbol
// Supports realTime parameter for live data
// Example: /info/BTC?realTime=true -> returns complete asset details
router.get('/:symbol', (req: Request, res: Response) => {
    try {
        console.log('Full asset info route hit:', req.params, req.query);
        infoController.getAssetInfoBySymbol(req, res);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch asset info' });
    }
});

export default router;