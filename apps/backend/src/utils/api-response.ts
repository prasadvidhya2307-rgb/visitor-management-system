import { Response } from "express";

export class ApiResponse {

    static success<T>(
        res: Response,
        message: string,
        data?: T,
        statusCode = 200
    ) {
        return res.status(statusCode).json({
            success: true,
            message: message,
            data: data ?? null
        })
    }

    static error(
        res: Response,
        message: string,
        statusCode = 500,
        errors?: unknown
    ) {
        return res.status(statusCode).json({
            success: false,
            message,
            errors: errors ?? null,
        });
    }







}