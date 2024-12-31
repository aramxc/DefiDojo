import { UserRepository, UserProfile } from '../repositories/UserRepository';
import { ethers } from 'ethers';
import jwt from 'jsonwebtoken';

export class AuthService {
  private userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepository();
  }

  async authenticateWithMetaMask(
    walletAddress: string,
    signature: string,
    nonce: string
  ): Promise<{ token: string; user: UserProfile }> {
    // Verify signature
    const message = `Sign in to Web3 Academy\nNonce: ${nonce}`;
    const recoveredAddress = ethers.verifyMessage(message, signature);

    if (recoveredAddress.toLowerCase() !== walletAddress.toLowerCase()) {
      throw new Error('Invalid signature');
    }

    // Find or create user
    let user = await this.userRepository.findByWalletAddress(walletAddress);
    
    if (!user) {
      user = await this.userRepository.createUser({
        walletAddress,
        username: `user_${walletAddress.slice(2, 8)}` // Temporary username
      });
    }

    // Generate JWT
    const token = jwt.sign(
      { userId: user.userId, walletAddress },
      process.env.JWT_SECRET!,
      { expiresIn: '24h' }
    );

    return { token, user };
  }
}