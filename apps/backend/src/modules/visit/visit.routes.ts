import { Router } from "express";

import { visitController } from "../../container/index.js";
import { validate } from "../../middlewares/validate.middleware.js";
import { createVisitSchema, updateVisitSchema } from "./visit.validation.js";

const router = Router();

/**
 * Create a new visit
 */
router.post(
    "/visitors/:visitorId",
    validate(createVisitSchema),
    visitController.createVisit,
);

/**
 * Get all visits
 */
router.get(
    "/",
    visitController.getVisits,
);

/**
 * Get visit by id
 */
router.get(
    "/:visitId",
    visitController.getVisit,
);

/**
 * Get all visits of a visitor
 */
router.get(
    "/visitors/:visitorId",
    visitController.getVisitorVisits,
);

/**
 * Update visit
 */
router.patch(
    "/:visitId",
    validate(updateVisitSchema),
    visitController.updateVisit,
);

/**
 * Delete visit
 */
router.delete(
    "/:visitId",
    visitController.deleteVisit,
);

export default router;