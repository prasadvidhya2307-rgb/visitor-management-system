import { PrismaClient, Visitor } from '../../../generated/prisma/client'

export class VisitorRepository {
    constructor(
        private readonly prisma: PrismaClient
    ) {}

    public async findById(
        id: string
    ): Promise<Visitor | null> {
        return this.prisma.visitor.findUnique({
            where: { id }
        })
    }

    public async findAll(): Promise<Visitor[]> {
        return this.prisma.visitor.findMany({
            orderBy: { createdAt: 'desc' }
        })
    }
}