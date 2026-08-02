import { Router } from "express";

import { checkOutController } from "../../container/index.js";
import { upload } from "../../middlewares/upload.middleware.js";
import { authenticate } from "../../middlewares/auth.middleware.js";

const router = Router();

router.use(authenticate)

router.post(
    "/",
    upload.single("image"),
    checkOutController.checkOut,
);

export default router;