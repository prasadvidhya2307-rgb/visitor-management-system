from fastapi import HTTPException
from insightface.app import FaceAnalysis
import numpy as np

from app.core.config import settings


face_app = FaceAnalysis(
    name=settings.MODEL_NAME,
    providers=["CPUExecutionProvider"],
)

face_app.prepare(
    ctx_id=0,
    det_size=(640, 640),
)


def generate_embedding(image: np.ndarray):

    faces = face_app.get(image)

    if len(faces) == 0:
        raise HTTPException(
            status_code=400,
            detail="No face detected.",
        )

    if len(faces) > 1:
        raise HTTPException(
            status_code=400,
            detail="Multiple faces detected.",
        )

    face = faces[0]

    x1, y1, x2, y2 = face.bbox

    if (x2 - x1) < 80 or (y2 - y1) < 80:
        raise HTTPException(
            status_code=400,
            detail="Face is too small.",
        )

    embedding = face.embedding

    embedding = embedding / np.linalg.norm(embedding)

    return embedding.tolist()