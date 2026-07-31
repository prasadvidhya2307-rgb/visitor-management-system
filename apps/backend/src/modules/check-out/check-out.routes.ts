import { Router } from "express";

import { checkOutController } from "../../container/index.js";
import { uplaod } from "../../middlewares/upload.middleware.js";

const router = Router();

router.post(
    "/",
    uplaod.single("image"),
    checkOutController.checkOut,
);

export default router;