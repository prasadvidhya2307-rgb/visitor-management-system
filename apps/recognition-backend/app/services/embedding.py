from insightface.app import FaceAnalysis
import numpy as np

from app.core.codes import ResponseCode
from app.core.config import settings
from app.core.exceptions import FaceServiceException


face_app = FaceAnalysis(
    name=settings.MODEL_NAME,
    providers=["CPUExecutionProvider"],
)

face_app.prepare(
    ctx_id=0,
    det_size=(640, 640),
)


def generate_embedding(
    image: np.ndarray,
) -> list[float]:

    faces = face_app.get(image)

    if len(faces) == 0:
        raise FaceServiceException(
            code=ResponseCode.NO_FACE,
            message="No face detected.",
        )

    if len(faces) > 1:
        raise FaceServiceException(
            code=ResponseCode.MULTIPLE_FACES,
            message="Multiple faces detected.",
        )

    face = faces[0]

    x1, y1, x2, y2 = face.bbox

    if (
        (x2 - x1) < 80 or (y2 - y1) < 80
    ):
        raise FaceServiceException(
            code=ResponseCode.FACE_TOO_SMALL,
            message="Face is too small.",
        )

    embedding = face.embedding

    norm = np.linalg.norm(embedding)

    if norm == 0:
        raise FaceServiceException(
            code=ResponseCode.INTERNAL_ERROR,
            message="Failed to generate face embedding.",
            status_code=500,
        )

    embedding = embedding / norm

    return embedding.tolist()