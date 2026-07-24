from fastapi import HTTPException, UploadFile

from app.utils.image import decode_image
from app.services.embedding import generate_embedding
from app.services.vector_db import VectorDB


class FaceService:

    @staticmethod
    async def register(
        employee_id: str,
        image: UploadFile,
    ):

        if image.content_type not in (
            "image/jpeg",
            "image/png",
            "image/jpg",
        ):
            raise HTTPException(
                status_code=400,
                detail="Only JPG and PNG images are allowed.",
            )

        image_bytes = await image.read()

        if not image_bytes:
            raise HTTPException(
                status_code=400,
                detail="Image is empty.",
            )

        cv_image = decode_image(image_bytes)

        embedding = generate_embedding(cv_image)

        VectorDB.store_embedding(
            employee_id=employee_id,
            embedding=embedding,
        )

        return {
            "success": True,
            "message": "Face registered successfully.",
            "employee_id": employee_id,
        }