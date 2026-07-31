import {
    Employee,
    Prisma,
    PrismaClient,
} from "../../generated/prisma/client";
import { AppError } from "../../utils/app-error.js";

export class EmployeeRepository {
    constructor(
        private readonly prisma: PrismaClient,
    ) { }

    public async create(
        tx: Prisma.TransactionClient,
        data: Prisma.EmployeeCreateInput,
    ): Promise<Employee> {
        return tx.employee.create({
            data,
        });
    }

    public async update(
        tx: Prisma.TransactionClient,
        id: string,
        data: Prisma.EmployeeUpdateInput,
    ): Promise<Employee> {
        return tx.employee.update({
            where: {
                id,
            },
            data,
        });
    }

    public async findById(
        id: string,
    ): Promise<Employee | null> {
        return this.prisma.employee.findFirst({
            where: {
                id,
                isDeleted: false,
            },
        });
    }

    public async findByIdOrThrow(
        id: string,
    ): Promise<Employee> {
        const employee = await this.findById(id);

        if (!employee) {
            throw new AppError(
                "Employee not found.",
                404,
            );
        }

        return employee;
    }

    public async findByEmail(
        email: string,
    ): Promise<Employee | null> {
        return this.prisma.employee.findFirst({
            where: {
                email,
                isDeleted: false,
            },
        });
    }

    public async findByMobile(
        mobile: string,
    ): Promise<Employee | null> {
        return this.prisma.employee.findFirst({
            where: {
                mobile,
                isDeleted: false,
            },
        });
    }

    public async findAll(): Promise<Employee[]> {
        return this.prisma.employee.findMany({
            where: {
                isDeleted: false,
            },
            orderBy: [
                {
                    firstName: "asc",
                },
                {
                    lastName: "asc",
                },
            ],
        });
    }

    public async softDelete(
        tx: Prisma.TransactionClient,
        id: string,
    ): Promise<Employee> {
        return tx.employee.update({
            where: {
                id,
            },
            data: {
                isActive: false,
                isDeleted: true,
                deletedAt: new Date(),
            },
        });
    }
}