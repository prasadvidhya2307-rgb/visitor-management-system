import { Router } from 'express'
import { validate } from '../../middlewares/validate.middleware';
import { createVisitorSchema, updateVisitorSchema } from './visitor.validation';
import { visitorController, visitorRegistrationController } from '../../container';
import { uplaod } from '../../middlewares/upload.middleware'
import { parseJson } from '../../middlewares/parse-json.middleware';

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