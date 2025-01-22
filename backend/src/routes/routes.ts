import { Router } from 'express';
import priceRoutes from './price.route';
import historicalPriceRoutes from './historicalPrice.route';
import marketMetricsRoutes from './marketMetrics.route';
import userRoutes from './user.routes';
import infoRoutes from './info.routes';
import newsRoutes from './news.route';

const router = Router();

router.use('/prices', priceRoutes);
router.use('/prices', historicalPriceRoutes);
router.use('/market-metrics', marketMetricsRoutes);
router.use('/users', userRoutes);
router.use('/info', infoRoutes);
console.log('Info routes mounted');
router.use('/news', newsRoutes);
export default router;