import { PrismaClient, Visitor, Prisma } from '../../../generated/prisma/client'

export class VisitorRepository {
    constructor(
        private readonly prisma: PrismaClient
    ) {}

    /**
     * create a new visitor
    */
    public async create(
        tx: Prisma.TransactionClient,
        data: Prisma.VisitorCreateInput
    ): Promise<Visitor> {
        return tx.visitor.create({
            data
        })
    }

    /**
     * find a vistor by id 
    */
    public async findById(
        id: string
    ): Promise<Visitor | null> {
        return this.prisma.visitor.findUnique({
            where: { id }
        })
    }

    /**
     * find by indentity number
    */
   public async findByIdenityNumber(
    identityNumber: string
   ): Promise<Visitor | null> {
    return this.prisma.visitor.findUnique({
        where: { identityNumber }
    })
   }


    /**
     * find all visitors
    */
    public async findAll(): Promise<Visitor[]> {
        return this.prisma.visitor.findMany({
            orderBy: { createdAt: 'desc' }
        })
    }
}