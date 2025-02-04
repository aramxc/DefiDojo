import { Router } from 'express';
import priceRoutes from './latestPrice.route';
import historicalPriceRoutes from './historicalPrice.route';
import marketMetricsRoutes from './marketMetrics.route';
import userRoutes from './user.routes';
import infoRoutes from './info.routes';
import newsRoutes from './news.route';
import nebulaRoutes from './nebula.routes';

const router = Router();

router.use('/prices', priceRoutes);
router.use('/prices', historicalPriceRoutes);
router.use('/market-metrics', marketMetricsRoutes);
router.use('/users', userRoutes);
router.use('/info', infoRoutes);
router.use('/news', newsRoutes);
router.use('/chat', nebulaRoutes);

export default router;