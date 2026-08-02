import { Router } from "express";
import { upload } from "../../middlewares/upload.middleware.js";
import { parseJson } from "../../middlewares/parse-json.middleware.js";
import { validate } from "../../middlewares/validate.middleware.js";
import { checkInSchema } from "./check-in.validation.js";
import { checkInController } from "../../container/index.js";
import { createVisitSchema } from "../visit/visit.validation.js";
import { authenticate } from "../../middlewares/auth.middleware.js";

const router = Router();

router.use(authenticate)

router.post(
    '/',
    upload.single("image"),
    parseJson("visitor"),
    parseJson("visit"),
    validate(checkInSchema),
    checkInController.checkIn
)

router.post(
    '/with-image/:visitorId',
    upload.single("image"),
    parseJson("visit"),
    (req, _res, next) => { req.body = req.body.visit; next(); },
    validate(createVisitSchema),
    checkInController.existingCheckInWithImage,
)

router.post(
    '/:visitorId',
    validate(createVisitSchema),
    checkInController.existingCheckIn
)

export default router
