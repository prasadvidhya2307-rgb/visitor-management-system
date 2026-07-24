import { Request, Response } from 'express'
import { ApiResponse } from '../../utils/api-response.js'


export class healthController {
    static check(_: Request, res: Response) {
        return ApiResponse.success(res, "healthy")
    }
}