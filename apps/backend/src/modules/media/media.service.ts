import fs from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";

import {
    Media,
    MediaStatus,
    PrismaClient,
} from "../../generated/prisma/client";

import { MediaRepository } from "./media.repository.js";

export class MediaService {
    private readonly registrationDirectory = path.join(
        process.cwd(),
        "storage",
        "media",
        "registration",
    );

    constructor(
        private readonly mediaRepository: MediaRepository,
        private readonly prisma: PrismaClient,
    ) { }

    public async createTemporary(file: Express.Multer.File): Promise<Media> {
        return this.prisma.$transaction(async (tx) => {
            await fs.mkdir(this.registrationDirectory, {
                recursive: true,
            });

            const extension = path.extname(file.originalname);

            const fileName = `${randomUUID()}${extension}`;

            const absolutePath = path.join(this.registrationDirectory, fileName);

            const relativePath = path.join("registration", fileName);

            await fs.writeFile(absolutePath, file.buffer);

            return this.mediaRepository.create(tx, {
                fileName,
                mimeType: file.mimetype,
                fileSize: file.size,
                filePath: relativePath,
                status: MediaStatus.TEMPORARY,
            });
        });
    }

    public async markActive(mediaId: string): Promise<void> {
        await this.prisma.$transaction(async (tx) => {
            await this.mediaRepository.updateStatus(tx, mediaId, MediaStatus.ACTIVE);
        });
    }

    public async deleteTemporary(mediaId: string): Promise<void> {
        const media = await this.mediaRepository.findById(mediaId);

        if (!media) {
            return;
        }

        const absolutePath = path.join(
            process.cwd(),
            "storage",
            "media",
            media.filePath,
        );

        try {
            await fs.unlink(absolutePath);
        } catch {
            // Ignore if file does not exist
        }

        await this.prisma.$transaction(async (tx) => {
            await this.mediaRepository.delete(tx, mediaId);
        });
    }
}
