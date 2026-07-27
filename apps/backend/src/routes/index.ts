import { Router } from 'express';
import { healthRoutes } from '../modules/health/index.js';
import { visitorRoutes } from '../modules/visitors/index.js';
import { faceRecognitionRoutes } from '../modules/face-recognised/index.js';


const router = Router();

router.use('/health', healthRoutes);
router.use('/visitor', visitorRoutes)
router.use('/face-recognize', faceRecognitionRoutes)

export default router