import {
    VisitorRegistrationWorkflow,
    WorkflowStatus,
    WorkflowStep,
} from "@prisma/client";
import { WorkflowError } from "../../middlewares/workflow.error.js";
import { AppError } from "../../utils/app-error.js";
import { CheckInDto, CheckInResponse } from "../check-in/check-in.types.js";
import { FaceRecognitionService } from "../face-recognised/face-recognition.service.js";
import { MediaService } from "../media/media.service.js";
import { VisitService } from "../visit/visit.service.js";
import { VisitorService } from "../visitors/visitor.service.js";
import { VisitorResponseDto } from "../visitors/visitor.types.js";
import { WorkflowRepository } from "./workflow.repository.js";

export class WorkflowService {
    constructor(
        private readonly workflowRepository: WorkflowRepository,
        private readonly mediaService: MediaService,
        private readonly visitorService: VisitorService,
        private readonly visitService: VisitService,
        private readonly faceRecognitionService: FaceRecognitionService,
    ) { }

    /**
     * Start a new workflow or resume an existing one.
     */
    public async start(
        dto: CheckInDto,
        image: Express.Multer.File,
    ) {
        const existingWorkflow =
            await this.workflowRepository.findFailedWorkflow(
                dto.visitor.identityNumber,
            );

        if (existingWorkflow) {
            return this.resume(
                existingWorkflow.id,
                dto,
                image,
            );
        }

        const workflow =
            await this.workflowRepository.create();

        try {
            await this.execute(
                workflow.id,
                dto,
                image,
            );
        } catch (error) {
            await this.failWorkflow(
                workflow.id,
                error,
            );

            const failedWorkflow =
                await this.workflowRepository.findByIdOrThrow(
                    workflow.id,
                );

            throw new WorkflowError(
                failedWorkflow.id,
                failedWorkflow.currentStep,
                error instanceof Error
                    ? error.message
                    : "Unknown error",
                error instanceof AppError
                    ? error.statusCode
                    : 500,
            );
        }

        

        return this.checkInResponse(workflow.id);
    }

    /**
     * Resume a failed workflow.
     */
    public async resume(
        workflowId: string,
        dto: CheckInDto,
        image: Express.Multer.File,
    ): Promise<CheckInResponse> {
        await this.workflowRepository.update(
            workflowId,
            {
                status: WorkflowStatus.RUNNING,
                lastError: null,
                retryCount: {
                    increment: 1,
                },
            },
        );

        try {
            await this.execute(
                workflowId,
                dto,
                image,
            );
        } catch (error) {
            await this.failWorkflow(
                workflowId,
                error,
            );

            const failedWorkflow =
                await this.workflowRepository.findByIdOrThrow(
                    workflowId,
                );

            throw new WorkflowError(
                failedWorkflow.id,
                failedWorkflow.currentStep,
                error instanceof Error
                    ? error.message
                    : "Unknown error",
                error instanceof AppError
                    ? error.statusCode
                    : 500,
            );
        }

         console.log("result of visitor create + visit", this.checkInResponse(workflowId))

        return this.checkInResponse(workflowId);
    }

    /**
     * Execute workflow
     */
    private async execute(
        workflowId: string,
        dto: CheckInDto,
        image: Express.Multer.File,
    ): Promise<void> {
        const workflow =
            await this.workflowRepository.findByIdOrThrow(
                workflowId,
            );

        switch (workflow.currentStep) {
            case WorkflowStep.CREATE_MEDIA:
                await this.createMedia(
                    workflow,
                    image,
                );

                return this.execute(
                    workflowId,
                    dto,
                    image,
                );

            case WorkflowStep.CREATE_VISITOR:
                await this.createVisitor(
                    workflow,
                    dto,
                );

                return this.execute(
                    workflowId,
                    dto,
                    image,
                );

            case WorkflowStep.REGISTER_FACE:
                await this.registerFace(
                    workflow,
                    image,
                );

                return this.execute(
                    workflowId,
                    dto,
                    image,
                );

            case WorkflowStep.COMPLETE_REGISTRATION:
                await this.completeRegistration(
                    workflow,
                );

                return this.execute(
                    workflowId,
                    dto,
                    image,
                );

            case WorkflowStep.CREATE_VISIT:
                await this.createVisit(
                    workflow,
                    dto,
                );

                return this.execute(
                    workflowId,
                    dto,
                    image,
                );

            case WorkflowStep.ACTIVATE_MEDIA:
                await this.activateMedia(
                    workflow,
                );

                return this.execute(
                    workflowId,
                    dto,
                    image,
                );

            case WorkflowStep.COMPLETED:
                return;
        }
    }

