import { Request, Response } from "express";

import { AuthService } from "./auth.service.js";
import {
    ChangePasswordDto,
    LoginDto,
    UpdateProfileDto,
} from "./auth.types.js";

import { ApiResponse } from "../../utils/api-response.js";
import { asyncHandler } from "../../utils/async-handler.js";
import { AppError } from "../../utils/app-error.js";

export class AuthController {
    constructor(
        private readonly authService: AuthService,
    ) {}

    public login = asyncHandler(
        async (req: Request, res: Response) => {
            const dto = req.body as LoginDto;

            const result =
                await this.authService.login(
                    dto,
                );

            return ApiResponse.success(
                res,
                "Login successful.",
                result,
            );
        },
    );

    public me = asyncHandler(
        async (req: Request, res: Response) => {
            const result =
                await this.authService.getCurrentAdmin(
                    req.admin.id,
                );

            return ApiResponse.success(
                res,
                "Admin fetched successfully.",
                result,
            );
        },
    );

    public changePassword = asyncHandler(
        async (req: Request, res: Response) => {
            const dto =
                req.body as ChangePasswordDto;

            await this.authService.changePassword(
                req.admin.id,
                dto,
            );

            return ApiResponse.success(
                res,
                "Password changed successfully.",
            );
        },
    );

    public updateProfile = asyncHandler(async (req: Request, res: Response) => {
        const result = await this.authService.updateProfile(req.admin.id, req.body as UpdateProfileDto);
        return ApiResponse.success(res, "Profile updated successfully.", result);
    });

    public updateProfileImage = asyncHandler(async (req: Request, res: Response) => {
        if (!req.file) throw new AppError("Profile image is required.", 400);
        return ApiResponse.success(res, "Profile image updated successfully.", await this.authService.updateProfileImage(req.admin.id, req.file));
    });
}
