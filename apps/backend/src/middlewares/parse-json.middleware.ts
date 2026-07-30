import { RequestHandler } from "express";
import { AppError } from "../utils/app-error";

export const parseJson = (field: string): RequestHandler =>
    (req, _res, next) => {
        const value = req.body[field];

        if (value === undefined) {
            return next(
                new AppError(`${field} is required`, 400)
            );
        }

        if (typeof value !== "string") {
            return next(
                new AppError(`${field} must be a JSON string.`, 400)
            );
        }

        try {
            req.body[field] = JSON.parse(value);
            next();
        } catch {
            next(
                new AppError(`${field} must be valid JSON.`, 400)
            );
        }
    }