import { asyncHandler } from "../../utils/async-handler.js";
import { Request, Response } from 'express'
import { VisitorRegistrationService } from "./visitor-registration.service.js";
import { ApiResponse } from "../../utils/api-response.js";
import { AppError } from "../../utils/app-error.js";

export class VisitorRegistrationController {

    constructor(
        private readonly visitorRegistrationService: VisitorRegistrationService
    ) { }


    public register = asyncHandler(
        async (req: Request, res: Response) => {

            if (!req.file) {
                throw new AppError("Image is required.", 400);
            }

            const visitor =
                await this.visitorRegistrationService.register(
                    req.body,
                    req.file
                );

            return ApiResponse.success(
                res,
                "visitor registered successfully.",
                visitor,
                201
            );
        }
    );

}