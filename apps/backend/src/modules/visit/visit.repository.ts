import { Prisma, PrismaClient, Visit } from "@prisma/client";

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

            include: {
                hostEmployee: true
            }
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

            include: {
                hostEmployee: true
            }
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

    public async findByVisitorId(
        visitorId: string,
    ): Promise<Visit[]> {
        return this.prisma.visit.findMany({
            where: {
                visitorId,
            },
            orderBy: {
                createdAt: "desc",
            },

            include: {
                hostEmployee: true
            }
        });
    }

    /**
 * Find active visit of a visitor
 */
    public async findActiveVisit(
        visitorId: string,
    ): Promise<Visit | null> {
        return this.prisma.visit.findFirst({
            where: {
                visitorId,
                checkOutAt: null,
            },
            orderBy: {
                checkOutAt: "desc",
            },
        });
    }

    /**
     * Checkout a visit
     */
    public async checkout(
        tx: Prisma.TransactionClient,
        visitId: string,
    ): Promise<Visit> {
        return tx.visit.update({
            where: {
                id: visitId,
            },
            data: {
                checkOutAt: new Date(),
            },
        });
    }

}
