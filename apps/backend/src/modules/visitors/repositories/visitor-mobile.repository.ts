import { PrismaClient, VisitorMobile } from "../../../generated/prisma/client";

export class VisitorMobileRepository {
    constructor(
        private readonly prisma: PrismaClient
    ){}

    public async findByVisitorId(
        visitorId: string,
    ): Promise<VisitorMobile[]> {
        return this.prisma.visitorMobile.findMany({
            where: { visitorId },
            orderBy: { isPrimary: 'desc'}
        })
    }
}