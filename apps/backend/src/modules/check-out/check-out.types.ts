import { FaceApiResponseBody } from "../face-recognised/face-recognition.types";
import { VisitResponseDto } from "../visit/visit.types";
import { VisitorResponseDto } from "../visitors/visitor.types";

export interface CheckOutResponseData {
    visitor: VisitorResponseDto;
    visit: VisitResponseDto;
}

export type CheckOutResponse =
    FaceApiResponseBody<CheckOutResponseData>;