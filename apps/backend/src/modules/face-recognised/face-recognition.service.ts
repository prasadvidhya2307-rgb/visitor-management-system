import FormData from "form-data";
import { fastApiClient } from "../../lib/fastApi";
import { FaceRecognitionResponse } from "./face-recognition.types";
import { AppError } from "../../utils/app-error";

export class FaceRecognitionService {

    public async recognize(
        file: Express.Multer.File
    ): Promise<FaceRecognitionResponse> {
        if (!file) {
            throw new AppError("Image is required.", 400);
        }

        const form = new FormData();

        form.append("image", file.buffer, {
            filename: file.originalname,
            contentType: file.mimetype,
        });

        const { data } =
            await fastApiClient.post<FaceRecognitionResponse>(
                "/face/recognize",
                form,
                {
                    headers: form.getHeaders(),
                }
            );

        return data;
    }

    public register = () => {}
}