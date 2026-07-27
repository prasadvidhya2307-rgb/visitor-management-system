import { Request, Response } from "express";
import { asyncHandler } from "../../utils/async-handler";
import { VisitorService } from "./visitor.service";
import { ApiResponse } from "../../utils/api-response";
import { createVisitorDto, updateVisitorDto } from "./visitor.types";

export class VisitorController {
    constructor(
        private readonly visitorService: VisitorService
    ) { }


    public createVisitor = asyncHandler(
        async (
            req: Request<{}, {}, createVisitorDto>,
            res: Response
        ) => {
            const visitor = await this.visitorService.createVisitor(req.body)

            return ApiResponse.success(
                res,
                "visitor created successfully",
                visitor,
            )
        }
    )

    public getVisitor = asyncHandler(
        async (
            req: Request<{ id: string }>,
            res: Response
        ) => {
            const visitor = await this.visitorService.getVisitor(req.params.id)
            return ApiResponse.success(
                res,
                "visitor fetched successfully",
                visitor
            )
        }
    )

    public getAllVistors = asyncHandler(
        async (
            _req: Request,
            res: Response
        ) => {
            const visitors = await this.visitorService.getVisitors()

            return ApiResponse.success(
                res,
                "visitors fetched successfully",
                visitors,
            );
        }
    )

    public updateVisitor = asyncHandler(
        async (
            req: Request<{ id: string }, {}, updateVisitorDto>,
            res: Response
        ) => {
            const vistor = await this.visitorService.updateVisitor(
                req.params.id,
                req.body
            )

            return ApiResponse.success(
                res,
                "vistor updated successfully",
                vistor
            )
        }
    )

    public deleteVisitor = asyncHandler(
        async (
            req: Request<{ id: string }>,
            res: Response
        ) => {
            await this.visitorService.deleteVisitor(req.params.id)

            return ApiResponse.success(
                res,
                "vistor deleted successfully",
                null
            )
        }
    )
}