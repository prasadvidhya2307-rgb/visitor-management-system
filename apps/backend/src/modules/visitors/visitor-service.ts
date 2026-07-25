import { PrismaClient } from "../../generated/prisma/client";
import { visitorCounterRepository } from "./repositories/visitor-counter.repository";
import { VisitorEmailRepository } from "./repositories/visitor-email.repository";
import { VisitorMobileRepository } from "./repositories/visitor-mobile.repository";
import { VisitorRepository } from "./repositories/visitor.repository";

export class VisitorService {
    constructor(
        private readonly prisma: PrismaClient,
        private readonly visitorRepository: VisitorRepository,
        private readonly visitorEmailRepository: VisitorEmailRepository,
        private readonly visitorMobileRepository: VisitorMobileRepository,
        private readonly visitorCounterRepository: visitorCounterRepository
    ){}

    public async createVisitor() {}
}