    private async createMedia(
        workflow: VisitorRegistrationWorkflow,
        image: Express.Multer.File,
    ) {
        const media =
            await this.mediaService.createTemporary(
                image,
            );

        await this.workflowRepository.update(
            workflow.id,
            {
                mediaId: media.id,
                createMediaCompleted: true,
                currentStep: WorkflowStep.CREATE_VISITOR,
            },
        );
    }

    private async createVisitor(
        workflow: VisitorRegistrationWorkflow,
        dto: CheckInDto,
    ) {
        const visitor =
            await this.visitorService.createVisitor(
                dto.visitor,
                workflow.mediaId!,
            );

        await this.workflowRepository.update(
            workflow.id,
            {
                visitorId: visitor.id,
                createVisitorCompleted: true,
                currentStep: WorkflowStep.REGISTER_FACE,
            },
        );
    }

    private async registerFace(
        workflow: VisitorRegistrationWorkflow,
        image: Express.Multer.File,
    ) {
        await this.faceRecognitionService.registerFace(
            workflow.visitorId!,
            image,
        );

        await this.workflowRepository.update(
            workflow.id,
            {
                registerFaceCompleted: true,
                currentStep: WorkflowStep.COMPLETE_REGISTRATION,
            },
        );
    }

    private async completeRegistration(
        workflow: VisitorRegistrationWorkflow,
    ) {
        await this.visitorService.completeRegistration(
            workflow.visitorId!,
        );

        await this.workflowRepository.update(
            workflow.id,
            {
                completeRegistrationCompleted: true,
                currentStep: WorkflowStep.CREATE_VISIT,
            },
        );
    }

    private async createVisit(
        workflow: VisitorRegistrationWorkflow,
        dto: CheckInDto,
    ) {
        const visit =
            await this.visitService.createVisit(workflow.visitorId!, dto.visit);

        await this.workflowRepository.update(
            workflow.id,
            {
                visitId: visit.id,
                createVisitCompleted: true,
                currentStep: WorkflowStep.ACTIVATE_MEDIA,
            },
        );
    }

    private async activateMedia(
        workflow: VisitorRegistrationWorkflow,
    ) {
        await this.mediaService.markActive(
            workflow.mediaId!,
        );

        await this.workflowRepository.update(
            workflow.id,
            {
                activateMediaCompleted: true,
                currentStep: WorkflowStep.COMPLETED,
                status: WorkflowStatus.COMPLETED,
            },
        );
    }

    private async failWorkflow(
        workflowId: string,
        error: unknown,
    ) {
        const message =
            error instanceof Error
                ? error.message
                : "Unknown error";

        await this.workflowRepository.update(
            workflowId,
            {
                status: WorkflowStatus.FAILED,
                lastError: message,
            },
        );
    }

    private async checkInResponse(
    workflowId: string,
): Promise<CheckInResponse> {
    const workflow =
        await this.workflowRepository.findByIdOrThrow(
            workflowId,
        );

    if (!workflow.visitorId || !workflow.visitId) {
        throw new AppError(
            "Workflow is in an inconsistent state.",
            500,
        );
    }

    const visitor =
        await this.visitorService.getVisitor(
            workflow.visitorId,
        );

    const visit =
        await this.visitService.getVisit(
            workflow.visitId,
        );

    const visitorData: VisitorResponseDto = {
        ...visitor,
        emails: visitor.emails.map(e => e.email),
        mobiles: visitor.mobiles.map(m => m.mobile),
    };

    return {
        visitor: visitorData,
        visit,
    };
}
}