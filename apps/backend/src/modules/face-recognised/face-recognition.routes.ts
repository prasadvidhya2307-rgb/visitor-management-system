import { Router } from "express";
import { uplaod } from "../../middlewares/upload.middleware";
import { faceRecognitionConstroller } from "../../container";

const router = Router();

router.post(
    '/recognize',
    uplaod.single('image'),
    faceRecognitionConstroller.recognize
);

export default router;