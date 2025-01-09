import { Request, Response } from 'express';
import { InfoService } from '../services/snowflake/info.service';

export class InfoController {
    private infoService: InfoService;

    constructor() {
        this.infoService = new InfoService();
    }

    async getAssetBySymbol(req: Request, res: Response) {
        try {
            const { symbol } = req.params;

            // Validate required fields
            if (!symbol) {
                return res.status(400).json({ message: 'Symbol is required' });
            }

            const asset = await this.infoService.getAssetBySymbol(symbol.toUpperCase());
            res.status(200).json(asset);
        } catch (error) {
            console.error('Error fetching asset info:', error);
            if (error instanceof Error) {
                return res.status(404).json({ message: error.message });
            }
            res.status(500).json({ message: 'Failed to fetch asset info' });
        }
    }

    async getAssetById(req: Request, res: Response) {
        try {
            const { assetId } = req.params;

            // Validate required fields
            if (!assetId) {
                return res.status(400).json({ message: 'Asset ID is required' });
            }

            const asset = await this.infoService.getAssetById(assetId);
            res.status(200).json(asset);
        } catch (error) {
            console.error('Error fetching asset info:', error);
            if (error instanceof Error) {
                return res.status(404).json({ message: error.message });
            }
            res.status(500).json({ message: 'Failed to fetch asset info' });
        }
    }

    async getTopAssets(req: Request, res: Response) {
        try {
            const limit = parseInt(req.params.limit) || 100;

            // Validate limit
            if (isNaN(limit) || limit < 1 || limit > 1000) {
                return res.status(400).json({ message: 'Limit must be a number between 1 and 1000' });
            }

            const assets = await this.infoService.getTopAssets(limit);
            res.status(200).json(assets);
        } catch (error) {
            console.error('Error fetching top assets:', error);
            if (error instanceof Error) {
                return res.status(404).json({ message: error.message });
            }
            res.status(500).json({ message: 'Failed to fetch top assets' });
        }
    }
}
