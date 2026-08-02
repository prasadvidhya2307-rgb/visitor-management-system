import { prisma } from "../database/prisma.js";

import { CheckInController } from "../modules/check-in/check-in.controller.js";
import { CheckInService } from "../modules/check-in/check-in.service.js";

import { EmployeeController } from "../modules/employee/employee.controller.js";
import { EmployeeRepository } from "../modules/employee/employee.repository.js";
import { EmployeeService } from "../modules/employee/employee.service.js";

import { FaceRecognitionController } from "../modules/face-recognised/face-recognition.controller.js";
import { FaceRecognitionService } from "../modules/face-recognised/face-recognition.service.js";

import { MediaRepository } from "../modules/media/media.repository.js";
import { MediaService } from "../modules/media/media.service.js";
import { VisitController } from "../modules/visit/visit.controller.js";

import { VisitRepository } from "../modules/visit/visit.repository.js";
import { VisitService } from "../modules/visit/visit.service.js";

import { VisitorRegistrationController } from "../modules/visitor-registration/visitor-registration.controller.js";
import { VisitorRegistrationService } from "../modules/visitor-registration/visitor-registration.service.js";

import { VisitorCounterRepository } from "../modules/visitors/repositories/visitor-counter.repository.js";
import { VisitorEmailRepository } from "../modules/visitors/repositories/visitor-email.repository.js";
import { VisitorMobileRepository } from "../modules/visitors/repositories/visitor-mobile.repository.js";
import { VisitorRepository } from "../modules/visitors/repositories/visitor.repository.js";

import { VisitorController } from "../modules/visitors/visitor.controller.js";
import { VisitorService } from "../modules/visitors/visitor.service.js";

import { WorkflowRepository } from "../modules/workflow/workflow.repository.js";
import { WorkflowService } from "../modules/workflow/workflow.service.js";

import { CheckOutController } from "../modules/check-out/check-out.controller.js";
import { CheckOutService } from "../modules/check-out/check-out.service.js";

import { PreRegistrationRepository } from "../modules/pre-registration/pre-registration.repository.js";
import { PreRegistrationService } from "../modules/pre-registration/pre-registration.service.js";
import { PreRegistrationController } from "../modules/pre-registration/pre-registration.controller.js";

import { DashboardRepository } from "../modules/dashboard/dashboard.repository.js";
import { DashboardService } from "../modules/dashboard/dashboard.service.js";
import { DashboardController } from '../modules/dashboard/dashboard.controller.js'
import { AuthRepository } from "../modules/auth/auth.repository.js";
import { AuthController } from "../modules/auth/auth.controller.js";
import { AuthService } from "../modules/auth/auth.service.js";


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

export const dashboardRepository =
    new DashboardRepository(prisma);

export const authRepository =
    new AuthRepository(prisma)

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

export const mediaService = new MediaService(
    mediaRepository,
    prisma,
);
export const visitorRegistrationService =
    new VisitorRegistrationService(
        mediaService,
        faceRecognitionService,
        visitorService
    );

export const visitService = new VisitService(
    prisma,
    visitRepository,
    employeeRepository,
    visitorService
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

export const dashboardService =
    new DashboardService(
        dashboardRepository,
    );

export const authService =
    new AuthService(
        authRepository
    )

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

export const dashboardController =
    new DashboardController(
        dashboardService,
    );

export const authController =
    new AuthController(
        authService
    )    