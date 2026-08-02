import { string } from "zod";
import { FaceApiResponseBody, FaceRecognitionCode } from "../face-recognised/face-recognition.types.js";
import { VisitResponseDto } from "../visit/visit.types.js";
import { VisitorResponseDto } from "../visitors/visitor.types.js";

export interface CheckOutResponse {
    message: string;
    matched: boolean;
    code: FaceRecognitionCode;
    score: number;
    visitor: VisitorResponseDto | null;
    visit: VisitResponseDto | null;
}