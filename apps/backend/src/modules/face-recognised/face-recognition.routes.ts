import { Router } from "express";
import { upload } from "../../middlewares/upload.middleware.js";
import { faceRecognitionConstroller } from "../../container/index.js";
import { authenticate } from "../../middlewares/auth.middleware.js";

const router = Router();

router.use(authenticate)

router.post(
    '/recognize',
    upload.single('image'),
    faceRecognitionConstroller.recognize
);

export default router;