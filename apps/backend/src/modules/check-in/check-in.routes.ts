import { Router } from "express";
import { uplaod } from "../../middlewares/upload.middleware.js";
import { parseJson } from "../../middlewares/parse-json.middleware.js";
import { validate } from "../../middlewares/validate.middleware.js";
import { checkInSchema } from "./check-in.validation.js";
import { checkInController } from "../../container/index.js";
import { createVisitSchema } from "../visit/visit.validation.js";

const router = Router();

router.post(
    '/',
    uplaod.single("image"),
    parseJson("visitor"),
    parseJson("visit"),
    validate(checkInSchema),
    checkInController.checkIn
)

router.post(
    '/:visitorId',
    validate(createVisitSchema),
    checkInController.existingCheckIn
)

export default router