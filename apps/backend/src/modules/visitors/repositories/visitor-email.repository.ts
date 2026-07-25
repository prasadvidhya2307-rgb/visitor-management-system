import { PrismaClient, VisitorEmail, Prisma} from "../../../generated/prisma/client";

export class VisitorEmailRepository {
    constructor(
        private readonly prisma: PrismaClient
    ){}

    public async createMany(
        tx: Prisma.TransactionClient,
        data: Prisma.VisitorEmailCreateManyInput[]
    ): Promise<void> {
        await tx.visitorEmail.createMany({
            data
        })
    }

    public async findByVisitorId(
        visitorId: string
    ): Promise<VisitorEmail[]> {
        return this.prisma.visitorEmail.findMany({
            where: { visitorId },
            orderBy: {isPrimary: "desc"}
        })
    }
}