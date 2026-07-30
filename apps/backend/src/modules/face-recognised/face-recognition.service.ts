import FormData from "form-data";

import { fastApiClient } from "../../lib/fastApi";
import { FAST_API_ENDPOINTS } from "../../constants/endpoints";
import { AppError } from "../../utils/app-error";

import {
    FaceRecognitionResponseToNode,
    FaceRegistrationResponse,
} from "./face-recognition.types";

export class FaceRecognitionService {
    public async recognize(
        image: Express.Multer.File,
    ): Promise<FaceRecognitionResponseToNode> {
        if (!image) {
            throw new AppError("Image is required.", 400);
        }

        const form = new FormData();

        form.append("image", image.buffer, {
            filename: image.originalname,
            contentType: image.mimetype,
        });

        const { data } = await fastApiClient.post<FaceRecognitionResponseToNode>(
            FAST_API_ENDPOINTS.FACE.recognize,
            form,
            { headers: form.getHeaders() },
        );
        return data;
    }

    public async registerFace(
        personId: string,
        image: Express.Multer.File,
    ): Promise<FaceRegistrationResponse> {
        if (!image) {
            throw new AppError("Image is required.", 400);
        }

        const form = new FormData();

        form.append("image", image.buffer, {
            filename: image.originalname,
            contentType: image.mimetype,
        });

        const { data } = await fastApiClient.post<FaceRegistrationResponse>(
            FAST_API_ENDPOINTS.FACE.register(personId),
            form,
            {
                headers: form.getHeaders(),
            },
        );

        return data;
    }
}
