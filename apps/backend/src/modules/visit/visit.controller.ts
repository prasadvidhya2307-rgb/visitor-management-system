import { Request, Response } from "express";

import { asyncHandler } from "../../utils/async-handler";
import { ApiResponse } from "../../utils/api-response";

import { VisitService } from "./visit.service";
import {
    CreateVisitDto,
    UpdateVisitDto,
} from "./visit.types";

export class VisitController {
    constructor(
        private readonly visitService: VisitService,
    ) { }

    /**
     * Create a new visit
     */
    public createVisit = asyncHandler(
        async (
            req: Request<{ visitorId: string }>,
            res: Response,
        ) => {
            const { visitorId } = req.params;

            const dto =
                req.body as CreateVisitDto;

            const visit =
                await this.visitService.createVisit(
                    visitorId,
                    dto,
                );

            return ApiResponse.created(
                res,
                "Visit created successfully.",
                visit,
            );
        },
    );

    /**
     * Get all visits
     */
    public getVisits = asyncHandler(
        async (_req: Request, res: Response) => {
            const visits =
                await this.visitService.getVisits();

            return ApiResponse.success(
                res,
                "Visits fetched successfully.",
                visits,
            );
        },
    );

    /**
     * Get visit by id
     */
    public getVisit = asyncHandler(
        async (
            req: Request<{ visitId: string }>,
            res: Response,
        ) => {
            const visit =
                await this.visitService.getVisit(
                    req.params.visitId,
                );

            return ApiResponse.success(
                res,
                "Visit fetched successfully.",
                visit,
            );
        },
    );

    /**
     * Get all visits of a visitor
     */
    public getVisitorVisits = asyncHandler(
        async (
            req: Request<{ visitorId: string }>,
            res: Response,
        ) => {
            const visits =
                await this.visitService.getVisitorVisits(
                    req.params.visitorId,
                );

                console.log('visits of a visitor', visits)

            return ApiResponse.success(
                res,
                "Visitor visits fetched successfully.",
                { visits },
            );
        },
    );

    /**
     * Update visit
     */
    public updateVisit = asyncHandler(
        async (
            req: Request<{ visitId: string }>,
            res: Response,
        ) => {
            const dto =
                req.body as UpdateVisitDto;

            const visit =
                await this.visitService.updateVisit(
                    req.params.visitId,
                    dto,
                );

            return ApiResponse.success(
                res,
                "Visit updated successfully.",
                visit,
            );
        },
    );

    /**
     * Delete visit
     */
    public deleteVisit = asyncHandler(
        async (
            req: Request<{ visitId: string }>,
            res: Response,
        ) => {
            await this.visitService.deleteVisit(
                req.params.visitId,
            );

            return ApiResponse.success(
                res,
                "Visit deleted successfully.",
                null,
            );
        },
    );
}