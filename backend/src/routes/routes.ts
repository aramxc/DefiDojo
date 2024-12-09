import { Router } from 'express';
import priceRoutes from './price.route';
import historicalPriceRoutes from './historicalPrice.route';
const router = Router();

router.use('/prices', priceRoutes);
router.use('/prices', historicalPriceRoutes);

export default router;