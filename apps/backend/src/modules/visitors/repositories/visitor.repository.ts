import { PrismaClient, Visitor, Prisma, RegistrationStatus } from "@prisma/client";
import { VisitorResponseDto } from "../visitor.types";

export class VisitorRepository {
    constructor(
        private readonly prisma: PrismaClient
    ) { }

    /**
     * Create a new visitor
     */
    public async create(
        tx: Prisma.TransactionClient,
        data: Prisma.VisitorCreateInput
    ): Promise<Visitor> {
        return tx.visitor.create({
            data,
        });
    }

    /**
     * Find visitor by id
     */
    public async findById(
        id: string
    ) {
        return this.prisma.visitor.findFirst({
            where: {
                id,
                isDeleted: false,
            },

            include: {
                emails: {
                    select: {
                        email: true
                    }
                },
                mobiles: {
                    select: {
                        mobile: true
                    }
                },
                registrationImage: {
                    select: {
                        filePath: true
                    }
                },
            }
        });
    }

    /**
     * Find visitor by identity number
     */
    public async findByIdentityNumber(
        identityNumber: string
    ): Promise<Visitor | null> {
        return this.prisma.visitor.findFirst({
            where: {
                identityNumber,
                isDeleted: false,
            },
        });
    }

    /**
     * Find all visitors
     */
    public async findAll(): Promise<Visitor[]> {
        return this.prisma.visitor.findMany({
            where: {
                isDeleted: false,
            },

            include: {
                registrationImage: {
                    select: {
                        filePath: true,
                    }
                }
            },

            orderBy: {
                createdAt: "desc",
            },
        });
    }

    /**
     * get all active vistors
    */
    public async getAllActiveVisitor(
        tx?: Prisma.TransactionClient
    ): Promise<Visitor[]> {
        const client = tx ?? this.prisma
        return await client.visitor.findMany({
            where: {
                isActive: true
            }
        })
    }

    /**
     * Update visitor
     */
    public async updateById(
        tx: Prisma.TransactionClient,
        id: string,
        data: Prisma.VisitorUpdateInput
    ): Promise<Visitor> {
        return tx.visitor.update({
            where: {
                id,
            },
            data,
        });
    }


    /**
     * Soft delete visitor
     */
    public async softDeleteById(
        tx: Prisma.TransactionClient,
        id: string
    ): Promise<Visitor> {
        return tx.visitor.update({
            where: {
                id,
            },
            data: {
                isDeleted: true,
                deletedAt: new Date(),
            },
        });
    }

    public async getAllDeleted() {

        return this.prisma.visitor.findMany({
            where: {
                isDeleted: true
            },

            include: {
                emails: {
                    select: {
                        email: true
                    }
                },
                mobiles: {
                    select: {
                        mobile: true
                    }
                },
            }
        })

    }

    public async rollbackRegistration(
        id: string
    ): Promise<void> {
        await this.prisma.visitor.delete({
            where: { id }
        })
    }
}