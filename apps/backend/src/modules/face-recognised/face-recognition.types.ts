export interface RecognizedResponse {
    success: true;
    matched: true;
    person_id: string;
    score: number;
}

export interface UnrecognizedResponse {
    success: true;
    matched: false;
    person_id: null;
    score: number | null;
}

export type FaceRecognitionResponse =
    | RecognizedResponse
    | UnrecognizedResponse;