import { PrismaClient, Media, Prisma, MediaStatus } from "../../generated/prisma/client";

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