import { WorkflowStep } from "@prisma/client";
import { AppError } from "../utils/app-error.js";

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