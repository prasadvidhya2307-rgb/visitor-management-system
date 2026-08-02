import { Request, Response } from "express";
import { MediaService } from "./media.service.js";
import { asyncHandler } from "../../utils/async-handler.js";
import { ApiResponse } from "../../utils/api-response.js";

export class MediaController {
    constructor(private readonly mediaService: MediaService) {}

    public getMedia = asyncHandler(async (req: Request<{ id: string }>, res: Response) => {
        const { media, absolutePath } = await this.mediaService.getMedia(req.params.id);
        res.type(media.mimeType);
        res.setHeader("Cache-Control", "private, max-age=3600");
        return res.sendFile(absolutePath);
    });
    public getAllMedia = asyncHandler(async (_req: Request, res: Response) =>
        ApiResponse.success(res, "Media fetched successfully.", await this.mediaService.getAllMedia()),
    );
}
