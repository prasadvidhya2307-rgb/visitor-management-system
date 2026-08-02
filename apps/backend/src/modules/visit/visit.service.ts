import {
    PrismaClient,
    Visit,
} from "@prisma/client";

import { AppError } from "../../utils/app-error.js";
import { EmployeeRepository } from "../employee/employee.repository.js";
import { VisitRepository } from "./visit.repository.js";
import {
    CreateVisitDto,
    UpdateVisitDto,
    VisitResponseDto,
} from "./visit.types";
import { visitorService } from "../../container/index.js";
import { VisitorService } from "../visitors/visitor.service.js";

export class VisitService {
    constructor(
        private readonly prisma: PrismaClient,
        private readonly visitRepository: VisitRepository,
        private readonly employeeRepository: EmployeeRepository,
        private readonly visitorService: VisitorService
    ) { }

    /**
     * Create visit
     */
    public async createVisit(
        visitorId: string,
        dto: CreateVisitDto,
        checkInImageId?: string,
    ): Promise<Visit> {
        const activeVisit =
            await this.visitRepository.findActiveVisit(
                visitorId,
            );

        if (activeVisit) {
            throw new AppError(
                "Visitor is already checked in.",
                409,
            );
        }

        const employee =
            await this.employeeRepository.findById(
                dto.hostEmployeeId,
            );

        if (!employee) {
            throw new AppError(
                "Host employee not found.",
                404,
            );
        }

        return this.prisma.$transaction(async (tx) => {
            const visit = await this.visitRepository.create(tx, {
                visitor: {
                    connect: {
                        id: visitorId,
                    },
                },

                hostEmployee: {
                    connect: {
                        id: dto.hostEmployeeId,
                    },
                },

                purpose: dto.purpose,
                floor: dto.floor,
                notes: dto.notes,
                ...(checkInImageId ? { checkInImage: { connect: { id: checkInImageId } } } : {}),
            });
            await this.visitorService.activateVisitor(visitorId, tx);
            return visit;
        });
    }

    /**
     * Get visit by id
     */
    public async getVisit(
        visitId: string,
    ): Promise<VisitResponseDto> {
        const visit =
            await this.visitRepository.findById(
                visitId,
            );

        if (!visit) {
            throw new AppError(
                "Visit not found.",
                404,
            );
        }

        return visit;
    }

    /**
     * Get all visits
     */
    public async getVisits(): Promise<Visit[]> {
        return this.visitRepository.findAll();
    }

    /**
     * Get all visits of a visitor
     */
    public async getVisitorVisits(
        visitorId: string,
    ): Promise<Visit[]> {
        return this.visitRepository.findByVisitorId(
            visitorId,
        );
    }

    /**
     * Update visit
     */
    public async updateVisit(
        visitId: string,
        dto: UpdateVisitDto,
    ): Promise<Visit> {
        await this.getVisit(visitId);

        if (dto.hostEmployeeId) {
            const employee =
                await this.employeeRepository.findById(
                    dto.hostEmployeeId,
                );

            if (!employee) {
                throw new AppError(
                    "Host employee not found.",
                    404,
                );
            }
        }

        return this.prisma.$transaction(async (tx) => {
            return this.visitRepository.updateById(
                tx,
                visitId,
                {
                    ...(dto.hostEmployeeId && {
                        hostEmployee: {
                            connect: {
                                id: dto.hostEmployeeId,
                            },
                        },
                    }),

                    ...(dto.purpose && {
                        purpose: dto.purpose,
                    }),

                    ...(dto.floor && {
                        floor: dto.floor,
                    }),

                    ...(dto.notes !== undefined && {
                        notes: dto.notes,
                    }),
                },
            );
        });
    }

    /**
     * Delete visit
     */
    public async deleteVisit(
        visitId: string,
    ): Promise<void> {
        await this.getVisit(visitId);

        await this.prisma.$transaction(async (tx) => {
            await this.visitRepository.deleteById(
                tx,
                visitId,
            );
        });
    }

    /**
 * Get active visit of a visitor
 */
    public async getActiveVisit(
        visitorId: string,
    ): Promise<Visit> {
        const visit =
            await this.visitRepository.findActiveVisit(
                visitorId,
            );

        if (!visit) {
            throw new AppError(
                "No active visit found.",
                404,
            );
        }

        return visit;
    }

    /**
 * Checkout visitor
 */
    public async checkoutVisit(
        visitId: string,
        visitorId: string,
        checkOutImageId?: string,
    ): Promise<Visit> {
        return this.prisma.$transaction(async (tx) => {
            const visit = await this.visitRepository.checkout(
                tx,
                visitId,
                checkOutImageId,
            );

            await this.visitorService.deactivateVisitor(
                visitorId,
                tx,
            );

            return visit;
        });
    }

    public async markBadgePrinted(visitId: string) {
        await this.getVisit(visitId);
        return this.visitRepository.markBadgePrinted(visitId);
    }
}
