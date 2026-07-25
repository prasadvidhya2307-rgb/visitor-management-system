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

    public async createVisitor(dto: createVisitorDto) {
        await this.validateDuplicateIdentity(dto.identityNumber);

        // start the transaction 
        return this.prisma.$transaction(async (tx) => {
            const visitorCode = await this.generateVistorCode(tx)

            // create visitor
            const visitor = await this.visitorRepository.create(tx, {
                visitorCode: visitorCode,
                firstName: dto.firstName,
                lastName: dto.lastName,
                identityType: dto.identityType,
                identityNumber: dto.identityNumber
            })

            // create mobile
            if (dto.mobiles.length > 0) {
                await this.visitorMobileRepository.createMany(
                    tx,
                    dto.mobiles.map((mobile) => (
                        {
                            visitorId: visitor.id,
                            mobile: mobile.mobile,
                            isPrimary: mobile.isPrimary
                        }
                    ))
                )
            }

            // create email
            if (dto.emails.length > 0) {
                await this.visitorEmailRepository.createMany(
                    tx,
                    dto.emails.map((email => ({
                        visitorId: visitor.id,
                        email: email.email,
                        isPrimary: email.isPrimary
                    })))
                )
            }
            return visitor
        })

    }

    /**
     * get visitor by id
    */
    public async getVisitor(id: string) {
        const visitor = await this.visitorRepository.findById(id);

        if(!visitor) {
            throw new AppError(
                "visitor not found",
                404
            )
        }

        return visitor
    }

    /**
     * get all visitors
    */
    public async getVisitors() {
        return await this.visitorRepository.findAll()
    }

    /**
     * update visitor
     */
    public async updateVisitor(
        id: string,
        dto: updateVisitorDto
    ) {
        const existingVisitor = await this.visitorRepository.findById(id)

        if(!existingVisitor) {
            throw new AppError(
                "visitor not found",
                404
            )
        }

        

    }

    /**
     *Private Helper Functions =============================================
     */

    private async validateDuplicateIdentity(
        identityNumber: string
    ) {
        const visitor = await this.visitorRepository.findByIdenityNumber(identityNumber);

        if (visitor) {
            throw new AppError(
                "duplicate identitty number not allowed",
                409
            )
        }
    }

    private async generateVistorCode(
        tx: Prisma.TransactionClient
    ): Promise<string> {
        const currentYear = new Date().getFullYear()
        let counter = await this.visitorCounterRepository.findByYear(currentYear)

        if (!counter) {
            counter = await this.visitorCounterRepository.create(tx, {
                year: currentYear,
                lastSequence: 0
            })
        }

        // increament the counter
        counter = await this.visitorCounterRepository.increament(
            tx,
            currentYear
        )

        // generate a counter
        const yearPrefix = currentYear.toString().slice(-2)
        const sequence = counter.lastSequence
            .toString()
            .padStart(5, '0')

        return `${yearPrefix}${sequence}`
    }
}