import { Router } from "express";
import { uplaod } from "../../middlewares/upload.middleware";
import { parseJson } from "../../middlewares/parse-json.middleware";
import { validate } from "../../middlewares/validate.middleware";
import { checkInSchema } from "./check-in.validation";
import { checkInController } from "../../container";
import { createVisitSchema } from "../visit/visit.validation";

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