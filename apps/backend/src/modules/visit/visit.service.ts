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
} from "./visit.types";

export class VisitService {
    constructor(
        private readonly prisma: PrismaClient,
        private readonly visitRepository: VisitRepository,
        private readonly employeeRepository: EmployeeRepository,
    ) {}

    /**
     * Create visit
     */
    public async createVisit(
        visitorId: string,
        dto: CreateVisitDto,
    ): Promise<Visit> {
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
    ): Promise<Visit> {
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
}