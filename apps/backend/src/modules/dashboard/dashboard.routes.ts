import { Router } from 'express'
import { dashboardController } from '../../container';

const router = Router();

router.get(
    '/', 
    dashboardController.getDashboard
)

export default router