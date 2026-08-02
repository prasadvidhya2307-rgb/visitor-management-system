import { NextFunction, Request, Response } from "express";
import { verifyAccessToken } from "../modules/auth/jwt.js";
import { AppError } from "../utils/app-error.js";
import { authRepository } from "../container/index.js";

export const authenticate = async (
    req: Request,
    _: Response,
    next: NextFunction,
): Promise<void> => {
    try {
        const authorization =
            req.headers.authorization;

        if (
            !authorization ||
            !authorization.startsWith("Bearer ")
        ) {
            throw new AppError(
                "Unauthorized.",
                401,
            );
        }

        const token =
            authorization.substring(7);

        const payload =
            verifyAccessToken(token);

        const admin =
            await authRepository.getAdminById(
                payload.adminId,
            );

        if (!admin) {
            throw new AppError(
                "Unauthorized.",
                401,
            );
        }

        req.admin = {
            id: admin.id,
            email: admin.email,
        };

        next();
    } catch (error) {
        next(error);
    }
};