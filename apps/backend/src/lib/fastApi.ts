import axios, { AxiosError } from "axios";
import { env } from "../config/env";
import { AppError } from "../utils/app-error";
import { FaceApiResponseBody } from "../modules/face-recognised/face-recognition.types";

export const fastApiClient = axios.create({
  baseURL: env.FASTAPI_URL,
  timeout: 10000,
});

fastApiClient.interceptors.response.use(
  (response) => response,

  (error: AxiosError<FaceApiResponseBody<unknown>>) => {
    if (!error.response) {
      throw new AppError(
        "Face recognition service is not reachable.",
        503,
      );
    }

    const body = error.response.data;

    console.log(error.response)

    throw new AppError(
      body?.message ?? "Face recognition service error.",
      error.response.status,
      {
        code: body?.code
      }
    );
  },
);