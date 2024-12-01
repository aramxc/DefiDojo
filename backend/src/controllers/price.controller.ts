import { Request, Response } from 'express';
import { PythService } from '../services/pyth.service';

export class PriceController {
  private pythService: PythService;

  constructor() {
    this.pythService = new PythService();
  }

  getLatestPrices = async (req: Request, res: Response) => {
    try {
      const { symbols } = req.query;
      const prices = await this.pythService.getPriceFeeds(symbols as string[]);
      res.json(prices);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch prices' });
    }
  };
}