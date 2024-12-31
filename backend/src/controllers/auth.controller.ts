import { Request, Response } from 'express';
import { AuthService } from '../services/AuthService';

export class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  async handleMetaMaskAuth(req: Request, res: Response) {
    try {
      const { walletAddress, signature, nonce } = req.body;
      
      const result = await this.authService.authenticateWithMetaMask(
        walletAddress,
        signature,
        nonce
      );

      res.json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
}