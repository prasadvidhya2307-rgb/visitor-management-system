// export interface ValidationError {
//     field: string;
//     message: string;
// }

export class AppError<T = unknown> extends Error {
    constructor(
        message: string,
        public readonly statusCode: number,
        public readonly data?: T,
    ) {
        super(message);
        Error.captureStackTrace(this, this.constructor);
    }
}
