import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware.js";
import { mediaController } from "../../container/index.js";

const router = Router();
router.use(authenticate);
router.get("/", mediaController.getAllMedia);
router.get("/:id", mediaController.getMedia);
export default router;
