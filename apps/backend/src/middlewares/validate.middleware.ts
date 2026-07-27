import { NextFunction, Response, Request } from "express";
import { ZodType } from "zod";
import { AppError } from "../utils/app-error";

export const validate = (schema: ZodType) =>
    (req: Request, res: Response, next: NextFunction) => {
        const result = schema.safeParse(req.body)

        if (!result.success) {
            const errors = result.error.issues.map((issue) => ({
                field: issue.path.join("."),
                message: issue.message
            }))

            return next(
                new AppError(
                    "vaidation failed",
                    400,
                    errors
                )
            )
        }

        req.body = result.data
        next()
    }