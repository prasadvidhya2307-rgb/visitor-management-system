import { Router } from "express";

import { checkOutController } from "../../container/index.js";
import { upload } from "../../middlewares/upload.middleware.js";

const router = Router();

router.post(
    "/",
    upload.single("image"),
    checkOutController.checkOut,
);

export default router;