import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';

const router = Router();
const authController = new AuthController();

router.post('/metamask', authController.handleMetaMaskAuth);
router.post('/profile', authController.updateProfile);
router.get('/profile', authController.getProfile);

export default router;