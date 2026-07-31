import { Request, Response } from "express";
import { asyncHandler } from "../../utils/async-handler";
import { AppError } from "../../utils/app-error";
import { ApiResponse } from "../../utils/api-response";
import { WorkflowService } from "../workflow/workflow.service";
import { CheckInService } from "./check-in.service";
import { CreateVisitDto } from "../visit/visit.types";

export class CheckInController {
    constructor(
        private readonly workflowService: WorkflowService,
        private readonly checkInService: CheckInService
    ) { }

    public checkIn = asyncHandler(async (req: Request, res: Response) => {
        if (!req.file) {
            throw new AppError("image is required", 400);
        }

        console.log("1");

        const result = await this.workflowService.start(
            req.body,
            req.file
        );

        console.log("2");
        console.log(result);

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
}
