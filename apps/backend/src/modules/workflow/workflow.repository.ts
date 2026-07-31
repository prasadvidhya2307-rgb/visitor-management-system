import {
    Prisma,
    PrismaClient,
    VisitorRegistrationWorkflow,
    WorkflowStatus,
    WorkflowStep,
} from "../../generated/prisma/client";

import { AppError } from "../../utils/app-error.js";

export class WorkflowRepository {
    constructor(
        private readonly prisma: PrismaClient,
    ) { }

    /**
     * Create workflow
     */
    public async create(
        tx?: Prisma.TransactionClient,
    ): Promise<VisitorRegistrationWorkflow> {
        const db = tx ?? this.prisma;

        return db.visitorRegistrationWorkflow.create({
            data: {
                currentStep: WorkflowStep.CREATE_MEDIA,
            },
        });
    }

    /**
     * Find workflow by id
     */
    public async findById(
        id: string,
        tx?: Prisma.TransactionClient,
    ): Promise<VisitorRegistrationWorkflow | null> {
        const db = tx ?? this.prisma;

        return db.visitorRegistrationWorkflow.findUnique({
            where: {
                id,
            },
        });
    }

    /**
     * Find workflow or throw
     */
    public async findByIdOrThrow(
        id: string,
        tx?: Prisma.TransactionClient,
    ): Promise<VisitorRegistrationWorkflow> {
        const workflow = await this.findById(
            id,
            tx,
        );

        if (!workflow) {
            throw new AppError(
                "workflow not found",
                404,
            );
        }

        return workflow;
    }

    /**
     * Update workflow
     */
    public async update(
        id: string,
        data: Prisma.VisitorRegistrationWorkflowUncheckedUpdateInput,
        tx?: Prisma.TransactionClient,
    ): Promise<VisitorRegistrationWorkflow> {
        const db = tx ?? this.prisma;

        return db.visitorRegistrationWorkflow.update({
            where: {
                id,
            },
            data,
        });
    }

    /**
     * Delete workflow
     */
    public async delete(
        id: string,
        tx?: Prisma.TransactionClient,
    ): Promise<VisitorRegistrationWorkflow> {
        const db = tx ?? this.prisma;

        return db.visitorRegistrationWorkflow.delete({
            where: {
                id,
            },
        });
    }

    /**
     * Find failed workflows
     */
    public async findFailed(
        tx?: Prisma.TransactionClient,
    ): Promise<VisitorRegistrationWorkflow[]> {
        const db = tx ?? this.prisma;

        return db.visitorRegistrationWorkflow.findMany({
            where: {
                status: WorkflowStatus.FAILED,
            },
            orderBy: {
                updatedAt: "asc",
            },
        });
    }

    /**
 * Find failed workflow by identity number
 */
    public async findFailedWorkflow(
        identityNumber: string,
        tx?: Prisma.TransactionClient,
    ): Promise<VisitorRegistrationWorkflow | null> {
        const db = tx ?? this.prisma;

        return db.visitorRegistrationWorkflow.findFirst({
            where: {
                status: WorkflowStatus.FAILED,
                visitor: {
                    identityNumber,
                },
            },
            orderBy: {
                updatedAt: "desc",
            },
        });
    }
}