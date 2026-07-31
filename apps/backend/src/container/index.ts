import { prisma } from "../database/prisma";

import { CheckInController } from "../modules/check-in/check-in.controller";
import { CheckInService } from "../modules/check-in/check-in.service";

import { EmployeeController } from "../modules/employee/employee.controller";
import { EmployeeRepository } from "../modules/employee/employee.repository";
import { EmployeeService } from "../modules/employee/employee.service";

import { FaceRecognitionController } from "../modules/face-recognised/face-recognition.controller";
import { FaceRecognitionService } from "../modules/face-recognised/face-recognition.service";

import { MediaRepository } from "../modules/media/media.repository";
import { MediaService } from "../modules/media/media.service";
import { VisitController } from "../modules/visit/visit.controller";

import { VisitRepository } from "../modules/visit/visit.repository";
import { VisitService } from "../modules/visit/visit.service";

import { VisitorRegistrationController } from "../modules/visitor-registration/visitor-registration.controller";
import { VisitorRegistrationService } from "../modules/visitor-registration/visitor-registration.service";

import { VisitorCounterRepository } from "../modules/visitors/repositories/visitor-counter.repository";
import { VisitorEmailRepository } from "../modules/visitors/repositories/visitor-email.repository";
import { VisitorMobileRepository } from "../modules/visitors/repositories/visitor-mobile.repository";
import { VisitorRepository } from "../modules/visitors/repositories/visitor.repository";

import { VisitorController } from "../modules/visitors/visitor.controller";
import { VisitorService } from "../modules/visitors/visitor.service";

import { WorkflowRepository } from "../modules/workflow/workflow.repository";
import { WorkflowService } from "../modules/workflow/workflow.service";

import { CheckOutController } from "../modules/check-out/check-out.controller";
import { CheckOutService } from "../modules/check-out/check-out.service";

import { PreRegistrationRepository } from "../modules/pre-registration/pre-registration.repository";
import { PreRegistrationService } from "../modules/pre-registration/pre-registration.service";
import { PreRegistrationController } from "../modules/pre-registration/pre-registration.controller";

// -----------------------------------------------------------------------------
// Repositories
// -----------------------------------------------------------------------------

export const visitorRepository = new VisitorRepository(prisma);

export const visitorEmailRepository =
    new VisitorEmailRepository(prisma);

export const visitorMobileRepository =
    new VisitorMobileRepository(prisma);

export const visitorCounterRepository =
    new VisitorCounterRepository(prisma);

export const visitRepository =
    new VisitRepository(prisma);

export const mediaRepository =
    new MediaRepository(prisma);

export const workflowRepository =
    new WorkflowRepository(prisma);

export const employeeRepository =
    new EmployeeRepository(prisma);

export const preRegistrationRepository =
    new PreRegistrationRepository(prisma);

// -----------------------------------------------------------------------------
// Services
// -----------------------------------------------------------------------------

export const visitorService = new VisitorService(
    prisma,
    visitorRepository,
    visitorEmailRepository,
    visitorMobileRepository,
    visitorCounterRepository,
);

export const employeeService = new EmployeeService(
    prisma,
    employeeRepository,
);

export const faceRecognitionService =
    new FaceRecognitionService();

export const visitorRegistrationService =
    new VisitorRegistrationService(
        faceRecognitionService,
        visitorService,
    );

export const visitService = new VisitService(
    prisma,
    visitRepository,
    employeeRepository
);

export const mediaService = new MediaService(
    mediaRepository,
    prisma,
);

export const checkInService = new CheckInService(
    mediaService,
    visitorService,
    visitService,
    faceRecognitionService,
);

export const workflowService = new WorkflowService(
    workflowRepository,
    mediaService,
    visitorService,
    visitService,
    faceRecognitionService,
);

export const checkOutService = new CheckOutService(
    faceRecognitionService,
    visitorService,
    visitService,
);

export const preRegistrationService =
    new PreRegistrationService(
        prisma,
        preRegistrationRepository,
        employeeService,
    );

// -----------------------------------------------------------------------------
// Controllers
// -----------------------------------------------------------------------------

export const visitorController =
    new VisitorController(visitorService);

export const employeeController =
    new EmployeeController(employeeService);

export const faceRecognitionConstroller =
    new FaceRecognitionController(
        faceRecognitionService,
        visitorService,
    );

export const visitorRegistrationController =
    new VisitorRegistrationController(
        visitorRegistrationService,
    );

export const checkInController =
    new CheckInController(
        workflowService,
        checkInService,
    );


export const visitController = new VisitController(
    visitService,
);

export const checkOutController = new CheckOutController(
    checkOutService,
);

export const preRegistrationController =
    new PreRegistrationController(
        preRegistrationService,
    );