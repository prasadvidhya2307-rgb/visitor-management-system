import axios, { AxiosError } from "axios";
import { env } from "../config/env";
import { AppError } from "../utils/app-error";

export const fastApiClient = axios.create({
    baseURL: env.FASTAPI_URL,
    timeout: 10000
})

fastApiClient.interceptors.response.use(
    response => response,
    (error: AxiosError) => {

        if (!error.response) {
            throw new AppError(
                "Face recognition service is not reachable.",
                503
            );
        }

        const data = error.response.data as {
            detail?: string;
            message?: string;
        };

        console.log('data message', data.message)

        throw new AppError(
            data.detail ??
            data.message ??
            "Face recognition request failed.",
            error.response.status
        );
    }
);