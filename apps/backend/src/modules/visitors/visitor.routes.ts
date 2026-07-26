import { Router } from 'express'
import { validate } from '../../middlewares/validate.middleware';
import { createVisitorSchema, updateVisitorSchema } from './visitor.validation';
import { VisitorController } from './visitor.controller';
import { VisitorService } from './visitor.service';
import { prisma } from '../../database/prisma';
import { VisitorRepository } from './repositories/visitor.repository';
import { VisitorMobileRepository } from './repositories/visitor-mobile.repository';
import { VisitorEmailRepository } from './repositories/visitor-email.repository';
import { VisitorCounterRepository } from './repositories/visitor-counter.repository';

const router = Router();

const visitorRepository = new VisitorRepository(prisma)
const visitorEmailRepository = new VisitorEmailRepository(prisma)
const visitorMobileRepository = new VisitorMobileRepository(prisma)
const visitorCounterRepository = new VisitorCounterRepository(prisma)

const visitorService = new VisitorService(
    prisma,
    visitorRepository,
    visitorEmailRepository,
    visitorMobileRepository,
    visitorCounterRepository
)
const visitorController = new VisitorController(visitorService)

// create a visitor route
router.post(
    '/',
    validate(createVisitorSchema),
    visitorController.createVisitor
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