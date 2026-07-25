import { Prisma, PrismaClient, VisitorCounter } from "../../../generated/prisma/client";

export class visitorCounterRepository {
    constructor(
        private readonly prisma: PrismaClient
    ){}

    public async findByYear(
        year: number
    ): Promise<VisitorCounter | null > {
        return this.prisma.visitorCounter.findUnique({
            where: { year }
        })
    }

    /**
     * create counter for new year
    */
    public async create(
        tx: Prisma.TransactionClient,
        data: Prisma.VisitorCounterCreateInput
    ): Promise<VisitorCounter> {
        return tx.visitorCounter.create({
            data
        })
    }

    /**
     *increament counter 
    */
    public async increament(
        tx: Prisma.TransactionClient,
        year: number
    ): Promise<VisitorCounter> {
        return tx.visitorCounter.update({
            where: {
                year,
            },
            data: {
                lastSequence: {
                    increment: 1
                }
            }
        })
    }
}