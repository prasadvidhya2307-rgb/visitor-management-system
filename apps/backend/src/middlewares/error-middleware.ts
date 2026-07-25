import { ErrorRequestHandler } from 'express'
import { AppError } from '../utils/app-error'



export const errorMiddleware: ErrorRequestHandler = (
    error,
    req, 
    res, 
    next
) => {

    if(error instanceof AppError) {
        return res.status(error.statusCode).json({
            success: false,
            message: error.message,
        })
    }

    return res.status(500).json({
        success: false,
        message: "intrenal server error"
    })

}