import { Response } from "express";
import { FaceRecognitionCode } from "../modules/face-recognised/face-recognition.types.js";

export class ApiResponse {

    private static serialize<T>(data: T): T {
        return JSON.parse(JSON.stringify(data, (_key, value) =>
            typeof value === "bigint" ? value.toString() : value,
        ));
    }

    static success<T>(
        res: Response,
        message: string,
        data?: T,
        statusCode = 200
    ) {
        return res.status(statusCode).json({
            success: true,
            message: message,
            data: data == null ? null : this.serialize(data)
        })
    }

    static created<T>(
        res: Response,
        message: string,
        data?: T,
    ) {
        return this.success(res, message, data, 201)
    }

    static error<T>(
        res: Response,
        message: string,
        statusCode = 500,
        data?: T,
    ) {
        return res.status(statusCode).json({
            success: false,
            message,
            data: data == null ? null : this.serialize(data),
        });
    }
}

export class FaceApiResponse {

    static success<T>(
        res: Response,
        message: string,
        code: FaceRecognitionCode,
        data?: T,
        statusCode = 200
    ) {

        return res.status(statusCode).json({
            success: true,
            message,
            code,
            data: data == null ? null : JSON.parse(JSON.stringify(data, (_key, value) => typeof value === "bigint" ? value.toString() : value)),
        })

    }

    static error<T>(
        res: Response,
        code: FaceRecognitionCode,
        message: string,
        statusCode = 500,
        data?: T,
    ) {
        return res.status(statusCode).json({
            success: false,
            code,
            message,
            data: data == null ? null : JSON.parse(JSON.stringify(data, (_key, value) => typeof value === "bigint" ? value.toString() : value)),
        });
    }

}
