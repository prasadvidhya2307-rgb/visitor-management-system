import {
    PrismaClient,
    Visit,
} from "../../generated/prisma/client";

import { VisitRepository } from "./visit.repository";
import { CreateVisitDto } from "./visit.types";

export class VisitService {
    constructor(
        private readonly prisma: PrismaClient,
        private readonly visitRepository: VisitRepository,
    ) { }

    public async createVisit(
        visitorId: string,
        dto: CreateVisitDto,
    ): Promise<Visit> {
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
}