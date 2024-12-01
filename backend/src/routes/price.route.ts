import { Router } from 'express';
import { PriceController } from '../controllers/price.controller';

const router = Router();
const priceController = new PriceController();

router.get('/latest', priceController.getLatestPrices);

export default router;