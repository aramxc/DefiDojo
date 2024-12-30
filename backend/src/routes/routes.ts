import { Router } from 'express';
import priceRoutes from './price.route';
import historicalPriceRoutes from './historicalPrice.route';
import coinInfoRoutes from './coinInfo.route';

const router = Router();

router.use('/prices', priceRoutes);
router.use('/prices', historicalPriceRoutes);
router.use('/coin-info', coinInfoRoutes);

export default router;