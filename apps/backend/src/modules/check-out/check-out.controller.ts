import { Request, Response } from "express";

import { asyncHandler } from "../../utils/async-handler.js";
import { AppError } from "../../utils/app-error.js";
import { ApiResponse } from "../../utils/api-response.js";

import { CheckOutService } from "./check-out.service.js";

export class CheckOutController {
    constructor(
        private readonly checkOutService: CheckOutService,
    ) {}

    public checkOut = asyncHandler(
        async (req: Request, res: Response) => {
            if (!req.file) {
                throw new AppError(
                    "Image is required.",
                    400,
                );
            }

            const result =
                await this.checkOutService.checkOut(
                    req.file,
                );

            return ApiResponse.success(
                res,
                "Visitor checked out successfully.",
                result,
            );
        },
    );
}