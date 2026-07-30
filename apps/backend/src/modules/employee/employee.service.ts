import {
    Employee,
    PrismaClient,
} from "../../generated/prisma/client";
import { AppError } from "../../utils/app-error";
import { EmployeeRepository } from "./employee.repository";
import {
    CreateEmployeeDto,
    EmployeeResponseDto,
    UpdateEmployeeDto,
} from "./employee.types";

export class EmployeeService {
    constructor(
        private readonly prisma: PrismaClient,
        private readonly employeeRepository: EmployeeRepository,
    ) { }

    public async createEmployee(
        dto: CreateEmployeeDto,
    ): Promise<EmployeeResponseDto> {
        const emailExists =
            await this.employeeRepository.findByEmail(
                dto.email,
            );

        if (emailExists) {
            throw new AppError(
                "Employee with this email already exists.",
                409,
            );
        }

        const mobileExists =
            await this.employeeRepository.findByMobile(
                dto.mobile,
            );

        if (mobileExists) {
            throw new AppError(
                "Employee with this mobile already exists.",
                409,
            );
        }

        const employee =
            await this.prisma.$transaction(async (tx) => {
                return this.employeeRepository.create(
                    tx,
                    dto,
                );
            });

        return employee;
    }

    public async updateEmployee(
        employeeId: string,
        dto: UpdateEmployeeDto,
    ): Promise<EmployeeResponseDto> {
        const employee =
            await this.employeeRepository.findByIdOrThrow(
                employeeId,
            );

        if (
            dto.email &&
            dto.email !== employee.email
        ) {
            const emailExists =
                await this.employeeRepository.findByEmail(
                    dto.email,
                );

            if (emailExists) {
                throw new AppError(
                    "Employee with this email already exists.",
                    409,
                );
            }
        }

        if (
            dto.mobile &&
            dto.mobile !== employee.mobile
        ) {
            const mobileExists =
                await this.employeeRepository.findByMobile(
                    dto.mobile,
                );

            if (mobileExists) {
                throw new AppError(
                    "Employee with this mobile already exists.",
                    409,
                );
            }
        }

        return this.prisma.$transaction(async (tx) => {
            return this.employeeRepository.update(
                tx,
                employeeId,
                dto,
            );
        });
    }

    public async getEmployee(
        employeeId: string,
    ): Promise<EmployeeResponseDto> {
        return this.employeeRepository.findByIdOrThrow(
            employeeId,
        );
    }

    public async getEmployees(): Promise<EmployeeResponseDto[]> {
        return this.employeeRepository.findAll();
    }

    public async deleteEmployee(
        employeeId: string,
    ): Promise<void> {
        await this.employeeRepository.findByIdOrThrow(
            employeeId,
        );

        await this.prisma.$transaction(async (tx) => {
            await this.employeeRepository.softDelete(
                tx,
                employeeId,
            );
        });
    }
}