export interface RecognizedVisitorResponse {
    recognized: true;
    confidence: number;
    visitorId: string;
}

export interface UnrecognizedVisitorResponse {
    recognized: false;
    confidence: number;
    visitorId: null;
}

export type FaceRecognitionResponse =
    | RecognizedVisitorResponse
    | UnrecognizedVisitorResponse;