import { ErrorRequestHandler } from 'express'
import { AppError } from '../utils/app-error.js'
import { ApiResponse } from '../utils/api-response.js'
import { WorkflowError } from './workflow.error.js';
import { Prisma } from '@prisma/client';



export const errorMiddleware: ErrorRequestHandler = (
    error,
    _req,
    res,
    _next,
) => {


    console.error("ERROR:", error);

    if (error instanceof WorkflowError) {
        return ApiResponse.error(
            res,
            error.message,
            error.statusCode,
            {
                workflowId: error.workflowId,
                currentStep: error.currentStep,
            },
        );
    }

    if (error instanceof AppError) {
        return ApiResponse.error(
            res,
            error.message,
            error.statusCode,
            error.data
        )
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
        switch (error.code) {
            case "P2025":
                return ApiResponse.error(res, "Resource not found.", 404);

            case "P2003":
                return ApiResponse.error(res, "Related record not found.", 400);

            case "P2014":
                return ApiResponse.error(res, "This record is still referenced elsewhere and cannot be modified.", 409);

            default:
                return ApiResponse.error(res, "Invalid request.", 400);
        }
    }

    return res.status(500).json({
        success: false,
        message: "intrenal server error"
    })

}