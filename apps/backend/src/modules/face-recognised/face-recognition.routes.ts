import { Router } from "express";
import { uplaod } from "../../middlewares/upload.middleware.js";
import { faceRecognitionConstroller } from "../../container/index.js";

const router = Router();

router.post(
    '/recognize',
    uplaod.single('image'),
    faceRecognitionConstroller.recognize
);

export default router;