from fastapi import APIRouter, File, UploadFile

from app.schemas.register import RegisterData
from app.schemas.response import ApiResponse
from app.services.face_service import FaceService

router = APIRouter(
    prefix="/face",
    tags=["Face"],
)


@router.post(
    "/register/{person_id}",
    status_code=201,
    response_model=ApiResponse[RegisterData],
)
async def register_face(
    person_id: str,
    image: UploadFile = File(...),
):
    return await FaceService.register(
        person_id=person_id,
        image=image,
    )