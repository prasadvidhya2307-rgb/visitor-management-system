import { Router } from "express";

import { checkOutController } from "../../container";
import { uplaod } from "../../middlewares/upload.middleware";

const router = Router();

router.post(
    "/",
    uplaod.single("image"),
    checkOutController.checkOut,
);

export default router;