import cv2
import numpy as np
from fastapi import HTTPException


def decode_image(image_bytes: bytes) -> np.ndarray:

    image_array = np.frombuffer(
        image_bytes,
        dtype=np.uint8,
    )

    image = cv2.imdecode(
        image_array,
        cv2.IMREAD_COLOR,
    )

    if image is None:
        raise HTTPException(
            status_code=400,
            detail="Invalid image.",
        )

    return image