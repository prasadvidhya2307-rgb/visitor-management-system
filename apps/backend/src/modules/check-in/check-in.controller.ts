import { Request, Response } from "express";
import { asyncHandler } from "../../utils/async-handler.js";
import { AppError } from "../../utils/app-error.js";
import { ApiResponse } from "../../utils/api-response.js";
import { WorkflowService } from "../workflow/workflow.service.js";
import { CheckInService } from "./check-in.service.js";
import { CreateVisitDto } from "../visit/visit.types.js";

export class CheckInController {
    constructor(
        private readonly workflowService: WorkflowService,
        private readonly checkInService: CheckInService
    ) { }

    public checkIn = asyncHandler(async (req: Request, res: Response) => {
        if (!req.file) {
            throw new AppError("image is required", 400);
        }

        const result = await this.workflowService.start(
            req.body,
            req.file
        );

        return ApiResponse.success(
            res,
            "visitor checked in successfully",
            result
        );

    });

    public existingCheckIn = asyncHandler(
        async (req: Request<{ visitorId: string }>, res: Response) => {
            const { visitorId } = req.params;

            const dto = req.body as CreateVisitDto;

            const result =
                await this.checkInService.existingCheckIn(
                    visitorId,
                    dto,
                );

            return ApiResponse.created(
                res,
                "visitor checked in successfully.",
                result,
            );
        },
    );

    public existingCheckInWithImage = asyncHandler(async (req: Request<{ visitorId: string }>, res: Response) => {
        if (!req.file) throw new AppError("Check-in image is required.", 400);
        const result = await this.checkInService.existingCheckInWithImage(req.params.visitorId, req.body as CreateVisitDto, req.file);
        return ApiResponse.created(res, "Visitor checked in successfully.", result);
    });
}
