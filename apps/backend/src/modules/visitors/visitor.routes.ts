import { Router } from 'express'
import { validate } from '../../middlewares/validate.middleware.js';
import { createVisitorSchema, updateVisitorSchema } from './visitor.validation.js';
import { visitorController, visitorRegistrationController } from '../../container/index.js';
import { uplaod } from '../../middlewares/upload.middleware.js'
import { parseJson } from '../../middlewares/parse-json.middleware.js';

const router = Router();

// create a visitor route
router.post(
    '/',
    uplaod.single("image"),
    parseJson("visitor"),
    validate(createVisitorSchema),
    visitorRegistrationController.register
)

// get a vistor route
router.get(
    '/:id',
    visitorController.getVisitor
)

// get all visitors route 
router.get(
    '/',
    visitorController.getAllVistors
)

// update a visitor route
router.put(
    '/:id',
    validate(updateVisitorSchema),
    visitorController.updateVisitor
)

// delete a visitor route 
router.delete(
    '/:id',
    visitorController.deleteVisitor
)

export default router