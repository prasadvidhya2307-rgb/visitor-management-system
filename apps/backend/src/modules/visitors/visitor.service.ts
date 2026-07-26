import { Prisma, PrismaClient } from "../../generated/prisma/client";
import { AppError } from "../../utils/app-error";
import { visitorCounterRepository } from "./repositories/visitor-counter.repository";
import { VisitorEmailRepository } from "./repositories/visitor-email.repository";
import { VisitorMobileRepository } from "./repositories/visitor-mobile.repository";
import { VisitorRepository } from "./repositories/visitor.repository";
import { createVisitorDto, updateVisitorDto } from "./visitor.types";

export class VisitorService {
    constructor(
        private readonly prisma: PrismaClient,
        private readonly visitorRepository: VisitorRepository,
        private readonly visitorEmailRepository: VisitorEmailRepository,
        private readonly visitorMobileRepository: VisitorMobileRepository,
        private readonly visitorCounterRepository: visitorCounterRepository
    ) { }

    /**
     * Create visitor
     */
    public async createVisitor(dto: createVisitorDto) {
        await this.validateDuplicateIdentity(dto.identityNumber);

        return this.prisma.$transaction(async (tx) => {
            const visitorCode = await this.generateVistorCode(tx);

            const visitor = await this.visitorRepository.create(tx, {
                visitorCode,
                firstName: dto.firstName,
                lastName: dto.lastName,
                identityType: dto.identityType,
                identityNumber: dto.identityNumber
            });

            if (dto.mobiles.length > 0) {
                await this.visitorMobileRepository.createMany(
                    tx,
                    dto.mobiles.map((mobile) => ({
                        visitorId: visitor.id,
                        mobile: mobile.mobile,
                        isPrimary: mobile.isPrimary
                    }))
                );
            }

            if (dto.emails.length > 0) {
                await this.visitorEmailRepository.createMany(
                    tx,
                    dto.emails.map((email) => ({
                        visitorId: visitor.id,
                        email: email.email,
                        isPrimary: email.isPrimary
                    }))
                );
            }

            return visitor;
        });
    }

    /**
     * Get visitor by id
     */
    public async getVisitor(id: string) {
        const visitor = await this.visitorRepository.findById(id);

        if (!visitor) {
            throw new AppError("visitor not found", 404);
        }

        return visitor;
    }

    /**
     * Get all visitors
     */
    public async getVisitors() {
        return await this.visitorRepository.findAll();
    }

    /**
     * Update visitor
     */
    public async updateVisitor(
        id: string,
        dto: updateVisitorDto
    ) {
        const existingVisitor = await this.visitorRepository.findById(id);

        if (!existingVisitor) {
            throw new AppError(
                "visitor not found",
                404
            );
        }

        if (dto.identityNumber !== undefined) {
            await this.validateDuplicateIdentity(
                dto.identityNumber,
                id
            );
        }

        const {
            emails,
            mobiles,
            ...visitorData
        } = dto;

        await this.prisma.$transaction(async (tx) => {
            await this.visitorRepository.updateById(
                tx,
                id,
                visitorData
            );

            if (mobiles) {
                await this.visitorMobileRepository.deleteByVisitorId(
                    tx,
                    id
                );

                await this.visitorMobileRepository.createMany(
                    tx,
                    mobiles.map((mobile) => ({
                        visitorId: id,
                        mobile: mobile.mobile,
                        isPrimary: mobile.isPrimary,
                    }))
                );
            }

            if (emails) {
                await this.visitorEmailRepository.deleteByVisitorId(
                    tx,
                    id
                );

                await this.visitorEmailRepository.createMany(
                    tx,
                    emails.map((email) => ({
                        visitorId: id,
                        email: email.email,
                        isPrimary: email.isPrimary,
                    }))
                );
            }
        });

        return await this.getVisitor(id);
    }

    /**
     * Soft delete visitor
     */
    public async deleteVisitor(
        id: string
    ): Promise<void> {
        const visitor = await this.visitorRepository.findById(id);

        if (!visitor) {
            throw new AppError(
                "visitor not found",
                404
            );
        }

        await this.prisma.$transaction(async (tx) => {
            await this.visitorRepository.softDeleteById(
                tx,
                id
            );
        });
    }

    /**
     * =====================================================================
     * Private Helper Functions
     * =====================================================================
     */

    private async validateDuplicateIdentity(
        identityNumber: string,
        excludeVisitorId?: string
    ) {
        const visitor =
            await this.visitorRepository.findByIdentityNumber(
                identityNumber
            );

        if (!visitor) return;

        if (
            excludeVisitorId &&
            visitor.id === excludeVisitorId
        ) {
            return;
        }

        throw new AppError(
            "duplicate identity number not allowed",
            409
        );
    }

    private async generateVistorCode(
        tx: Prisma.TransactionClient
    ): Promise<string> {
        const currentYear = new Date().getFullYear();

        let counter =
            await this.visitorCounterRepository.findByYear(
                currentYear
            );

        if (!counter) {
            counter =
                await this.visitorCounterRepository.create(tx, {
                    year: currentYear,
                    lastSequence: 0
                });
        }

        counter =
            await this.visitorCounterRepository.increament(
                tx,
                currentYear
            );

        const yearPrefix = currentYear
            .toString()
            .slice(-2);

        const sequence = counter.lastSequence
            .toString()
            .padStart(5, "0");

        return `${yearPrefix}${sequence}`;
    }
}