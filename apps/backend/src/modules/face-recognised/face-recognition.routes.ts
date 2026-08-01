import { Router } from "express";
import { upload } from "../../middlewares/upload.middleware.js";
import { faceRecognitionConstroller } from "../../container/index.js";

const router = Router();

router.post(
    '/recognize',
    upload.single('image'),
    faceRecognitionConstroller.recognize
);

export default router;