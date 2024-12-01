import { Router } from 'express';
import priceRoutes from './price.route';

const router = Router();

router.use('/prices', priceRoutes);

export default router;