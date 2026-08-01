import { Request, Response } from "express";
import { asyncHandler } from "../../utils/async-handler.js";
import { DashboardService } from "./dashboard.service.js";
import { ApiResponse } from "../../utils/api-response.js";

export class DashboardController {
    constructor(
        private readonly dashboardService: DashboardService
    ) { }

    public getDashboard = asyncHandler(
        async (_req: Request, res: Response) => {
            const dashboard = await this.dashboardService.getDashboard();

            return ApiResponse.success(
                res,
                "Dashboard data fetched successfully.",
                { dashboard },
            );
        }
    )

}