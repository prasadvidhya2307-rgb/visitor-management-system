import { Router } from 'express'
import { dashboardController } from '../../container/index.js';

const router = Router();

router.get(
    '/', 
    dashboardController.getDashboard
)

export default router