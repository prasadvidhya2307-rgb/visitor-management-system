import { prisma } from "../database/prisma"
import { FaceRecognitionController } from "../modules/face-recognised/face-recognition.controller"
import { FaceRecognitionService } from "../modules/face-recognised/face-recognition.service"
import { VisitorCounterRepository } from "../modules/visitors/repositories/visitor-counter.repository"
import { VisitorEmailRepository } from "../modules/visitors/repositories/visitor-email.repository"
import { VisitorMobileRepository } from "../modules/visitors/repositories/visitor-mobile.repository"
import { VisitorRepository } from "../modules/visitors/repositories/visitor.repository"
import { VisitorController } from "../modules/visitors/visitor.controller"
import { VisitorService } from "../modules/visitors/visitor.service"

// repositries
export const visitorRepository = new VisitorRepository(prisma)
export const visitorEmailRepository = new VisitorEmailRepository(prisma)
export const visitorMobileRepository = new VisitorMobileRepository(prisma)
export const visitorCounterRepository = new VisitorCounterRepository(prisma)

// services
export const visitorService = new VisitorService(
    prisma,
    visitorRepository,
    visitorEmailRepository,
    visitorMobileRepository,
    visitorCounterRepository
)
export const faceRecognitionService = new FaceRecognitionService()

// controllers 
export const visitorController = new VisitorController(visitorService);
export const faceRecognitionConstroller = new FaceRecognitionController(
    faceRecognitionService,
    visitorService
)