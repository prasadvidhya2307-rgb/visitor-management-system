import { FaceApiResponseBody } from "../face-recognised/face-recognition.types.js";
import { VisitResponseDto } from "../visit/visit.types.js";
import { VisitorResponseDto } from "../visitors/visitor.types.js";

export interface CheckOutResponseData {
    visitor: VisitorResponseDto;
    visit: VisitResponseDto;
}

export type CheckOutResponse =
    FaceApiResponseBody<CheckOutResponseData>;