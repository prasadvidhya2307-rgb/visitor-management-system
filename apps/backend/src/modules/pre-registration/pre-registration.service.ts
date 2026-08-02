import { PrismaClient, PreRegistrationStatus, PreRegistration } from "@prisma/client";
import { AppError } from "../../utils/app-error.js";
import { EmployeeService } from "../employee/employee.service.js";
import { PreRegistrationRepository } from "./pre-registration.repository.js";
import {
    CreatePreRegistrationDto,
    PreRegistrationResponseDto,
    UpdatePreRegistrationDto,
} from "./pre-registration.types.js";

export class PreRegistrationService {
    constructor(
        private readonly prisma: PrismaClient,
        private readonly preRegistrationRepository: PreRegistrationRepository,
        private readonly employeeService: EmployeeService,
    ) { }

    public async createPreRegistration(
        dto: CreatePreRegistrationDto,
    ): Promise<PreRegistration> {
        await this.employeeService.getEmployee(
            dto.hostEmployeeId,
        );

        const preRegistration =
            await this.preRegistrationRepository.create(
                this.prisma,
                {
                    ...dto,
                    status: PreRegistrationStatus.PENDING,
                },
            );

        return this.getPreRegistration(
            preRegistration.id,
        );
    }

    public async updatePreRegistration(
        id: string,
        dto: UpdatePreRegistrationDto,
    ): Promise<PreRegistration> {
        const preRegistration =
            await this.preRegistrationRepository.findByIdOrThrow(
                id,
            );

        if (
            preRegistration.status !==
            PreRegistrationStatus.PENDING
        ) {
            throw new AppError(
                "Only pending pre-registrations can be updated.",
                409,
            );
        }

        if (dto.hostEmployeeId) {
            await this.employeeService.getEmployee(
                dto.hostEmployeeId,
            );
        }

        await this.preRegistrationRepository.update(
            this.prisma,
            id,
            dto,
        );

        return this.getPreRegistration(id);
    }

    public async getPreRegistration(
        id: string,
    ): Promise<PreRegistration> {
        return this.preRegistrationRepository.findByIdOrThrow(
            id,
        );
    }

    public async getPreRegistrations(): Promise<
        PreRegistration[]
    > {
        return this.preRegistrationRepository.findAll();
    }

    public async cancelPreRegistration(
        id: string,
    ): Promise<PreRegistration> {
        const preRegistration =
            await this.preRegistrationRepository.findByIdOrThrow(
                id,
            );

        if (
            preRegistration.status ===
            PreRegistrationStatus.CHECKED_IN
        ) {
            throw new AppError(
                "Cannot cancel a checked-in pre-registration.",
                409,
            );
        }

        if (
            preRegistration.status ===
            PreRegistrationStatus.CANCELLED
        ) {
            throw new AppError(
                "Pre-registration is already cancelled.",
                409,
            );
        }

        await this.preRegistrationRepository.cancel(
            this.prisma,
            id,
        );

        return this.getPreRegistration(id);
    }

    public async completePreRegistration(id: string, visitorId: string) {
        const item = await this.getPreRegistration(id);
        if (item.status !== PreRegistrationStatus.PENDING) throw new AppError("Only pending pre-registrations can be checked in.", 409);
        return this.preRegistrationRepository.complete(this.prisma, id, visitorId);
    }
}
