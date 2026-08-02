import { Router } from "express";

import { visitorController, visitorRegistrationController } from "../../container/index.js";
import { parseJson } from "../../middlewares/parse-json.middleware.js";
import { upload } from "../../middlewares/upload.middleware.js";
import { validate } from "../../middlewares/validate.middleware.js";
import {
    createVisitorSchema,
    updateVisitorSchema,
} from "./visitor.validation.js";
import { authenticate } from "../../middlewares/auth.middleware.js";

const router = Router();

router.use(authenticate)

// Create a visitor
router.post(
    "/",
    upload.single("image"),
    parseJson("visitor"),
    validate(createVisitorSchema),
    visitorRegistrationController.register,
);

// Get all deleted visitors
router.get(
    "/deleted",
    visitorController.getAllDeletedVisitor,
);

// Get all visitors
router.get(
    "/",
    visitorController.getAllVisitors,
);

router.get('/active', visitorController.getAllActiveVisitor)
router.post("/:id/restore", visitorController.restoreVisitor);

// Get a visitor by ID
router.get(
    "/:id",
    visitorController.getVisitor,
);


// Update a visitor
router.put(
    "/:id",
    validate(updateVisitorSchema),
    visitorController.updateVisitor,
);

// Delete a visitor
router.delete(
    "/:id",
    visitorController.deleteVisitor,
);

export default router;
