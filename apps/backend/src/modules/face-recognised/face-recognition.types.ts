
/**
 * we have 2 types:
 * 1. node <---> fast api (contains peronId inside data)
 * 2. node <---> frontend (we will add visitor inside data in controller layer)
 */
import { createVisitorDto, VisitorResponseDto } from "../visitors/visitor.types.js";

export enum FaceRecognitionCode {
  CREATED = "CREATED",
  ALREADY_REGISTERED = "ALREADY_REGISTERED",

  MATCH_FOUND = "MATCH_FOUND",
  NO_MATCH = "NO_MATCH",

  INVALID_IMAGE = "INVALID_IMAGE",
  NO_FACE = "NO_FACE",
  MULTIPLE_FACES = "MULTIPLE_FACES",
  FACE_TOO_SMALL = "FACE_TOO_SMALL",
  DUPLICATE_FACE = "DUPLICATE_FACE",

  TEMPORARY_ERROR = "TEMPORARY_ERROR",
  INTERNAL_ERROR = "INTERNAL_ERROR",
}

export interface FaceApiResponseBody<T> {
  success: Boolean;
  message: string;
  data: T | null
  code: FaceRecognitionCode;
}

export interface FaceBackendResponseToNodeRecognizeData {
  matched: boolean;
  personId: string | null;
  score: number | null;
}

export interface NodeResponseToFrontendRecognizeData {
  matched: boolean;
  visitor: VisitorResponseDto | null;
  score: number | null
}

export interface RegisterData {
  personId: string;
}

export type FaceRecognitionResponseToNode = FaceApiResponseBody<FaceBackendResponseToNodeRecognizeData>;
export type FaceRecognitionResponseToFrontend = FaceApiResponseBody<NodeResponseToFrontendRecognizeData>
export type FaceRegistrationResponse = FaceApiResponseBody<RegisterData>;
