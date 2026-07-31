import { PrismaClient, VisitorMobile, Prisma } from "@prisma/client";

export class VisitorMobileRepository {
    constructor(
        private readonly prisma: PrismaClient
    ) { }

    public async createMany(
        tx: Prisma.TransactionClient,
        data: Prisma.VisitorMobileCreateManyInput[]
    ): Promise<void> {
        await tx.visitorMobile.createMany({
            data
        })
    }

    public async findByVisitorId(
        visitorId: string,
    ): Promise<VisitorMobile[]> {
        return this.prisma.visitorMobile.findMany({
            where: { visitorId },
            orderBy: { isPrimary: 'desc' }
        })
    }

    public async updateById(
        tx: Prisma.TransactionClient,
        id: string,
        data: Prisma.VisitorMobileUpdateInput
    ): Promise<VisitorMobile> {
        return tx.visitorMobile.update({
            where: { id },
            data,
        });
    }

    public async deleteByVisitorId(
        tx: Prisma.TransactionClient,
        visitorId: string
    ): Promise<void> {
        await tx.visitorMobile.deleteMany({
            where: {
                visitorId,
            },
        });
    }

}