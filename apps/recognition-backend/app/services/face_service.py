from fastapi import UploadFile

from app.core.codes import ResponseCode
from app.core.config import settings
from app.core.exceptions import FaceServiceException
from app.schemas.recognition import RecognizeData
from app.schemas.register import RegisterData
from app.schemas.response import ApiResponse
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
            raise FaceServiceException(
                code=ResponseCode.INVALID_IMAGE,
                message="Only JPG and PNG images are allowed.",
            )

        image_bytes = await image.read()

        if not image_bytes:
            raise FaceServiceException(
                code=ResponseCode.INVALID_IMAGE,
                message="Image is empty.",
            )

        cv_image = decode_image(image_bytes)

        return generate_embedding(cv_image)

    @staticmethod
    async def register(
        person_id: str,
        image: UploadFile,
    ) -> ApiResponse[RegisterData]:

        existing = VectorDB.get_by_person_id(person_id)

        if existing:
            return ApiResponse(
                success=True,
                code=ResponseCode.ALREADY_REGISTERED,
                message="Face is already registered for this person.",
                data=RegisterData(
                    personId=person_id,
                ),
            )

        embedding = await FaceService._extract_embedding(image)

        results = VectorDB.search_embedding(
            embedding=embedding,
        )

        if results:
            match = results[0]

            if (
                match.score >= settings.FACE_DUPLICATE_THRESHOLD
                and match.payload["person_id"] != person_id
            ):
                raise FaceServiceException(
                    code=ResponseCode.DUPLICATE_FACE,
                    message="This face is already registered with another person.",
                    status_code=409,
                )

        try:
            VectorDB.store_embedding(
                person_id=person_id,
                embedding=embedding,
            )

        except Exception as error:
            raise FaceServiceException(
                code=ResponseCode.TEMPORARY_ERROR,
                message="Unable to register the face at the moment.",
                status_code=503,
            ) from error

        return ApiResponse(
            success=True,
            code=ResponseCode.CREATED,
            message="Face registered successfully.",
            data=RegisterData(
                personId=person_id,
            ),
        )

    @staticmethod
    async def recognize(
        image: UploadFile,
    ) -> ApiResponse[RecognizeData]:

        embedding = await FaceService._extract_embedding(image)

        results = VectorDB.search_embedding(
            embedding=embedding,
        )

        if not results:
            return ApiResponse(
                success=True,
                code=ResponseCode.NO_MATCH,
                message="Face not recognized.",
                data=RecognizeData(
                    matched=False,
                    personId=None,
                    score=None,
                ),
            )

        match = results[0]

        if match.score < settings.FACE_MATCH_THRESHOLD:
            return ApiResponse(
                success=True,
                code=ResponseCode.NO_MATCH,
                message="Face not recognized.",
                data=RecognizeData(
                    matched=False,
                    personId=None,
                    score=round(match.score, 4),
                ),
            )

        return ApiResponse(
            success=True,
            code=ResponseCode.MATCH_FOUND,
            message="Face recognized successfully.",
            data=RecognizeData(
                matched=True,
                personId=match.payload["person_id"],
                score=round(match.score, 4),
            ),
        )