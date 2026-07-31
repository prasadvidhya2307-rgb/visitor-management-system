import { ErrorRequestHandler } from 'express'
import { AppError } from '../utils/app-error.js'
import { ApiResponse } from '../utils/api-response.js'
import { WorkflowError } from './workflow.error.js';



export const errorMiddleware: ErrorRequestHandler = (
    error,
    req,
    res,
    next,
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

    return res.status(500).json({
        success: false,
        message: "intrenal server error"
    })

}