from fastapi import HTTPException, UploadFile

from app.core.config import settings
from app.services.embedding import generate_embedding
from app.services.vector_db import VectorDB
from app.utils.image import decode_image


class FaceService:

    @staticmethod
    async def _extract_embedding(
        image: UploadFile,
    ) -> list[float]:

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

        return embedding

    @staticmethod
    async def register(
        employee_id: str,
        image: UploadFile,
    ) -> dict:

        embedding = await FaceService._extract_embedding(image)

        VectorDB.store_embedding(
            employee_id=employee_id,
            embedding=embedding,
        )

        return {
            "success": True,
            "message": "Face registered successfully.",
            "employee_id": employee_id,
        }

    @staticmethod
    async def recognize(
        image: UploadFile,
    ) -> dict:

        embedding = await FaceService._extract_embedding(image)

        results = VectorDB.search_embedding(
            embedding=embedding,
        )

        if not results:
            return {
                "success": True,
                "matched": False,
                "message": "No matching employee found.",
            }

        match = results[0]

        if match.score < settings.FACE_MATCH_THRESHOLD:
            return {
                "success": True,
                "matched": False,
                "message": "Unknown person.",
                "score": round(match.score, 4),
            }

        return {
            "success": True,
            "matched": True,
            "employee_id": match.payload["employee_id"],
            "score": round(match.score, 4),
        }