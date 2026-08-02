import { Request, Response } from "express";
import { ApiResponse } from "../../utils/api-response.js";
import { EmployeeService } from "./employee.service.js";
import {
    CreateEmployeeDto,
    UpdateEmployeeDto,
} from "./employee.types.js";
import { asyncHandler } from "../../utils/async-handler.js";
import { MediaService } from "../media/media.service.js";
import { AppError } from "../../utils/app-error.js";

export class EmployeeController {
    constructor(
        private readonly employeeService: EmployeeService,
        private readonly mediaService: MediaService,
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
    public updateProfileImage = asyncHandler(async (req: Request<{ employeeId: string }>, res: Response) => {
        if (!req.file) throw new AppError("Employee image is required.", 400);
        const media = await this.mediaService.createTemporary(req.file);
        const employee = await this.employeeService.updateProfileImage(req.params.employeeId, media.id);
        await this.mediaService.markActive(media.id);
        return ApiResponse.success(res, "Employee image updated successfully.", employee);
    });
}
