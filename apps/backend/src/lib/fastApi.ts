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
                "face recognition service is not reachable",
                503
            )
        }

        throw new AppError(
            (error.response.data as { message?: string })?.message ??
            "face recognition request failed",
            error.response.status
        )
    }

)