import { Request, Response } from "express";

import { asyncHandler } from "../../utils/async-handler";
import { AppError } from "../../utils/app-error";
import { ApiResponse } from "../../utils/api-response";

import { CheckOutService } from "./check-out.service";

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