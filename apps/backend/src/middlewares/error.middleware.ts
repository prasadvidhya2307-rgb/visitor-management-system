import { ErrorRequestHandler } from 'express'
import { AppError } from '../utils/app-error'
import { ApiResponse } from '../utils/api-response'



export const errorMiddleware: ErrorRequestHandler = (
    error,
    req,
    res,
    next,
) => {

    if (error instanceof AppError) {
        return ApiResponse.error(
            res,
            error.message,
            error.statusCode,
            error.errors
        )
    }

    return res.status(500).json({
        success: false,
        message: "intrenal server error"
    })

}