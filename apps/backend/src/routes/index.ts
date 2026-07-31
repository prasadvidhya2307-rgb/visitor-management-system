import { Router } from 'express';
import { healthRoutes } from '../modules/health/index.js';
import { visitorRoutes } from '../modules/visitors/index.js';
import { faceRecognitionRoutes } from '../modules/face-recognised/index.js';
import { checkInRoutes } from '../modules/check-in/index.js';
import { employeeRoutes } from '../modules/employee/index.js';
import { visitRoutes } from '../modules/visit/index.js';
import { checkOutRoutes } from '../modules/check-out/index.js';
import { preRegistrationRoutes } from '../modules/pre-registration/index.js';


const router = Router();

router.use('/health', healthRoutes);
router.use('/visitor', visitorRoutes);
router.use('/face', faceRecognitionRoutes)
router.use('/check-in', checkInRoutes)
router.use('/employee', employeeRoutes)
router.use('/visit', visitRoutes)
router.use("/check-out", checkOutRoutes);
router.use("/pre-registrations", preRegistrationRoutes)

export default router