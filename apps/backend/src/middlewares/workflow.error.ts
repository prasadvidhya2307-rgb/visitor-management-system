import { WorkflowStep } from "../generated/prisma/client";
import { AppError } from "../utils/app-error";

export class WorkflowError extends AppError {
    constructor(
        public readonly workflowId: string,
        public readonly currentStep: WorkflowStep,
        message: string,
        statusCode = 500,
    ) {
        super(message, statusCode);
    }
}