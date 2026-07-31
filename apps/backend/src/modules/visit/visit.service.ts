import {
    PrismaClient,
    Visit,
} from "../../generated/prisma/client";

import { AppError } from "../../utils/app-error";
import { EmployeeRepository } from "../employee/employee.repository";
import { VisitRepository } from "./visit.repository";
import {
    CreateVisitDto,
    UpdateVisitDto,
    VisitResponseDto,
} from "./visit.types";

export class VisitService {
    constructor(
        private readonly prisma: PrismaClient,
        private readonly visitRepository: VisitRepository,
        private readonly employeeRepository: EmployeeRepository,
    ) { }

    /**
     * Create visit
     */
    public async createVisit(
        visitorId: string,
        dto: CreateVisitDto,
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
            return this.visitRepository.create(tx, {
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
            });
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

        return {
            id: visit.id,
            purpose: visit.purpose,
            floor: visit.floor,
            notes: visit.notes,
            status: visit.status,
            checkInAt: visit.checkInAt,
            checkOutAt: visit.checkOutAt,
            createdAt: visit.createdAt,
            updatedAt: visit.updatedAt
        }
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
    ): Promise<Visit> {
        await this.getVisit(visitId);

        return this.prisma.$transaction(async (tx) => {
            return this.visitRepository.checkout(
                tx,
                visitId,
            );
        });
    }
}