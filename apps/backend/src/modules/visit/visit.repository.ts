import { Prisma, PrismaClient, Visit } from "../../generated/prisma/client";

export class VisitRepository {
    constructor(private readonly prisma: PrismaClient) { }

    /**
     * Create a new visit
     */
    public async create(
        tx: Prisma.TransactionClient,
        data: Prisma.VisitCreateInput,
    ): Promise<Visit> {
        return tx.visit.create({
            data,
        });
    }

    /**
     * Find visit by id
     */
    public async findById(id: string): Promise<Visit | null> {
        return this.prisma.visit.findUnique({
            where: {
                id,
            },
        });
    }

    /**
     * Find all visits
     */
    public async findAll(): Promise<Visit[]> {
        return this.prisma.visit.findMany({
            orderBy: {
                createdAt: "desc",
            },
        });
    }

    /**
     * Update visit
     */
    public async updateById(
        tx: Prisma.TransactionClient,
        id: string,
        data: Prisma.VisitUpdateInput,
    ): Promise<Visit> {
        return tx.visit.update({
            where: {
                id,
            },
            data,
        });
    }

    /**
     * Delete visit
     */
    public async deleteById(
        tx: Prisma.TransactionClient,
        id: string,
    ): Promise<Visit> {
        return tx.visit.delete({
            where: {
                id,
            },
        });
    }
}
