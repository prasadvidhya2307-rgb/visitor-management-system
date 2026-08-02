import jwt from "jsonwebtoken";

import { env } from "../../config/env.js";
import { AppError } from "../../utils/app-error.js";

interface JwtPayload {
    adminId: string;
}


export const generateAccessToken = (
    adminId: string,
): string => {
    return jwt.sign(
        { adminId },
        env.JWT_SECRET,
        {
            expiresIn: env.JWT_EXPIRES_IN,
        },
    );
};

export const verifyAccessToken = (
    token: string,
): JwtPayload => {
    try {
        return jwt.verify(
            token,
            env.JWT_SECRET,
        ) as JwtPayload;
    } catch {
        throw new AppError(
            "Invalid or expired access token.",
            401,
        );
    }
};