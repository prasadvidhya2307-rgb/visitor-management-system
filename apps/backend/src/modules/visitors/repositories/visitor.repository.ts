import { PrismaClient, Visitor, Prisma } from "../../../generated/prisma/client";

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
    ): Promise<Visitor | null> {
        return this.prisma.visitor.findFirst({
            where: {
                id,
                isDeleted: false,
            },
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
            orderBy: {
                createdAt: "desc",
            },
        });
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
}