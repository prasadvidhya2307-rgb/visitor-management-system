import { Request, Response } from "express";
import { SettingsService } from "./settings.service.js";
import { asyncHandler } from "../../utils/async-handler.js";
import { ApiResponse } from "../../utils/api-response.js";

export class SettingsController {
    constructor(private readonly service: SettingsService) {}
    public get = asyncHandler(async (_req: Request, res: Response) => ApiResponse.success(res, "Settings fetched successfully.", await this.service.getSettings()));
    public update = asyncHandler(async (req: Request, res: Response) => ApiResponse.success(res, "Settings updated successfully.", await this.service.updateSettings(req.body)));
}
