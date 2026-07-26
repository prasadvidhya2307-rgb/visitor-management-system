import { Router } from 'express';
import { healthRoutes } from '../modules/health/index.js';
import { visitorRoutes } from '../modules/visitors/index.js';

const router = Router();

router.use('/health', healthRoutes);
router.use('/visitor', visitorRoutes)

export default router