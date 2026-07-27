import { Router } from "express";
import { uplaod } from "../../middlewares/upload.middleware";

const router = Router();

router.post('/', uplaod.single("image"));

export default router;