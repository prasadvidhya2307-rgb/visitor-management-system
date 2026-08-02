import { PrismaClient, Media, Prisma, MediaStatus } from "@prisma/client";

export class MediaRepository {
    constructor(
        private readonly prisma: PrismaClient
    ) { }

    /**
     * Create media
     */
    public async create(
        tx: Prisma.TransactionClient,
        data: Prisma.MediaCreateInput
    ): Promise<Media> {
        return tx.media.create({
            data,
        });
    }

    /**
     * Find media by id
     */
    public async findById(
        id: string
    ): Promise<Media | null> {
        return this.prisma.media.findUnique({
            where: {
                id,
            },
        });
    }

    public async findAll() {
        return this.prisma.media.findMany({
            orderBy: { createdAt: "desc" },
            include: {
                visitors: { select: { id: true, visitorCode: true, firstName: true, lastName: true } },
                adminProfile: { select: { id: true, email: true, fullName: true } },
                employeeProfile: { select: { id: true, firstName: true, lastName: true, department: true } },
                checkInVisit: { select: { id: true, visitorId: true, checkInAt: true } },
                checkOutVisit: { select: { id: true, visitorId: true, checkOutAt: true } },
            },
        });
    }

    /**
     * Update media status
     */
    public async updateStatus(
        tx: Prisma.TransactionClient,
        id: string,
        status: MediaStatus
    ): Promise<Media> {
        return tx.media.update({
            where: {
                id,
            },
            data: {
                status,
            },
        });
    }

    public async delete(
        tx: Prisma.TransactionClient,
        id: string,
    ): Promise<void> {
        await tx.media.delete({
            where: {
                id,
            },
        });
    }
}
