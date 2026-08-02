import { Router } from 'express'
import { dashboardController } from '../../container/index.js';
import { authenticate } from '../../middlewares/auth.middleware.js';

const router = Router();

router.use(authenticate)

router.get(
    '/', 
    dashboardController.getDashboard
)

export default router