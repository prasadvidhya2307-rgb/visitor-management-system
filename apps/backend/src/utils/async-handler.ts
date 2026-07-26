import {
    NextFunction,
    Request,
    RequestHandler,
    Response,
} from "express";
import { ParsedQs } from "qs";

export const asyncHandler = <
    P = Record<string, string>,
    ResBody = any,
    ReqBody = any,
    ReqQuery = ParsedQs,
    Locals extends Record<string, any> = Record<string, any>
>(
    handler: (
        req: Request<P, ResBody, ReqBody, ReqQuery, Locals>,
        res: Response<ResBody, Locals>,
        next: NextFunction
    ) => Promise<unknown>
): RequestHandler<P, ResBody, ReqBody, ReqQuery, Locals> => {
    return (req, res, next) => {
        Promise.resolve(handler(req, res, next)).catch(next);
    };
};