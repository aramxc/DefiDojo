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
      
      // Validate symbols parameter
      if (!symbols) {
        return res.status(400).json({ error: 'Symbols parameter is required' });
      }

      // Convert query parameter to array
      const symbolsArray = Array.isArray(symbols) 
        ? symbols 
        : symbols.toString().split(',');

      const prices = await this.pythService.getPriceFeeds(symbolsArray as string[]);
      res.json(prices);
    } catch (error) {
      console.error('Error in getLatestPrices:', error);
      res.status(500).json({ 
        error: 'Failed to fetch prices',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };
}