import { Request, Response } from "express";
import { ApiResponse } from "../../utils/api-response";
import { EmployeeService } from "./employee.service";
import {
    CreateEmployeeDto,
    UpdateEmployeeDto,
} from "./employee.types";
import { asyncHandler } from "../../utils/async-handler";

export class EmployeeController {
    constructor(
        private readonly employeeService: EmployeeService,
    ) { }

    public createEmployee = asyncHandler(
        async (req: Request, res: Response) => {
            const dto =
                req.body as CreateEmployeeDto;

            const employee =
                await this.employeeService.createEmployee(
                    dto,
                );

            return ApiResponse.created(
                res,
                "Employee created successfully.",
                employee,
            );
        },
    );

    public getEmployees = asyncHandler(
        async (_req: Request, res: Response) => {
            const employees =
                await this.employeeService.getEmployees();

            return ApiResponse.success(
                res,
                "Employees fetched successfully.",
                { employees },
            );
        },
    );

    public getEmployee = asyncHandler(
        async (req: Request<{ employeeId: string }>, res: Response) => {
            const employee =
                await this.employeeService.getEmployee(
                    req.params.employeeId,
                );

            return ApiResponse.success(
                res,
                "Employee fetched successfully.",
                employee,
            );
        },
    );

    public updateEmployee = asyncHandler(
        async (req: Request<{ employeeId: string }>, res: Response) => {
            const dto =
                req.body as UpdateEmployeeDto;

            const employee =
                await this.employeeService.updateEmployee(
                    req.params.employeeId,
                    dto,
                );

            return ApiResponse.success(
                res,
                "Employee updated successfully.",
                employee,
            );
        },
    );

    public deleteEmployee = asyncHandler(
        async (req: Request<{ employeeId: string }>, res: Response) => {
            await this.employeeService.deleteEmployee(
                req.params.employeeId,
            );

            return ApiResponse.success(
                res,
                "Employee deleted successfully.",
                null,
            );
        },
    );
}