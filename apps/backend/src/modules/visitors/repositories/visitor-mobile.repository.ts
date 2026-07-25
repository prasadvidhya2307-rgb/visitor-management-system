import { PrismaClient, VisitorMobile, Prisma } from "../../../generated/prisma/client";

export class VisitorMobileRepository {
    constructor(
        private readonly prisma: PrismaClient
    ){}

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
            orderBy: { isPrimary: 'desc'}
        })
    }
}