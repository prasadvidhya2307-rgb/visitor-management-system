import { Router } from "express";

import { validate } from "../../middlewares/validate.middleware";

import {
    createPreRegistrationSchema,
    updatePreRegistrationSchema,
} from "./pre-registration.validation";

import { preRegistrationController } from "../../container";

const router = Router();

router.post(
    "/",
    validate(createPreRegistrationSchema),
    preRegistrationController.createPreRegistration,
);

router.get(
    "/",
    preRegistrationController.getPreRegistrations,
);

router.get(
    "/:id",
    preRegistrationController.getPreRegistration,
);

router.put(
    "/:id",
    validate(updatePreRegistrationSchema),
    preRegistrationController.updatePreRegistration,
);

router.delete(
    "/:id",
    preRegistrationController.cancelPreRegistration,
);

export default router;