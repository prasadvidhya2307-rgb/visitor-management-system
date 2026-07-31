import {
    PreRegistration,
    PreRegistrationStatus,
    Prisma,
    PrismaClient,
} from "../../generated/prisma/client";

import { AppError } from "../../utils/app-error.js";

export class PreRegistrationRepository {
    constructor(
        private readonly prisma: PrismaClient,
    ) { }

    public async create(
        tx: Prisma.TransactionClient,
        data: Prisma.PreRegistrationUncheckedCreateInput,
    ): Promise<PreRegistration> {
        return tx.preRegistration.create({
            data,
        });
    }

    public async update(
        tx: Prisma.TransactionClient,
        id: string,
        data: Prisma.PreRegistrationUncheckedUpdateInput,
    ): Promise<PreRegistration> {
        return tx.preRegistration.update({
            where: {
                id,
            },
            data,
        });
    }

    // public async findById(
    //     id: string,
    // ): Promise<PreRegistration | null> {
    //     return this.prisma.preRegistration.findUnique({
    //         where: {
    //             id,
    //         },
    //     });
    // }

    public async findByIdOrThrow(
        id: string,
    ): Promise<PreRegistration> {
        const preRegistration =
            await this.findById(id);

        if (!preRegistration) {
            throw new AppError(
                "Pre-registration not found.",
                404,
            );
        }

        return preRegistration;
    }

    public async findAll(): Promise<
        PreRegistration[]
    > {
        return this.prisma.preRegistration.findMany({
            include: {
                hostEmployee: true,
                visitor: true,
            },
            orderBy: {
                createdAt: "desc",
            },
        });
    }

    public async cancel(
        tx: Prisma.TransactionClient,
        id: string,
    ): Promise<PreRegistration> {
        return tx.preRegistration.update({
            where: {
                id,
            },
            data: {
                status: PreRegistrationStatus.CANCELLED,
            },
        });
    }

    public async delete(
        tx: Prisma.TransactionClient,
        id: string,
    ): Promise<PreRegistration> {
        return tx.preRegistration.delete({
            where: {
                id,
            },
        });
    }

    public async findActiveByVisitor(
        visitorId: string,
    ): Promise<PreRegistration | null> {
        return this.prisma.preRegistration.findFirst({
            where: {
                visitorId,
                status: PreRegistrationStatus.PENDING,
                validFrom: {
                    lte: new Date(),
                },
                validTo: {
                    gte: new Date(),
                },
            },
            orderBy: {
                createdAt: "desc",
            },
        });
    }

    public async findPendingById(
        id: string,
    ): Promise<PreRegistration | null> {
        return this.prisma.preRegistration.findFirst({
            where: {
                id,
                status: PreRegistrationStatus.PENDING,
                validFrom: {
                    lte: new Date(),
                },
                validTo: {
                    gte: new Date(),
                },
            },
        });
    }

    public async findById(
        id: string,
    ): Promise<PreRegistration | null> {
        return this.prisma.preRegistration.findUnique({
            where: {
                id,
            },
            include: {
                hostEmployee: true,
                visitor: true,
            },
        });
    }
}