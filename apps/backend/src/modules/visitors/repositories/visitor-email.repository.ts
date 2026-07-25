import { PrismaClient, VisitorEmail } from "../../../generated/prisma/client";

export class VisitorEmailRepository {
    constructor(
        private readonly prisma: PrismaClient
    ){}

    public async findByVisitorId(
        visitorId: string
    ): Promise<VisitorEmail[]> {
        return this.prisma.visitorEmail.findMany({
            where: { visitorId },
            orderBy: {isPrimary: "desc"}
        })
    }
}